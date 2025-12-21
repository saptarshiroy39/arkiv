# Arkiv RAG
# 1. Handles text chunking, vector storage, and conversational chain for Q&A
# 2. Uses FAISS for local ephemeral vector storage (per-session)


from langchain_community.vectorstores import FAISS
from langchain_core.prompts import PromptTemplate
from langchain_google_genai import ChatGoogleGenerativeAI, GoogleGenerativeAIEmbeddings
from langchain_text_splitters import RecursiveCharacterTextSplitter

# Global vectorstore cache (ephemeral per session)
_vectorstore_cache = {}


def get_text_chunks(text: str) -> list:
    """Split text into chunks for embedding."""
    text_splitter = RecursiveCharacterTextSplitter(chunk_size=10000, chunk_overlap=1000)
    chunks = text_splitter.split_text(text)
    return chunks


def get_vectorstore(text_chunks: list, user_id: str, api_key: str = None):
    """Save text chunks to local FAISS Vector Store."""
    # Use custom API key if provided, otherwise use default from environment
    if api_key:
        embeddings = GoogleGenerativeAIEmbeddings(model="models/embedding-001", google_api_key=api_key)
    else:
        embeddings = GoogleGenerativeAIEmbeddings(model="models/embedding-001")
    
    # Create FAISS vectorstore locally
    vector_store = FAISS.from_texts(
        texts=text_chunks,
        embedding=embeddings
    )
    
    # Cache per user for this session
    _vectorstore_cache[str(user_id)] = vector_store
    return vector_store


def load_vectorstore(user_id: str):
    """Load FAISS Vector Store for user from cache."""
    user_key = str(user_id)
    if user_key in _vectorstore_cache:
        return _vectorstore_cache[user_key]
    return None


def get_conversational_chain(api_key: str = None):
    """Create the LLM chain for Q&A."""
    prompt_template = """
You are a helpful document assistant. Answer the question based on the provided context from the user's uploaded documents.

Instructions:
1. Provide detailed, accurate answers based ONLY on the context provided
2. If the context contains relevant information, explain it clearly
3. If the answer is NOT in the context, say: "I couldn't find this information in your uploaded documents. Please try uploading a relevant document or rephrasing your question."
4. Use bullet points or numbered lists for clarity when appropriate

Context from documents:
{context}

Question: {question}

Answer:
    """
    
    # Default to Google (Server Key) or Custom Google Key
    if api_key:
        model = ChatGoogleGenerativeAI(model="gemini-flash-latest", google_api_key=api_key, temperature=0.3)
    else:
        model = ChatGoogleGenerativeAI(model="gemini-flash-latest", temperature=0.3)

    prompt = PromptTemplate(
        template=prompt_template, input_variables=["context", "question"]
    )
    chain = prompt | model
    return chain
