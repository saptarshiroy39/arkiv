import os
import shutil

from langchain_community.vectorstores import FAISS
from langchain_google_genai import GoogleGenerativeAIEmbeddings

from server.config import EMBED_MODEL, GOOGLE_API_KEY

FAISS_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))), "faiss_data")


def _get_embeddings(api_key=None):
    return GoogleGenerativeAIEmbeddings(
        model=EMBED_MODEL, google_api_key=api_key or GOOGLE_API_KEY
    )


def _index_path(namespace):
    return os.path.join(FAISS_DIR, namespace)


def get_faiss_store(namespace, api_key=None):
    """Load an existing FAISS index or return None if it doesn't exist."""
    path = _index_path(namespace)
    embeddings = _get_embeddings(api_key)
    if os.path.exists(path):
        return FAISS.load_local(path, embeddings, allow_dangerous_deserialization=True)
    return None


def add_documents_faiss(namespace, documents, api_key=None):
    """Add documents to a FAISS index (create or merge)."""
    path = _index_path(namespace)
    embeddings = _get_embeddings(api_key)

    new_store = FAISS.from_documents(documents, embeddings)

    if os.path.exists(path):
        existing = FAISS.load_local(path, embeddings, allow_dangerous_deserialization=True)
        existing.merge_from(new_store)
        existing.save_local(path)
    else:
        os.makedirs(path, exist_ok=True)
        new_store.save_local(path)


def delete_faiss_namespace(namespace):
    """Delete a FAISS index directory."""
    path = _index_path(namespace)
    if os.path.exists(path):
        shutil.rmtree(path, ignore_errors=True)


def delete_faiss_user_data(user_id):
    """Delete all FAISS indexes for a user."""
    if not os.path.exists(FAISS_DIR):
        return
    for name in os.listdir(FAISS_DIR):
        if name.startswith(f"{user_id}_"):
            shutil.rmtree(os.path.join(FAISS_DIR, name), ignore_errors=True)
