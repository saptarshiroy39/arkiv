from fastapi import Request, HTTPException
from server.config import SUPABASE_ADMIN


async def get_user(request: Request):
    auth = request.headers.get("Authorization", "")
    if not auth.startswith("Bearer "):
        raise HTTPException(401, "Missing token")
    token = auth.split(" ", 1)[1]
    try:
        resp = SUPABASE_ADMIN.auth.get_user(token)
        return resp.user
    except Exception:
        raise HTTPException(401, "Invalid token")


def get_api_key(request: Request) -> str | None:
    return request.headers.get("X-Custom-Api-Key")


def get_chat_id(request: Request) -> str | None:
    return request.headers.get("X-Chat-Id")


def get_storage_mode(request: Request) -> str:
    mode = (request.headers.get("X-Storage-Mode") or "cloud").lower()
    return mode if mode in ("local", "cloud") else "cloud"
