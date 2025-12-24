# Arkiv Services
# 1. Handles authentication, file upload, and chat history


import os
from datetime import datetime
from typing import List

from fastapi import HTTPException, UploadFile

from .config import (
    SUPABASE_KEY,
    SUPABASE_URL,
    logger,
    supabase,
)
from .models import AnswerResponse, QuestionRequest, VerifyKeyRequest, Chunk
from .ingest.filetype import get_file_type
from .ingest.reader import read_file
from .ingest.cleaner import normalize_text, sanitize_filename
from .ingest.chunker import chunk_text
from .rag.rag import ingest_chunks, ask_question, clear_user_data as rag_clear_user_data

# Arkiv
def get_app_config():
    return {
        "supabase_url": SUPABASE_URL,
        "supabase_anon_key": SUPABASE_KEY,
    }


def get_health_status():
    return {"status": "healthy", "database": "supabase"}


async def process_uploaded_files(files: List[UploadFile], user, api_key: str = None):
    start_time = datetime.now()
    logger.info(f"Upload request from user: {user.email} | Files: {len(files)}")
    try:
        if not files:
            logger.warning(f"User {user.email} attempted upload with no files")
            raise HTTPException(status_code=400, detail="No files uploaded")

        all_chunks: List[Chunk] = []
        filenames = []
        pdf_count = 0
        image_count = 0

        for file in files:
            if not file.filename:
                continue
            
            filename = sanitize_filename(file.filename)
            filenames.append(filename)
            
            file_type = get_file_type(filename)
            if file_type == 'pdf':
                pdf_count += 1
            elif file_type == 'image':
                image_count += 1
            
            try:
                # 1. Read
                file_bytes = await file.read()
                raw_text = read_file(file_bytes, filename, file_type, api_key=api_key)
                
                # 2. Normalize
                clean_text = normalize_text(raw_text)
                
                if not clean_text:
                    logger.warning(f"No text extracted from {filename}")
                    continue
                    
                # 3. Chunk
                text_chunks = chunk_text(clean_text)
                
                # 4. Wrap
                for idx, text_piece in enumerate(text_chunks):
                    chunk = Chunk(
                        text=text_piece,
                        source=filename,
                        chunk_index=idx,
                        page_number=None,
                        metadata={"type": file_type}
                    )
                    all_chunks.append(chunk)

            except Exception as e:
                logger.error(f"Error processing file {filename}: {e}")
                continue

        if not all_chunks:
            raise HTTPException(
                status_code=400,
                detail="No text could be extracted from the uploaded files",
            )
            
        # 5. Ingest (Store)
        logger.info(f"Ingesting {len(all_chunks)} chunks for user {user.id}")
        ingest_chunks(all_chunks, user.id, api_key=api_key)

        duration = (datetime.now() - start_time).total_seconds()
        logger.info(
            f"Upload complete for {user.email} | "
            f"PDFs: {pdf_count}, Images: {image_count} | "
            f"Chunks: {len(all_chunks)} | "
            f"Duration: {duration:.2f}s"
        )

        return {
            "message": "Files processed successfully",
            "files_processed": filenames,
            "chunks_created": len(all_chunks),
            "pdfs": pdf_count,
            "images": image_count,
        }
    except Exception as e:
        logger.error(f"Upload failed for {user.email}: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))


async def verify_key_status(request: VerifyKeyRequest):
    try:
        from .rag.client import LLMClient
        client = LLMClient(api_key=request.api_key)
        return {"status": "valid", "message": "Key is valid"}
    except Exception as e:
        logger.warning(f"Key verification failed: {str(e)}")
        raise HTTPException(status_code=400, detail=f"Invalid Key: {str(e)}")


async def process_question(request: QuestionRequest, user, api_key: str = None):
    start_time = datetime.now()
    logger.info(f"Question from {user.email}: {request.question[:50]}...")
    try:
        result = ask_question(request.question, user.id, api_key=api_key)
        
        answer_text = result["answer"]
        context = result["context"]

        try:
            supabase.table("conversations").insert(
                {
                    "user_id": user.id,
                    "question": request.question,
                    "answer": answer_text,
                    "context": context,
                }
            ).execute()
        except Exception as e:
            logger.error(f"Failed to save conversation for {user.email}: {str(e)}")

        duration = (datetime.now() - start_time).total_seconds()
        logger.info(f"Answer generated for {user.email} | Duration: {duration:.2f}s")

        return AnswerResponse(answer=answer_text)
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Question failed for {user.email}: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))


async def clear_user_data(user, api_key: str = None):
    """Clears all document embeddings for a user from Pinecone."""
    try:
        logger.info(f"Clearing knowledge base for user: {user.email}")
        rag_clear_user_data(user.id, api_key=api_key)
        return {"message": "Knowledge base cleared successfully"}
    except Exception as e:
        logger.error(f"Failed to clear data for {user.email}: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


async def delete_user_account(user):
    try:
        user_id = user.id
        user_email = user.email
        logger.info(f"Account deletion requested for user: {user_email}")
        
        # 1. Delete user's conversations
        try:
            supabase.table("conversations").delete().eq("user_id", user_id).execute()
        except Exception:
            pass

        # 2. Delete Pinecone Namespace (Vector Data)
        try:
            from .storage.pinecone_store import PineconeStore
            if os.getenv("PINECONE_API_KEY"):
                store = PineconeStore()
                store.delete_namespace(str(user_id))
                logger.info(f"Deleted Pinecone namespace for user {user_email}")
            else:
                logger.warning("PINECONE_API_KEY not set, skipping vector deletion")
        except Exception as e:
            logger.warning(f"Failed to delete Pinecone namespace: {str(e)}")

        # 3. Delete the user from auth.users using admin API
        supabase.auth.admin.delete_user(user_id)
        logger.info(f"Successfully deleted user account: {user_email}")
        
        return {"message": "Account deleted successfully"}
    except Exception as e:
        logger.error(f"Failed to delete account for {user.email}: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Failed to delete account: {str(e)}")
