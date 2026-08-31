from fastapi import APIRouter, HTTPException

from app.rag.vectorstore import clear_all_vs

router = APIRouter(tags=["RAG"])


@router.delete("/clear")
async def clear_index() -> dict:
    if not clear_all_vs():
        raise HTTPException(500, "Failed to clear vector stores.")
    return {"message": "All vector stores cleared."}
