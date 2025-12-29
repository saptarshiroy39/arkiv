import logging
import os
import sys
import google.generativeai as genai
from dotenv import load_dotenv
from supabase import create_client

load_dotenv()

logging.basicConfig(level=logging.INFO, format="%(levelname)s: %(message)s")
logger = logging.getLogger("Arkiv")

def get_env(key, default=None, required=False):
    val = os.getenv(key, default)
    if required and not val:
        print(f"Error: {key} is required in .env")
        sys.exit(1)
    return val

GOOGLE_API_KEY = get_env("GOOGLE_API_KEY", required=True)
genai.configure(api_key=GOOGLE_API_KEY)

PINECONE_API_KEY = get_env("PINECONE_API_KEY")
PINECONE_INDEX_NAME = get_env("PINECONE_INDEX_NAME", "arkiv-index")

if not PINECONE_API_KEY:
    logger.warning("No Pinecone key - vector search will be disabled")

SUPABASE_URL = get_env("SUPABASE_URL", required=True)
SUPABASE_KEY = get_env("SUPABASE_ANON_KEY", required=True)
SUPABASE_SERVICE_ROLE_KEY = get_env("SUPABASE_SERVICE_ROLE_KEY", required=True)

supabase = create_client(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
CLIENT_DIR = os.path.join(BASE_DIR, "client")

logger.info(f"Arkiv starting... dir: {BASE_DIR}")
