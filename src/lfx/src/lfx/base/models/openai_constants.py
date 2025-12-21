from .model_metadata import create_model_metadata

# Unified model metadata - single source of truth
# Note: Only models with default=True will show in the model selector by default
# Limited to 3 most advanced models per provider for UI conciseness
OPENAI_MODELS_DETAILED = [
    # GPT-5.2 Series - Latest (December 2025) - TOP 3 DEFAULTS
    create_model_metadata(
        provider="OpenAI",
        name="gpt-5.2",
        icon="OpenAI",
        tool_calling=True,
        reasoning=True,
        default=True,  # Default 1/3
    ),
    create_model_metadata(
        provider="OpenAI",
        name="gpt-5.1",
        icon="OpenAI",
        tool_calling=True,
        reasoning=True,
        default=True,  # Default 2/3 - MACP-AB default model
    ),
    create_model_metadata(
        provider="OpenAI",
        name="gpt-4o",
        icon="OpenAI",
        tool_calling=True,
        default=True,  # Default 3/3
    ),
    # GPT-5 Series - Additional (not default)
    create_model_metadata(
        provider="OpenAI",
        name="gpt-5.2-pro",
        icon="OpenAI",
        tool_calling=True,
        reasoning=True,
    ),
    create_model_metadata(
        provider="OpenAI",
        name="gpt-5",
        icon="OpenAI",
        tool_calling=True,
        reasoning=True,
    ),
    create_model_metadata(
        provider="OpenAI",
        name="gpt-5-mini",
        icon="OpenAI",
        tool_calling=True,
        reasoning=True,
    ),
    create_model_metadata(
        provider="OpenAI",
        name="gpt-4o-mini",
        icon="OpenAI",
        tool_calling=True,
    ),
    create_model_metadata(
        provider="OpenAI",
        name="gpt-4.1",
        icon="OpenAI",
        tool_calling=True,
    ),
    create_model_metadata(
        provider="OpenAI",
        name="gpt-4-turbo",
        icon="OpenAI",
        tool_calling=True,
    ),
    create_model_metadata(
        provider="OpenAI",
        name="gpt-4",
        icon="OpenAI",
        tool_calling=True,
    ),
    # Reasoning Models
    create_model_metadata(provider="OpenAI", name="o1", icon="OpenAI", reasoning=True),
    create_model_metadata(provider="OpenAI", name="o1-mini", icon="OpenAI", reasoning=True, not_supported=True),
    create_model_metadata(provider="OpenAI", name="o3-mini", icon="OpenAI", reasoning=True, preview=True, not_supported=True),
    # Search Models
    create_model_metadata(
        provider="OpenAI",
        name="gpt-4o-search-preview",
        icon="OpenAI",
        tool_calling=True,
        search=True,
        preview=True,
    ),
    # Deprecated
    create_model_metadata(provider="OpenAI", name="gpt-3.5-turbo", icon="OpenAI", tool_calling=True, deprecated=True),
]

OPENAI_CHAT_MODEL_NAMES = [
    metadata["name"]
    for metadata in OPENAI_MODELS_DETAILED
    if not metadata.get("not_supported", False)
    and not metadata.get("reasoning", False)
    and not metadata.get("search", False)
]

OPENAI_REASONING_MODEL_NAMES = [
    metadata["name"]
    for metadata in OPENAI_MODELS_DETAILED
    if metadata.get("reasoning", False) and not metadata.get("not_supported", False)
]

OPENAI_SEARCH_MODEL_NAMES = [
    metadata["name"]
    for metadata in OPENAI_MODELS_DETAILED
    if metadata.get("search", False) and not metadata.get("not_supported", False)
]

NOT_SUPPORTED_MODELS = [metadata["name"] for metadata in OPENAI_MODELS_DETAILED if metadata.get("not_supported", False)]

OPENAI_EMBEDDING_MODEL_NAMES = [
    "text-embedding-3-small",
    "text-embedding-3-large",
    "text-embedding-ada-002",
]

# Embedding models as detailed metadata
OPENAI_EMBEDDING_MODELS_DETAILED = [
    create_model_metadata(
        provider="OpenAI",
        name=name,
        icon="OpenAI",
        model_type="embeddings",
        default=(name == "text-embedding-3-small"),  # Mark the most efficient as default
    )
    for name in OPENAI_EMBEDDING_MODEL_NAMES
]

# Backwards compatibility
MODEL_NAMES = OPENAI_CHAT_MODEL_NAMES
OPENAI_MODEL_NAMES = OPENAI_CHAT_MODEL_NAMES
