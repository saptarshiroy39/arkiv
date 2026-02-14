from langchain_google_genai import GoogleGenerativeAIEmbeddings
from langchain_pinecone import PineconeVectorStore
from pinecone import Pinecone, ServerlessSpec

from server.config import EMBED_DIM, EMBED_MODEL, GOOGLE_API_KEY, PINECONE_API_KEY

INDEX = "arkiv"
_client = None
_index = None


def _pc():
    global _client
    if not _client:
        _client = Pinecone(api_key=PINECONE_API_KEY)
    return _client


def get_index():
    global _index
    if not _index:
        pc = _pc()
        existing = [i.name for i in pc.list_indexes()]
        if INDEX not in existing:
            pc.create_index(
                name=INDEX,
                dimension=EMBED_DIM,
                metric="cosine",
                spec=ServerlessSpec(cloud="aws", region="us-east-1"),
            )
        _index = pc.Index(INDEX)
    return _index


def get_vectorstore(namespace, api_key=None):
    embeddings = GoogleGenerativeAIEmbeddings(
        model=EMBED_MODEL, google_api_key=api_key or GOOGLE_API_KEY
    )
    return PineconeVectorStore(
        index=get_index(), embedding=embeddings, namespace=namespace
    )


def delete_namespace(namespace):
    try:
        get_index().delete(delete_all=True, namespace=namespace)
    except Exception:
        pass  # Namespace may not exist


def delete_user_data(user_id):
    index = get_index()
    stats = index.describe_index_stats()
    for ns in stats.namespaces:
        if ns.startswith(f"{user_id}_"):
            try:
                index.delete(delete_all=True, namespace=ns)
            except Exception:
                pass
