# Arkiv RAG
# 1. Handles text chunking, vector storage, and conversational chain for Q&A
# 2. Uses FAISS for local ephemeral vector storage (per-session)


from langchain_community.vectorstores import FAISS
from langchain_core.prompts import PromptTemplate
from langchain_google_genai import ChatGoogleGenerativeAI, GoogleGenerativeAIEmbeddings
from langchain_text_splitters import RecursiveCharacterTextSplitter

_vectorstore_cache = {}


def get_text_chunks(text: str) -> list:
    text_splitter = RecursiveCharacterTextSplitter(chunk_size=10000, chunk_overlap=1000)
    chunks = text_splitter.split_text(text)
    return chunks


def get_vectorstore(text_chunks: list, user_id: str, api_key: str = None):
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
    user_key = str(user_id)
    if user_key in _vectorstore_cache:
        return _vectorstore_cache[user_key]
    return None


def get_conversational_chain(api_key: str = None):
    prompt_template = """
You are a helpful document assistant. Answer questions clearly and concisely based on the provided context.

## Guidelines:
- **Be concise**: Give direct answers without unnecessary elaboration
- **Use bullet points** for lists, not lengthy paragraphs
- **Bold** only the most important terms (sparingly)
- For math: Use simple notation like x = (-b ± √(b²-4ac)) / 2a or LaTeX $E=mc^2$
- **NEVER output** HTML tags, KaTeX markup, or rendering code

## Format:
- Short answers: 2-3 sentences
- Medium answers: Bullet points or short paragraphs
- Complex topics: Use ### headers to organize sections

If not found in documents: "I couldn't find this in your uploaded documents."

---

Context:  {context}

Question: {question}

Answer:
    """
    
    if api_key:
        model = ChatGoogleGenerativeAI(model="gemini-flash-latest", google_api_key=api_key, temperature=0.3)
    else:
        model = ChatGoogleGenerativeAI(model="gemini-flash-latest", temperature=0.3)

    prompt = PromptTemplate(
        template=prompt_template, input_variables=["context", "question"]
    )
    chain = prompt | model
    return chain
