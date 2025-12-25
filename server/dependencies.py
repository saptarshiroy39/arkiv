from fastapi import Header, HTTPException
from .config import logger, supabase

async def get_user(authorization: str = Header(...)):
    if not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Missing or invalid token")
        
    token = authorization.split(" ")[1]
    try:
        res = supabase.auth.get_user(token)
        if not res or not res.user:
            raise HTTPException(status_code=401, detail="Session expired")
            
        return res.user
    except Exception:
        raise HTTPException(status_code=401, detail="Auth failed")
