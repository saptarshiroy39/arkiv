import os
from typing import List
from fastapi import HTTPException, UploadFile
from .config import SUPABASE_KEY, SUPABASE_URL, logger, supabase
from .models import Answer, Question, KeyRequest, Chunk
from .ingest.filetype import get_file_type
from .ingest.reader import read_file
from .ingest.cleaner import normalize_text, sanitize_filename
from .ingest.chunker import chunk_text
from .rag.rag import ingest_chunks, ask_question, clear_user_data as rag_clear_user_data

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

async def process_uploaded_files(files: List[UploadFile], user, chat_id: str = None, api_key: str = None):
    logger.info(f"Uploading {len(files)} files for {user.email}")
    try:
        if not files:
            raise HTTPException(status_code=400, detail="No files provided")

        chunks: List[Chunk] = []
        done_files = []
        
        for f in files:
            if not f.filename: continue
            
            fname = sanitize_filename(f.filename)
            done_files.append(fname)
            ftype = get_file_type(fname)
            
            try:
                # read and clean
                blob = await f.read()
                segments = read_file(blob, fname, ftype, api_key=api_key)
                
                if not segments:
                    logger.warning(f"Empty text in {fname}")
                    continue
                    
                # chunk it
                file_chunk_idx = 0
                for seg in segments:
                    txt = normalize_text(seg["text"])
                    if not txt: continue
                    
                    for piece in chunk_text(txt):
                        chunks.append(Chunk(
                            text=piece,
                            source=fname,
                            idx=file_chunk_idx,
                            meta={"type": ftype, "page": seg["page"]}
                        ))
                        file_chunk_idx += 1

            except Exception as e:
                logger.error(f"Failed handling {fname}: {e}")
                continue

        if not chunks:
            raise HTTPException(status_code=400, detail="Couldn't extract any text")
            
        # save to vector store
        ingest_chunks(chunks, user.id, chat_id=chat_id, api_key=api_key)
        logger.info(f"Saved {len(chunks)} chunks for {user.id}")

        return {
            "status": "success",
            "processed": done_files,
            "count": len(chunks)
        }
    except Exception as e:
        logger.error(f"Upload error for {user.email}: {e}")
        raise HTTPException(status_code=500, detail=simplify_error(e))

async def verify_key_status(req: KeyRequest):
    try:
        from .rag.client import LLMClient
        LLMClient(api_key=req.key)
        return {"status": "valid"}
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Invalid Key: {e}")

async def process_question(req: Question, user, chat_id: str = None, api_key: str = None):
    try:
        res = ask_question(req.text, user.id, chat_id=chat_id, api_key=api_key)
        
        try:
            supabase.table("conversations").insert({
                "user_id": user.id,
                "question": req.text,
                "answer": res["answer"],
                "context": res["context"],
            }).execute()
        except Exception:
            logger.error(f"DB save failed for {user.email}")

        return Answer(text=res["answer"])
    except Exception as e:
        logger.error(f"Chat error for {user.email}: {e}")
        raise HTTPException(status_code=500, detail=simplify_error(e))

async def clear_user_data(user, chat_id: str = None, api_key: str = None):
    try:
        rag_clear_user_data(user.id, chat_id=chat_id, api_key=api_key)
        
        return {"message": "Data cleared"}
    except Exception as e:
        logger.error(f"Clear failed: {e}")
        raise HTTPException(status_code=500, detail="Failed to clear data")

async def delete_user_account(user):
    try:
        uid = user.id
        supabase.table("conversations").delete().eq("user_id", uid).execute()
        
        try:
            from .rag.retriever import Retriever
            Retriever(uid).clear_data()
            
        except Exception:
            pass

        supabase.auth.admin.delete_user(uid)
        logger.info(f"Deleted user: {user.email}")
        
        return {"message": "Account deleted"}
    except Exception as e:
        logger.error(f"Delete account error: {e}")
        raise HTTPException(status_code=500, detail="Failed to delete account")
