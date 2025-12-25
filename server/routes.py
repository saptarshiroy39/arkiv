from typing import List
from fastapi import APIRouter, Depends, File, Header, UploadFile
from . import services
from .dependencies import get_user
from .models import Answer, Config, Question, KeyRequest

router = APIRouter()

@router.get("/config", response_model=Config)
async def get_config():
    c = services.get_app_config()
    return {"url": c["supabase_url"], "anon_key": c["supabase_anon_key"]}

@router.get("/health")
async def health():
    return services.get_health_status()

@router.post("/upload")
async def upload(
    files: List[UploadFile] = File(...), 
    user=Depends(get_user),
    key: str = Header(None, alias="x-custom-api-key")
):
    return await services.process_uploaded_files(files, user, api_key=key)

@router.post("/ask", response_model=Answer)
async def ask(
    req: Question, 
    user=Depends(get_user),
    key: str = Header(None, alias="x-custom-api-key")
):
    return await services.process_question(req, user, api_key=key)

@router.post("/verify-key")
async def verify(req: KeyRequest):
    return await services.verify_key_status(req)

@router.delete("/clear-data")
async def clear(
    user=Depends(get_user),
    key: str = Header(None, alias="x-custom-api-key")
):
    return await services.clear_user_data(user, api_key=key)

@router.delete("/account")
async def delete_acc(user=Depends(get_user)):
    return await services.delete_user_account(user)
