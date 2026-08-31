from fastapi import APIRouter

router = APIRouter(tags=["RAG"])


@router.get("/chats")
async def get_chats() -> dict:
    return {"chats": []}
