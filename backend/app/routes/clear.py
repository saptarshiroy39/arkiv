from fastapi import APIRouter
from app.rag.vectorstore import clear_all_vs

router = APIRouter(tags=["RAG"])


@router.delete("/clear")
async def clear_index() -> dict:
    await clear_all_vs()
    return {"message": "All vector stores cleared."}
