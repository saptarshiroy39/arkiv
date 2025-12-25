from server.storage.embeddings import EmbeddingsService
from server.storage.pinecone import PineconeClient

class Retriever:
    def __init__(self, user_id, api_key=None):
        self.namespace = str(user_id)
        self.embed_service = EmbeddingsService(api_key)
        self.db = PineconeClient()
        
    def ingest_chunks(self, chunks):
        if not chunks: return
            
        texts = [c.text for c in chunks]
        vectors = self.embed_service.embed_documents(texts)
        self.db.upsert_chunks(chunks, vectors, self.namespace)
        
    def retrieve(self, query, k=4):
        v = self.embed_service.embed_query(query)
        hits = self.db.query(v, self.namespace, k=k)
        
        return [hit.metadata["text"] for hit in hits if hit.metadata and "text" in hit.metadata]

    def clear_data(self):
        self.db.delete_namespace(self.namespace)
