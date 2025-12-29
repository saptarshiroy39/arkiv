from fastapi import HTTPException
from server.config import SUPABASE_KEY, SUPABASE_URL
from server.models import KeyRequest

def simplify_error(e: Exception) -> str:
    msg = str(e).lower()
    if "api_key_invalid" in msg or "api key not valid" in msg:
        return "Invalid API key"
    if "quota" in msg or "rate limit" in msg:
        return "API quota exceeded"
    if "permission" in msg or "forbidden" in msg:
        return "API access denied"
    if "not found" in msg:
        return "Resource not found"
    return str(e)[:50] if len(str(e)) > 50 else str(e)

def get_app_config():
    return {"url": SUPABASE_URL, "anon_key": SUPABASE_KEY}

def get_health_status():
    return {"status": "ok", "db": "connected"}

async def verify_key_status(req: KeyRequest):
    try:
        import google.generativeai as genai
        genai.configure(api_key=req.key)
        model = genai.GenerativeModel("gemini-2.0-flash")
        response = model.generate_content("Hi")
        if response.text:
            return {"status": "valid"}
        raise Exception("No response from API")
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Invalid Key: {str(e)}")

