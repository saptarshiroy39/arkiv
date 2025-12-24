from typing import List, Dict, Any
from server.storage.embeddings import EmbeddingsService
from server.storage.pinecone_store import PineconeStore
from server.models import Chunk

class Retriever:
    def __init__(self, user_id: str, api_key: str = None):
        self.namespace = str(user_id)
        self.embeddings = EmbeddingsService(api_key)
        self.store = PineconeStore()
        
    def ingest_chunks(self, chunks: List[Chunk]):
        if not chunks:
            return
            
        texts = [chunk.text for chunk in chunks]
        vectors = self.embeddings.embed_documents(texts)
        
        self.store.upsert_chunks(chunks, vectors, self.namespace)
        
    def retrieve(self, query: str, k: int = 4) -> List[str]:
        query_vector = self.embeddings.embed_query(query)
        matches = self.store.query(query_vector, self.namespace, k=k)
        
        results = []
        for match in matches:
            if match.metadata and "text" in match.metadata:
                results.append(match.metadata["text"])
                
        return results

    def clear_data(self):
        self.store.delete_namespace(self.namespace)
