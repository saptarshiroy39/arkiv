import uuid

from fastapi import APIRouter

router = APIRouter(prefix="/auth", tags=["auth"])

@router.get("/guest")
async def create_guest_id() -> dict:
    return {"user_id": f"guest_{uuid.uuid4().hex[:12]}"}
