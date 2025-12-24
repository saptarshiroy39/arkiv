# Arkiv Config
# 1. Configuration for Arkiv
# 2. Handles logging, authentication, file upload, and chat history


import logging
import os
import sys

import google.generativeai as genai
from dotenv import load_dotenv
from supabase import Client, create_client

load_dotenv()

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s | %(levelname)-8s | %(name)s | %(message)s",
    datefmt="%Y-%m-%d %H:%M:%S",
    handlers=[
        logging.StreamHandler(sys.stdout),
        logging.FileHandler("arkiv.log", encoding="utf-8"),
    ],
)
logger = logging.getLogger("Arkiv")

GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY", "")
if not GOOGLE_API_KEY:
    logger.error("GOOGLE_API_KEY not found in environment variables")
    raise ValueError("GOOGLE_API_KEY is required. Add it to your .env file.")
genai.configure(api_key=GOOGLE_API_KEY)

PINECONE_API_KEY = os.getenv("PINECONE_API_KEY", "")
PINECONE_INDEX_NAME = os.getenv("PINECONE_INDEX_NAME", "arkiv-index")

if not PINECONE_API_KEY:
    logger.warning("PINECONE_API_KEY not found. Vector storage will fail until configured.")


SUPABASE_URL = os.getenv("SUPABASE_URL", "")
SUPABASE_KEY = os.getenv("SUPABASE_ANON_KEY", "")
SUPABASE_SERVICE_ROLE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY", "")

if not SUPABASE_URL:
    logger.error("SUPABASE_URL not found in environment variables")
    raise ValueError("SUPABASE_URL is required. Add it to your .env file.")

if not SUPABASE_SERVICE_ROLE_KEY:
    logger.error("SUPABASE_SERVICE_ROLE_KEY not found in environment variables")
    raise ValueError("SUPABASE_SERVICE_ROLE_KEY is required. Add it to your .env file.")

if not SUPABASE_KEY:
    logger.warning("SUPABASE_ANON_KEY not found - Frontend config will be incomplete")

supabase: Client = create_client(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

CLIENT_DIR = os.path.join(BASE_DIR, "client")
EASTER_EGG_DIR = os.path.join(BASE_DIR, "easter_egg")

logger.info("=" * 50)
logger.info("Arkiv API Starting...")
logger.info(f"Base Directory: {BASE_DIR}")
logger.info("=" * 50)
