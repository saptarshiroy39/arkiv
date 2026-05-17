from app.rag.vectorstore import delete_user_vectorstores
from fastapi import APIRouter, HTTPException, Depends
from app.deps import get_user_id

router = APIRouter()

@router.delete("/clear")
async def clear_index(user_id: str = Depends(get_user_id)) -> dict:
    if not delete_user_vectorstores(user_id):
        raise HTTPException(500, "Failed to clear the user's vector stores.")
    return {"message": "User's vector stores cleared."}
