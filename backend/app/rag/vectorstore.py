from langchain_core.documents import Document
from langchain_qdrant import QdrantVectorStore
from qdrant_client import QdrantClient, models

from app.config import EMBED_DIMENSION, QDRANT_API_KEY, QDRANT_COLLECTION_NAME, QDRANT_URL, TOP_K
from app.rag.embedder import embeddings


# https://python.langchain.com/docs/integrations/vectorstores/qdrant/
client = QdrantClient(url=QDRANT_URL, api_key=QDRANT_API_KEY)

if not client.collection_exists(QDRANT_COLLECTION_NAME):
    client.create_collection(
        collection_name=QDRANT_COLLECTION_NAME,
        vectors_config=models.VectorParams(
            size=EMBED_DIMENSION,
            distance=models.Distance.COSINE,
        ),
    )
    client.create_payload_index(
        collection_name=QDRANT_COLLECTION_NAME,
        field_name="metadata.session_id",
        field_schema=models.PayloadSchemaType.KEYWORD,
    )


vectorstore = QdrantVectorStore(
    client=client,
    collection_name=QDRANT_COLLECTION_NAME,
    embedding=embeddings,
)


# https://python.langchain.com/docs/integrations/vectorstores/qdrant/#query-vector-store
def add_docs(chunks: list[Document], session_id: str) -> None:
    if not chunks:
        raise ValueError("No text could be extracted.")
    for chunk in chunks:
        chunk.metadata["session_id"] = session_id
    vectorstore.add_documents(chunks)


# https://python.langchain.com/docs/integrations/vectorstores/qdrant/#query-vector-store
def search_docs(question: str, session_id: str, k: int = TOP_K) -> list[Document]:
    search_filter = models.Filter(
        must=[
            models.FieldCondition(
                key="metadata.session_id",
                match=models.MatchValue(value=session_id),
            )
        ]
    )
    return vectorstore.similarity_search(question, k=k, filter=search_filter)


# https://qdrant.tech/documentation/concepts/points/#delete-points
def delete_vs(session_id: str) -> bool:
    client.delete(
        collection_name=QDRANT_COLLECTION_NAME,
        points_selector=models.FilterSelector(
            filter=models.Filter(
                must=[
                    models.FieldCondition(
                        key="metadata.session_id",
                        match=models.MatchValue(value=session_id),
                    )
                ]
            )
        ),
    )
    return True


# https://qdrant.tech/documentation/concepts/points/#delete-points
def clear_all_vs() -> bool:
    client.delete(
        collection_name=QDRANT_COLLECTION_NAME,
        points_selector=models.FilterSelector(filter=models.Filter()),
    )
    return True
