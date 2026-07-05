import threading
import time

from langchain_core.documents import Document
from langchain_pinecone import PineconeVectorStore
from pinecone import Pinecone

from app.config import PINECONE_API_KEY, PINECONE_INDEX_NAME, UPLOAD_BATCH_SIZE
from app.rag.embedder import embeddings

_pinecone_index = None
_pinecone_lock = threading.Lock()

def _get_index():
    global _pinecone_index
    if _pinecone_index is None:
        with _pinecone_lock:
            if _pinecone_index is None:
                pc = Pinecone(api_key=PINECONE_API_KEY)
                _pinecone_index = pc.Index(PINECONE_INDEX_NAME)
    return _pinecone_index

def get_vectorstore(session_id: str = "default_index") -> PineconeVectorStore:
    return PineconeVectorStore(
        index_name=PINECONE_INDEX_NAME,
        embedding=embeddings,
        pinecone_api_key=PINECONE_API_KEY,
        namespace=session_id,
    )

def add_documents(chunks: list[Document], session_id: str = "default_index") -> None:
    if not chunks:
        raise ValueError("No text could be extracted from the file.")

    store = get_vectorstore(session_id)
    for i in range(0, len(chunks), UPLOAD_BATCH_SIZE):
        batch = chunks[i : i + UPLOAD_BATCH_SIZE]
        store.add_documents(batch)
        if i + UPLOAD_BATCH_SIZE < len(chunks):
            time.sleep(0.5)

def delete_vectorstore(session_id: str) -> bool:
    try:
        index = _get_index()
        index.delete(delete_all=True, namespace=session_id)
        return True
    except Exception as e:
        print(f"delete_vectorstore: failed to delete namespace '{session_id}': {e}")
        return False

def delete_user_vectorstores(user_id: str) -> bool:
    try:
        index = _get_index()
        stats = index.describe_index_stats()
        namespaces = list(stats.namespaces.keys())
        failed: list[str] = []
        prefix = f"{user_id}_"
        
        target_namespaces = [ns for ns in namespaces if ns.startswith(prefix)]
        
        for ns in target_namespaces:
            try:
                index.delete(delete_all=True, namespace=ns)
            except Exception as e:
                print(f"Failed to delete namespace '{ns}': {e}")
                failed.append(ns)
        
        if failed:
            print(f"delete_user_vectorstores: {len(failed)}/{len(target_namespaces)} namespaces failed: {failed}")
            return False
        return True
    except Exception as e:
        print(f"delete_user_vectorstores: unexpected error: {e}")
        return False
