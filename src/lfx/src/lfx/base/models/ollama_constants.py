from .model_metadata import create_model_metadata

# Unified model metadata - single source of truth
# Note: Only models with default=True will show in the model selector by default
# Limited to 3 most advanced models per provider for UI conciseness
OLLAMA_MODELS_DETAILED = [
    # TOP 3 DEFAULTS
    create_model_metadata(
        provider="Ollama",
        name="llama3.3",
        icon="Ollama",
        tool_calling=True,
        default=True,  # Default 1/3 - Recommended
    ),
    create_model_metadata(
        provider="Ollama",
        name="qwq",
        icon="Ollama",
        tool_calling=True,
        default=True,  # Default 2/3 - Reasoning
    ),
    create_model_metadata(
        provider="Ollama",
        name="llama3.2",
        icon="Ollama",
        tool_calling=True,
        default=True,  # Default 3/3 - Stable
    ),
    # Additional models (not default)
    create_model_metadata(provider="Ollama", name="llama3.1", icon="Ollama", tool_calling=True),
    create_model_metadata(provider="Ollama", name="mistral", icon="Ollama", tool_calling=True),
    create_model_metadata(provider="Ollama", name="qwen2.5", icon="Ollama", tool_calling=True),
    create_model_metadata(provider="Ollama", name="mixtral", icon="Ollama", tool_calling=True),
    create_model_metadata(provider="Ollama", name="command-r-plus", icon="Ollama", tool_calling=True),
]

# Filter lists based on metadata properties
OLLAMA_TOOL_MODELS_BASE = [
    metadata["name"]
    for metadata in OLLAMA_MODELS_DETAILED
    if metadata.get("tool_calling", False) and not metadata.get("not_supported", False)
]

# Embedding models - following OpenAI's pattern of keeping these as a simple list
# https://ollama.com/search?c=embedding
OLLAMA_EMBEDDING_MODELS = [
    "nomic-embed-text",
    "mxbai-embed-large",
    "snowflake-arctic-embed",
    "bge-m3",
]

# Embedding models as detailed metadata
OLLAMA_EMBEDDING_MODELS_DETAILED = [
    create_model_metadata(
        provider="Ollama",
        name=name,
        icon="Ollama",
        model_type="embeddings",
        default=(name == "nomic-embed-text"),  # Mark the most efficient as default
    )
    for name in OLLAMA_EMBEDDING_MODELS
]

# Connection URLs
URL_LIST = [
    "http://localhost:11434",
    "http://host.docker.internal:11434",
    "http://127.0.0.1:11434",
    "http://0.0.0.0:11434",
]

# Backwards compatibility
OLLAMA_MODEL_NAMES = OLLAMA_TOOL_MODELS_BASE
DEFAULT_OLLAMA_API_URL = "https://ollama.com"
