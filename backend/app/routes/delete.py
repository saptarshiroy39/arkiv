from fastapi import APIRouter
from app.rag.vectorstore import delete_vs

router = APIRouter(tags=["RAG"])


@router.delete("/delete/{session_id}")
async def delete_specific_chat(session_id: str) -> dict:
    await delete_vs(session_id)
    return {"message": f"Vector store for session {session_id} deleted."}
