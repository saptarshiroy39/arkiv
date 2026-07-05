from fastapi import APIRouter, Depends, HTTPException

from app.deps import get_user_id
from app.rag.vectorstore import delete_vectorstore

router = APIRouter()

@router.delete("/delete/{session_id}")
async def delete_specific_chat(session_id: str, user_id: str = Depends(get_user_id)) -> dict:
    prefixed_session_id = f"{user_id}_{session_id}"
    if not delete_vectorstore(prefixed_session_id):
        raise HTTPException(404, f"No vector store found for session: {session_id}")
    return {"message": f"Vector store for session {session_id} deleted."}
