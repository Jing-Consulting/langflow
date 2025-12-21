from .model_metadata import create_model_metadata

# Unified model metadata - single source of truth
# Note: Only models with default=True will show in the model selector by default
# Limited to 3 most advanced models per provider for UI conciseness
ANTHROPIC_MODELS_DETAILED = [
    # Claude 4.5 Series - TOP 3 DEFAULTS
    create_model_metadata(
        provider="Anthropic",
        name="claude-opus-4-5",
        icon="Anthropic",
        tool_calling=True,
        default=True,  # Default 1/3 - Most powerful
    ),
    create_model_metadata(
        provider="Anthropic",
        name="claude-sonnet-4-5",
        icon="Anthropic",
        tool_calling=True,
        default=True,  # Default 2/3 - Balanced
    ),
    create_model_metadata(
        provider="Anthropic",
        name="claude-haiku-4-5",
        icon="Anthropic",
        tool_calling=True,
        default=True,  # Default 3/3 - Fast
    ),
    # Additional models (not default)
    create_model_metadata(
        provider="Anthropic",
        name="claude-opus-4-5-20251101",
        icon="Anthropic",
        tool_calling=True,
    ),
    create_model_metadata(
        provider="Anthropic",
        name="claude-haiku-4-5-20251001",
        icon="Anthropic",
        tool_calling=True,
    ),
    create_model_metadata(
        provider="Anthropic",
        name="claude-sonnet-4-5-20250929",
        icon="Anthropic",
        tool_calling=True,
    ),
    create_model_metadata(
        provider="Anthropic",
        name="claude-opus-4-1-20250805",
        icon="Anthropic",
        tool_calling=True,
    ),
    create_model_metadata(
        provider="Anthropic",
        name="claude-opus-4-20250514",
        icon="Anthropic",
        tool_calling=True,
    ),
    create_model_metadata(
        provider="Anthropic",
        name="claude-sonnet-4-20250514",
        icon="Anthropic",
        tool_calling=True,
    ),
    # Deprecated models
    create_model_metadata(
        provider="Anthropic", name="claude-3-7-sonnet-latest", icon="Anthropic", tool_calling=True, deprecated=True
    ),
    create_model_metadata(
        provider="Anthropic", name="claude-3-5-sonnet-latest", icon="Anthropic", tool_calling=True, deprecated=True
    ),
    create_model_metadata(
        provider="Anthropic", name="claude-3-5-haiku-latest", icon="Anthropic", tool_calling=True, deprecated=True
    ),
    create_model_metadata(
        provider="Anthropic", name="claude-3-opus-latest", icon="Anthropic", tool_calling=True, deprecated=True
    ),
]

ANTHROPIC_MODELS = [
    metadata["name"]
    for metadata in ANTHROPIC_MODELS_DETAILED
    if not metadata.get("deprecated", False) and metadata.get("tool_calling", False)
]

TOOL_CALLING_SUPPORTED_ANTHROPIC_MODELS = [
    metadata["name"] for metadata in ANTHROPIC_MODELS_DETAILED if metadata.get("tool_calling", False)
]

TOOL_CALLING_UNSUPPORTED_ANTHROPIC_MODELS = [
    metadata["name"] for metadata in ANTHROPIC_MODELS_DETAILED if not metadata.get("tool_calling", False)
]

DEPRECATED_MODELS = [metadata["name"] for metadata in ANTHROPIC_MODELS_DETAILED if metadata.get("deprecated", False)]


DEFAULT_ANTHROPIC_API_URL = "https://api.anthropic.com"
