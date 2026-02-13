import os

from dotenv import load_dotenv
from supabase import create_client

load_dotenv()

# API Keys
GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY")
PINECONE_API_KEY = os.getenv("PINECONE_API_KEY")

# Supabase
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_ANON_KEY = os.getenv("SUPABASE_ANON_KEY")
SUPABASE_SERVICE_ROLE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY")
SUPABASE_ADMIN = create_client(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

# Models
EMBED_MODEL = "models/gemini-embedding-001"
CHAT_MODEL = "gemini-2.0-flash"

# Chunking
CHUNK_SIZE = 800
CHUNK_OVERLAP = 200

# RAG
TOP_K = 10
EMBED_DIM = 3072

# Limits
MAX_FILE_SIZE = 50 * 1024 * 1024
