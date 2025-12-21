from .model_metadata import create_model_metadata

# Unified model metadata - single source of truth
# Note: Only models with default=True will show in the model selector by default
# Limited to 3 most advanced models per provider for UI conciseness
GOOGLE_GENERATIVE_AI_MODELS_DETAILED = [
    # TOP 3 DEFAULTS
    create_model_metadata(
        provider="Google Generative AI",
        name="gemini-3-pro-preview",
        icon="GoogleGenerativeAI",
        tool_calling=True,
        preview=True,
        default=True,  # Default 1/3 - Most advanced
    ),
    create_model_metadata(
        provider="Google Generative AI",
        name="gemini-2.5-pro",
        icon="GoogleGenerativeAI",
        tool_calling=True,
        default=True,  # Default 2/3 - Powerful
    ),
    create_model_metadata(
        provider="Google Generative AI",
        name="gemini-2.5-flash",
        icon="GoogleGenerativeAI",
        tool_calling=True,
        default=True,  # Default 3/3 - Fast
    ),
    # Additional models (not default)
    create_model_metadata(
        provider="Google Generative AI",
        name="gemini-3-pro-image-preview",
        icon="GoogleGenerativeAI",
        tool_calling=True,
        preview=True,
    ),
    create_model_metadata(
        provider="Google Generative AI",
        name="gemini-1.5-pro",
        icon="GoogleGenerativeAI",
        tool_calling=True,
    ),
    create_model_metadata(
        provider="Google Generative AI",
        name="gemini-1.5-flash",
        icon="GoogleGenerativeAI",
        tool_calling=True,
    ),
    create_model_metadata(
        provider="Google Generative AI",
        name="gemini-2.0-flash-lite",
        icon="GoogleGenerativeAI",
        tool_calling=True,
    ),
    create_model_metadata(
        provider="Google Generative AI",
        name="gemini-2.5-flash-lite",
        icon="GoogleGenerativeAI",
        tool_calling=True,
    ),
    create_model_metadata(
        provider="Google Generative AI",
        name="gemini-2.0-flash",
        icon="GoogleGenerativeAI",
        tool_calling=True,
        preview=True,
    ),
    create_model_metadata(
        provider="Google Generative AI",
        name="gemma-2-27b",
        icon="GoogleGenerativeAI",
        tool_calling=True,
    ),
]

GOOGLE_GENERATIVE_AI_MODELS = [metadata["name"] for metadata in GOOGLE_GENERATIVE_AI_MODELS_DETAILED]

# Google Generative AI Embedding models
# https://ai.google.dev/gemini-api/docs/models#embedding
GOOGLE_GENERATIVE_AI_EMBEDDING_MODEL_NAMES = [
    "text-embedding-004",
    "text-multilingual-embedding-002",
    "embedding-001",
]

# Embedding models as detailed metadata
GOOGLE_GENERATIVE_AI_EMBEDDING_MODELS_DETAILED = [
    create_model_metadata(
        provider="Google Generative AI",
        name=name,
        icon="GoogleGenerativeAI",
        model_type="embeddings",
        default=(name == "text-embedding-004"),  # Mark the latest as default
    )
    for name in GOOGLE_GENERATIVE_AI_EMBEDDING_MODEL_NAMES
]
