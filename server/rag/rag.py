from .retriever import Retriever
from .client import LLMClient

def ingest_chunks(chunks, user_id, chat_id=None, api_key=None):
    r = Retriever(user_id=user_id, chat_id=chat_id, api_key=api_key)
    r.ingest_chunks(chunks)

def ask_question(question, user_id, chat_id=None, api_key=None):
    r = Retriever(user_id=user_id, chat_id=chat_id, api_key=api_key)
    results = r.retrieve(question, k=12)
    
    if not results:
        return {
            "answer": "No relevant info found in your docs. Try uploading more files.",
            "context": ""
        }
        
    context = "\n\n".join(results)
    
    llm = LLMClient(api_key=api_key)
    chain = llm.get_answer_chain()
    
    answer = chain.invoke({"context": context, "question": question})
    
    return {
        "answer": answer,
        "context": context
    }

def clear_user_data(user_id, chat_id=None):
    r = Retriever(user_id=user_id, chat_id=chat_id)
    r.clear_data()
