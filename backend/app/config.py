import json
import os

from dotenv import load_dotenv

load_dotenv()

ENV = os.getenv("ENV", "development")
CORS_ORIGINS_STR = os.getenv("CORS_ORIGINS", '["*"]')
CORS_ORIGINS = json.loads(CORS_ORIGINS_STR)

APP_NAME = "Arkiv API"
APP_VERSION = "2.0.0"

GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY")
GEMINI_BASE_URL = "https://generativelanguage.googleapis.com/v1beta/openai/"

PINECONE_API_KEY = os.getenv("PINECONE_API_KEY")
PINECONE_INDEX_NAME = os.getenv("PINECONE_INDEX_NAME")

EMBED_MODEL = "models/gemini-embedding-001"
CHAT_MODEL = "gemini-3.1-flash-lite"

TOP_K = 10
CHUNK_SIZE = 800
CHUNK_OVERLAP = 100
UPLOAD_BATCH_SIZE = 100

MAX_FILE_COUNT = 6
MAX_FILE_SIZE = 5 * 1024 * 1024

UPLOAD_DIR = "data/uploads"

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

