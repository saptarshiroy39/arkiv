# Arkiv Routes
# 1. Handles authentication, file upload, and chat history

from typing import List

from fastapi import APIRouter, Depends, File, Header, UploadFile

from . import services
from .dependencies import get_user
from .models import (
    AnswerResponse,
    ConfigResponse,
    QuestionRequest,
    VerifyKeyRequest,
)

router = APIRouter()


@router.get("/config", response_model=ConfigResponse)
async def get_config():
    return services.get_app_config()


@router.get("/health")
async def health_check():
    return services.get_health_status()


@router.post("/upload")
async def upload_files(
    files: List[UploadFile] = File(...), 
    user=Depends(get_user),
    x_custom_api_key: str = Header(None)
):
    return await services.process_uploaded_files(files, user, api_key=x_custom_api_key)


@router.post("/ask", response_model=AnswerResponse)
async def ask_question(
    request: QuestionRequest, 
    user=Depends(get_user),
    x_custom_api_key: str = Header(None)
):
    return await services.process_question(request, user, api_key=x_custom_api_key)


@router.post("/verify-key")
async def verify_key(request: VerifyKeyRequest):
    return await services.verify_key_status(request)


@router.delete("/clear-data")
async def clear_data(
    user=Depends(get_user),
    x_custom_api_key: str = Header(None)
):
    return await services.clear_user_data(user, api_key=x_custom_api_key)


@router.delete("/account")
async def delete_account(user=Depends(get_user)):
    return await services.delete_user_account(user)
