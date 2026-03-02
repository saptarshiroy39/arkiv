import logging

from fastapi import APIRouter, Depends, File, HTTPException, Request, UploadFile
from langchain_google_genai import GoogleGenerativeAIEmbeddings

from server.config import (
    EMBED_MODEL,
    MAX_FILE_SIZE,
    SUPABASE_ADMIN,
    SUPABASE_ANON_KEY,
    SUPABASE_URL,
)
from server.dependencies import get_api_key, get_chat_id, get_storage_mode, get_user
from server.models import AskRequest, AskResponse, VerifyKeyRequest
from server.services.chat import chat_with_docs
from server.services.upload import process_file
from server.services.utils import cleanup, get_file_type, save_temp
from server.storage.faiss_store import delete_faiss_namespace, delete_faiss_user_data
from server.storage.pinecone import delete_namespace, delete_user_data

logger = logging.getLogger("arkiv")
router = APIRouter()
ALLOWED_TYPES = {"pdf", "image", "docs", "sheets", "csv", "slides", "text"}


@router.get("/health")
async def health():
    return {"status": "ok"}


@router.get("/config")
async def config():
    return {"url": SUPABASE_URL, "anon_key": SUPABASE_ANON_KEY}


@router.post("/upload")
async def upload(
    request: Request, files: list[UploadFile] = File(...), user=Depends(get_user)
):
    api_key = get_api_key(request)
    chat_id = get_chat_id(request)
    storage_mode = get_storage_mode(request)
    if not chat_id:
        raise HTTPException(400, "Missing X-Chat-Id header")

    processed = []
    for file in files:
        ftype = get_file_type(file.filename or "")
        if ftype not in ALLOWED_TYPES:
            raise HTTPException(400, f"Unsupported file type: {file.filename}")

        content = await file.read()
        if len(content) > MAX_FILE_SIZE:
            raise HTTPException(413, f"File too large: {file.filename}. Max: 50 MB")

        path = save_temp(content, file.filename or "")
        try:
            result = await process_file(
                path, file.filename, user.id, chat_id, api_key, storage_mode
            )
            processed.append(result)
        except ValueError as e:
            raise HTTPException(400, str(e))
        except Exception as e:
            logger.exception(f"Upload failed: {file.filename}")
            raise HTTPException(500, f"Processing failed: {str(e)[:200]}")
        finally:
            cleanup(path)

    return {"processed": processed}


@router.post("/ask", response_model=AskResponse)
async def ask(body: AskRequest, request: Request, user=Depends(get_user)):
    api_key = get_api_key(request)
    storage_mode = get_storage_mode(request)
    try:
        result = await chat_with_docs(
            body.text, user.id, body.chat_id, api_key, storage_mode
        )
        return AskResponse(text=result["text"], sources=result.get("sources"))
    except Exception as e:
        if "429" in str(e):
            raise HTTPException(
                429, "Rate limit reached. Please wait a moment and try again."
            )
        logger.exception("Ask failed")
        raise HTTPException(500, f"Failed to generate answer: {str(e)[:200]}")


@router.delete("/clear-data")
async def clear_data(request: Request, user=Depends(get_user)):
    chat_id = get_chat_id(request)
    storage_mode = get_storage_mode(request)
    namespace = f"{user.id}_{chat_id}" if chat_id else user.id
    try:
        if storage_mode == "local":
            delete_faiss_namespace(namespace)
        else:
            delete_namespace(namespace)
    except Exception as e:
        logger.exception("Clear data failed")
        raise HTTPException(500, f"Failed to clear data: {str(e)[:200]}")
    return {"status": "cleared"}


@router.delete("/account")
async def delete_account(user=Depends(get_user)):
    try:
        delete_user_data(user.id)
    except Exception:
        logger.exception("Failed to clear Pinecone data on account delete")
    try:
        delete_faiss_user_data(user.id)
    except Exception:
        logger.exception("Failed to clear FAISS data on account delete")
    try:
        SUPABASE_ADMIN.auth.admin.delete_user(user.id)
    except Exception as e:
        raise HTTPException(500, str(e))
    return {"status": "deleted"}


@router.post("/verify-key")
async def verify_key(body: VerifyKeyRequest):
    try:
        embeddings = GoogleGenerativeAIEmbeddings(
            model=EMBED_MODEL, google_api_key=body.key
        )
        embeddings.embed_query("test")
        return {"valid": True}
    except Exception:
        raise HTTPException(400, "Invalid API key")
