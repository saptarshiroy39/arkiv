from langchain_google_genai import GoogleGenerativeAIEmbeddings

class EmbeddingsService:
    def __init__(self, api_key=None):
        kwargs = {"model": "models/embedding-001"}
        if api_key:
            kwargs["google_api_key"] = api_key
            
        self.client = GoogleGenerativeAIEmbeddings(**kwargs)

    def embed_documents(self, texts, batch_size=100):
        all_embeddings = []
        for i in range(0, len(texts), batch_size):
            batch = texts[i:i + batch_size]
            embeddings = self.client.embed_documents(batch)
            all_embeddings.extend(embeddings)
        return all_embeddings

    def embed_query(self, text):
        return self.client.embed_query(text)

