from fastapi import HTTPException
from server.config import logger, supabase
from server.models import Answer, Question
from server.rag.rag import ask_question
from .utils import simplify_error

async def process_question(req: Question, user, chat_id: str = None, api_key: str = None):
    try:
        res = ask_question(req.text, user.id, chat_id=chat_id, api_key=api_key)
        
        try:
            supabase.table("conversations").insert({
                "user_id": user.id,
                "question": req.text,
                "answer": res["answer"],
                "context": res["context"],
            }).execute()
        except Exception:
            logger.error(f"DB save failed for {user.email}")

        return Answer(text=res["answer"])
    except Exception as e:
        logger.error(f"Chat error for {user.email}: {e}")
        raise HTTPException(status_code=500, detail=simplify_error(e))
