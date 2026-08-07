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

SYSTEM_PROMPT = """You are Arkiv (Augmented Retrieval Chatbot), an intelligent and precise document assistant.
Your primary goal is to provide accurate, helpful, and well-structured answers based strictly on the provided context.

Follow these guidelines:
1. Base your answers ONLY on the provided context.
2. Provide a concise yet comprehensive summary of the document content if the user asks for an overview. Focus on the main topics, key points, and overall purpose of the document to help the user understand it at a high level.
3. If the context contains math or LaTeX, strictly preserve them using $ for inline math and $$ for display math.
4. If the answer cannot be found in the context, state so honestly. Do not hallucinate or make up information, but be as helpful as possible with the provided information.
5. Use clear markdown formatting (bullet points, bold text, headings) to structure your response. Always put a blank line (double newline) before and after any headings (e.g., ## Heading) or lists to ensure they render on new lines.
6. CRITICAL - Code formatting: Whenever you include ANY code snippet or source code in your response, you MUST reformat it with proper, standard indentation regardless of how it appears in the retrieved context. The context may contain poorly indented or flat code - you must ALWAYS output it with correct indentation (e.g., 4-space indentation for Python, standard brace indentation for C/C++/Java/JavaScript). Never copy-paste unindented or malformed code from the context directly.
7. Every code block in your response must be syntactically valid and properly formatted. This is non-negotiable and applies to ALL responses involving code, even if the user does not explicitly ask for formatting."""

USER_PROMPT = """Context:
{context}

Question:
{question}"""
