# Custom MACP Langflow Dockerfile 
# Compatible with legacy Docker (no BuildKit required)

################################
# BUILDER-BASE
################################
FROM ghcr.io/astral-sh/uv:python3.12-bookworm-slim AS builder

WORKDIR /app

ENV UV_COMPILE_BYTECODE=1
ENV UV_LINK_MODE=copy
ENV RUSTFLAGS='--cfg reqwest_unstable'

RUN apt-get update \
    && apt-get upgrade -y \
    && apt-get install --no-install-recommends -y \
    build-essential \
    git \
    gcc \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# Copy project files
COPY ./uv.lock /app/uv.lock
COPY ./README.md /app/README.md
COPY ./pyproject.toml /app/pyproject.toml
COPY ./src/backend/base/README.md /app/src/backend/base/README.md
COPY ./src/backend/base/uv.lock /app/src/backend/base/uv.lock
COPY ./src/backend/base/pyproject.toml /app/src/backend/base/pyproject.toml
COPY ./src/lfx/README.md /app/src/lfx/README.md
COPY ./src/lfx/pyproject.toml /app/src/lfx/pyproject.toml

# Install Python dependencies (no cache mount)
RUN RUSTFLAGS='--cfg reqwest_unstable' \
    uv sync --frozen --no-install-project --no-editable --extra postgresql

# Copy source code
COPY ./src /app/src

# Copy PRE-BUILT MACP branded frontend
COPY ./src/frontend/build /app/src/backend/langflow/frontend

# Final sync with project
RUN RUSTFLAGS='--cfg reqwest_unstable' \
    uv sync --frozen --no-editable --extra postgresql

################################
# RUNTIME
################################
FROM python:3.12.3-slim AS runtime

RUN apt-get update \
    && apt-get upgrade -y \
    && apt-get install -y curl git libpq5 gnupg \
    && curl -fsSL https://deb.nodesource.com/setup_18.x | bash - \
    && apt-get install -y nodejs \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/* \
    && useradd user -u 1000 -g 0 --no-create-home --home-dir /app/data

COPY --from=builder --chown=1000 /app/.venv /app/.venv

ENV PATH="/app/.venv/bin:$PATH"

LABEL org.opencontainers.image.title=macp-langflow
LABEL org.opencontainers.image.authors=['Jing-Consulting']
LABEL org.opencontainers.image.licenses=MIT
LABEL org.opencontainers.image.url=https://github.com/Jing-Consulting/langflow
LABEL org.opencontainers.image.source=https://github.com/Jing-Consulting/langflow

USER user
WORKDIR /app

ENV LANGFLOW_HOST=0.0.0.0
ENV LANGFLOW_PORT=7860

CMD ["langflow", "run"]
