from langchain_google_genai import GoogleGenerativeAIEmbeddings

class EmbeddingsService:
    def __init__(self, api_key=None):
        kwargs = {"model": "models/embedding-001"}
        if api_key:
            kwargs["google_api_key"] = api_key
            
        self.client = GoogleGenerativeAIEmbeddings(**kwargs)

    def embed_documents(self, texts):
        return self.client.embed_documents(texts)

    def embed_query(self, text):
        return self.client.embed_query(text)
