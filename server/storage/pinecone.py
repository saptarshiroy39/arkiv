from pinecone import Pinecone
from server.config import PINECONE_API_KEY, PINECONE_INDEX_NAME, logger

class PineconeClient:
    def __init__(self):
        if not PINECONE_API_KEY:
            raise ValueError("PINECONE_API_KEY not set")
            
        self.pc = Pinecone(api_key=PINECONE_API_KEY)
        self.index = self.pc.Index(PINECONE_INDEX_NAME)

    def upsert_chunks(self, chunks, vectors, namespace):
        if not chunks:
            return

        batch_size = 50
        vec_list = []
        
        for i, (chunk, vector) in enumerate(zip(chunks, vectors)):
            vid = f"{chunk.source}_{chunk.idx}"
            meta = {
                "text": chunk.text,
                "source": chunk.source,
                "index": chunk.idx,
                **chunk.meta
            }
            vec_list.append((vid, vector, meta))

        for i in range(0, len(vec_list), batch_size):
            batch = vec_list[i : i + batch_size]
            try:
                self.index.upsert(vectors=batch, namespace=namespace)
            except Exception as e:
                logger.error(f"upsert failed: {e}")

    def query(self, vector, namespace, k=4):
        try:
            res = self.index.query(
                vector=vector,
                top_k=k,
                namespace=namespace,
                include_metadata=True
            )
            return res.matches
        except Exception as e:
            logger.error(f"query failed: {e}")
            return []

    def delete_namespace(self, namespace):
        try:
            self.index.delete(delete_all=True, namespace=namespace)
        except Exception as e:
            logger.error(f"delete failed: {e}")
