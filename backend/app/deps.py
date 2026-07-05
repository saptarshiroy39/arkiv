from fastapi import Header, HTTPException


async def get_user_id(x_user_id: str = Header(None)) -> str:
    if not x_user_id:
        raise HTTPException(status_code=401, detail="User ID required")
    return x_user_id
