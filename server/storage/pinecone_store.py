import time
from typing import List, Optional, Dict, Any
from pinecone import Pinecone, ServerlessSpec
from server.config import PINECONE_API_KEY, PINECONE_INDEX_NAME, logger
from server.models import Chunk

class PineconeStore:
    def __init__(self):
        if not PINECONE_API_KEY:
            raise ValueError("PINECONE_API_KEY is not set")
            
        self.pc = Pinecone(api_key=PINECONE_API_KEY)
        self.index_name = PINECONE_INDEX_NAME
        
        self._ensure_index_exists()
        self.index = self.pc.Index(self.index_name)

    def _ensure_index_exists(self):
        try:
            indexes = self.pc.list_indexes()
            index_names = [i.name for i in indexes]
            
            if self.index_name not in index_names:
                logger.info(f"Creating new Pinecone index: {self.index_name}")
                self.pc.create_index(
                    name=self.index_name,
                    dimension=768,
                    metric="cosine",
                    spec=ServerlessSpec(
                        cloud="aws",
                        region="us-east-1"
                    )
                )
                while not self.pc.describe_index(self.index_name).status['ready']:
                    time.sleep(1)
                logger.info("Index created successfully")
        except Exception as e:
            logger.error(f"Failed to check/create index: {e}")

    def upsert_chunks(self, chunks: List[Chunk], embeddings: List[List[float]], namespace: str):
        """
        Upserts chunks into the vector store.
        """
        if not chunks or not embeddings:
            return

        batch_size = 100
        total_vectors = []
        
        for i, (chunk, vector) in enumerate(zip(chunks, embeddings)):
            vector_id = f"{chunk.source}_{chunk.chunk_index}"
            metadata = {
                "text": chunk.text,
                "source": chunk.source,
                "chunk_index": chunk.chunk_index,
                **chunk.metadata
            }
            
            total_vectors.append((vector_id, vector, metadata))

        for i in range(0, len(total_vectors), batch_size):
            batch = total_vectors[i : i + batch_size]
            try:
                self.index.upsert(vectors=batch, namespace=namespace)
                logger.info(f"Upserted batch {i//batch_size + 1}/{len(total_vectors)//batch_size + 1}")
            except Exception as e:
                logger.error(f"Failed to upsert batch: {e}")

    def query(self, vector: List[float], namespace: str, k: int = 4) -> List[Dict[str, Any]]:
        try:
            results = self.index.query(
                vector=vector,
                top_k=k,
                namespace=namespace,
                include_metadata=True
            )
            return results.matches
        except Exception as e:
            logger.error(f"Query failed: {e}")
            return []

    def delete_namespace(self, namespace: str):
        try:
            self.index.delete(delete_all=True, namespace=namespace)
            logger.info(f"Deleted namespace: {namespace}")
        except Exception as e:
            logger.error(f"Failed to delete namespace {namespace}: {e}")
