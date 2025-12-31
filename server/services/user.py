from fastapi import HTTPException
from server.config import logger, supabase
from server.rag.rag import clear_user_data as rag_clear_user_data
from server.rag.retriever import Retriever

async def clear_user_data(user, chat_id: str = None):
    try:
        rag_clear_user_data(user.id, chat_id=chat_id)
        return {"message": "Data cleared"}
    except Exception as e:
        logger.error(f"Clear failed: {e}")
        raise HTTPException(status_code=500, detail="Failed to clear data")

async def delete_user_account(user):
    try:
        uid = user.id
        supabase.table("conversations").delete().eq("user_id", uid).execute()
        
        
        try:
            Retriever(uid).clear_data()
        except Exception:
            pass

        supabase.auth.admin.delete_user(uid)
        logger.info(f"Deleted user: {user.email}")
        
        return {"message": "Account deleted"}
    except Exception as e:
        logger.error(f"Delete account error: {e}")
        raise HTTPException(status_code=500, detail="Failed to delete account")
