import json
import os
from pathlib import Path

from dotenv import load_dotenv
from sizelib import size

load_dotenv()

CORS_ORIGINS_STR = os.getenv("CORS_ORIGINS", '["*"]')
CORS_ORIGINS = json.loads(CORS_ORIGINS_STR)

APP_NAME = "Arkiv API"
APP_VERSION = "2.6.0"

GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY")
GEMINI_BASE_URL = "https://generativelanguage.googleapis.com/v1beta/openai/"

QDRANT_URL = os.getenv("QDRANT_URL")
QDRANT_API_KEY = os.getenv("QDRANT_API_KEY")
QDRANT_COLLECTION_NAME = os.getenv("QDRANT_COLLECTION_NAME", "arkiv")

EMBED_MODEL = "models/gemini-embedding-001"
EMBED_DIMENSION = 768
CHAT_MODEL = "gemini-3.1-flash-lite"
DEFAULT_SESSION_ID = "default_session"

TOP_K = 10
CHUNK_SIZE = 800
CHUNK_OVERLAP = 100

MAX_FILE_COUNT = 6
MAX_FILE_SIZE = size.mib(5)

ALLOWED_TYPES = {
    "pdf",
    "csv",
    "txt",
    "md",
    "json",
    "tex",
    "docx",
    "xlsx",
    "pptx",
}

PROMPTS_DIR = Path(__file__).parent / "prompts"
SYSTEM_PROMPT = (PROMPTS_DIR / "SYSTEM.md").read_text(encoding="utf-8")
USER_PROMPT = (PROMPTS_DIR / "USER.md").read_text(encoding="utf-8")

