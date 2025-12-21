# Arkiv Dependencies
# 1. Dependencies for Arkiv
# 2. Handles authentication, file upload, and chat history


from fastapi import Header, HTTPException

from .config import logger, supabase


async def get_user(authorization: str = Header(...)):
    if not authorization.startswith("Bearer "):
        logger.warning("Auth attempt with invalid scheme")
        raise HTTPException(status_code=401, detail="Invalid authentication scheme")
    token = authorization.split(" ")[1]
    try:
        response = supabase.auth.get_user(token)
        user = response.user if response else None
        if not user:
            logger.warning("Auth attempt with invalid token")
            raise HTTPException(status_code=401, detail="Invalid token")
        logger.debug(f"User authenticated: {user.email}")
        return user
    except Exception as e:
        logger.warning(f"Auth failed: {str(e)}")
        raise HTTPException(status_code=401, detail="Invalid token")
