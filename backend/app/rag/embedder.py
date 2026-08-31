from langchain_google_genai import GoogleGenerativeAIEmbeddings

from app.config import EMBED_DIMENSION, EMBED_MODEL, GOOGLE_API_KEY

embeddings = GoogleGenerativeAIEmbeddings(
    model=EMBED_MODEL,
    google_api_key=GOOGLE_API_KEY,
    output_dimensionality=EMBED_DIMENSION,
)

# https://python.langchain.com/docs/integrations/text_embedding/google_generative_ai/
