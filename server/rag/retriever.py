from server.storage.embeddings import EmbeddingsService
from server.storage.pinecone import PineconeClient

class Retriever:
    def __init__(self, user_id, chat_id=None, api_key=None):
        if chat_id:
            self.namespace = f"{user_id}_{chat_id}"
        else:
            self.namespace = str(user_id)
            
        self.user_id = str(user_id)
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
        
        results = []
        for hit in hits:
            if not hit.metadata or "text" not in hit.metadata:
                continue
            
            text = hit.metadata["text"]
            if "page" in hit.metadata:
                results.append(f"[Page {hit.metadata['page']}] {text}")
            else:
                results.append(text)
                
        return results

    def clear_data(self):
        self.db.delete_namespace(self.namespace)
