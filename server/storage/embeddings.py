from langchain_google_genai import GoogleGenerativeAIEmbeddings
from typing import List

class EmbeddingsService:
    def __init__(self, api_key: str = None):
        if api_key:
            self.embeddings = GoogleGenerativeAIEmbeddings(
                model="models/embedding-001", 
                google_api_key=api_key
            )
        else:
            self.embeddings = GoogleGenerativeAIEmbeddings(
                model="models/embedding-001"
            )

    def embed_documents(self, texts: List[str]) -> List[List[float]]:
        return self.embeddings.embed_documents(texts)

    def embed_query(self, text: str) -> List[float]:
        return self.embeddings.embed_query(text)
