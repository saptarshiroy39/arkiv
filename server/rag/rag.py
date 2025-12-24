# Arkiv RAG Facade
# Orchestrates the interaction between Retrieval, Storage, and LLM.

from typing import List, Dict, Any
from .retriever import Retriever
from .client import LLMClient
from server.models import Chunk

def ingest_chunks(chunks: List[Chunk], user_id: str, api_key: str = None):
    retriever = Retriever(user_id=user_id, api_key=api_key)
    retriever.ingest_chunks(chunks)

def ask_question(question: str, user_id: str, api_key: str = None) -> Dict[str, Any]:
    retriever = Retriever(user_id=user_id, api_key=api_key)
    relevant_texts = retriever.retrieve(question, k=8)
    
    if not relevant_texts:
        return {
            "answer": "I couldn't find any relevant information in your uploaded documents. Please ensure you've uploaded documents that contain the answer.",
            "context": ""
        }
        
    context = "\n\n".join(relevant_texts)
    
    llm_client = LLMClient(api_key=api_key)
    chain = llm_client.get_answer_chain()
    
    answer = chain.invoke({"context": context, "question": question})
    
    return {
        "answer": answer,
        "context": context
    }

def clear_user_data(user_id: str, api_key: str = None):
    retriever = Retriever(user_id=user_id, api_key=api_key)
    retriever.clear_data()
