# Arkiv Services
# 1. Handles authentication, file upload, and chat history


import os
from datetime import datetime
from typing import List

from fastapi import HTTPException, UploadFile

from .config import (
    CSV_EXTENSIONS,
    EXCEL_EXTENSIONS,
    IMAGE_EXTENSIONS,
    MARKDOWN_EXTENSIONS,
    PDF_EXTENSIONS,
    POWERPOINT_EXTENSIONS,
    SUPABASE_KEY,
    SUPABASE_URL,
    TEXT_EXTENSIONS,
    WORD_EXTENSIONS,
    logger,
    supabase,
)
from .extractor import extract_text_from_file
from .models import AnswerResponse, QuestionRequest, VerifyKeyRequest
from .rag import (
    get_conversational_chain,
    get_text_chunks,
    get_vectorstore,
    load_vectorstore,
)


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

        all_texts = []
        filenames = []
        pdf_count = 0
        image_count = 0

        for file in files:
            if not file.filename:
                continue
            filename = file.filename.lower()
            ext = os.path.splitext(filename)[1]

            filenames.append(file.filename)
            if ext in IMAGE_EXTENSIONS:
                image_count += 1
            else:
                pdf_count += 1

            try:
                file_bytes = await file.read()
                text = extract_text_from_file(file_bytes, file.filename, api_key=api_key)
                all_texts.append(text)
            except ValueError as ve:
                 raise HTTPException(
                    status_code=400,
                    detail=str(ve),
                )

        combined_text = "\n\n".join(all_texts)
        logger.info(f"Total extracted text length: {len(combined_text)} chars")
        if not combined_text.strip():
            raise HTTPException(
                status_code=400,
                detail="No text could be extracted from the uploaded files",
            )

        text_chunks = get_text_chunks(combined_text)
        logger.info(f"Created {len(text_chunks)} chunks from text")
        get_vectorstore(text_chunks, user.id, api_key=api_key)
        logger.info(f"Successfully stored {len(text_chunks)} chunks in local vectorstore")

        duration = (datetime.now() - start_time).total_seconds()
        logger.info(
            f"Upload complete for {user.email} | "
            f"PDFs: {pdf_count}, Images: {image_count} | "
            f"Chunks: {len(text_chunks)} | "
            f"Duration: {duration:.2f}s"
        )

        return {
            "message": "Files processed successfully",
            "files_processed": filenames,
            "chunks_created": len(text_chunks),
            "pdfs": pdf_count,
            "images": image_count,
        }
    except Exception as e:
        error_str = str(e)
        if "429" in error_str and ("Quota" in error_str or "quota" in error_str):
             logger.warning(f"Quota exceeded (caught via string): {user.email}")
             if api_key:
                 detail = "Your Custom Google API Key quota exceeded."
             else:
                 detail = "Global Server Quota Exceeded."
             raise HTTPException(status_code=429, detail=detail)

        logger.error(f"Upload failed for {user.email}: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))


async def verify_key_status(request: VerifyKeyRequest):
    try:
        chain = get_conversational_chain(api_key=request.api_key)
        
        response = chain.invoke({
            "context": "Verification test.",
            "question": "Reply with 'Success' if you can read this."
        })
        
        return {"status": "valid", "message": "Key is valid"}
        
    except Exception as e:
        logger.warning(f"Key verification failed: {str(e)}")
        raise HTTPException(status_code=400, detail=f"Invalid Key: {str(e)}")


async def process_question(request: QuestionRequest, user, api_key: str = None):
    start_time = datetime.now()
    logger.info(f"Question from {user.email}: {request.question[:50]}...")
    try:
        db = load_vectorstore(user.id)
        
        if db is None:
            logger.info(f"No vectorstore found for user {user.id}")
            raise HTTPException(
                status_code=400,
                detail="📄 Please upload documents first before asking questions.",
            )
        
        # Search local FAISS vectorstore
        docs = db.similarity_search(request.question, k=4)
        
        if not docs:
            logger.info(f"No similar documents found for user {user.id}")
            raise HTTPException(
                status_code=400,
                detail="📄 Please upload documents first before asking questions.",
            )

        context = "\n\n".join([doc.page_content for doc in docs])
        logger.info(f"Found {len(docs)} documents for query. Context length: {len(context)} chars")

        chain = get_conversational_chain(api_key=api_key)
        response = chain.invoke({"context": context, "question": request.question})

        # Extract text from response (handles newer Gemini list-based responses)
        answer_text = response.content
        if isinstance(answer_text, list):
            answer_text = "".join([item.get("text", "") for item in answer_text if isinstance(item, dict) and item.get("type") == "text"])
        else:
            answer_text = str(answer_text)

        try:
            supabase.table("conversations").insert(
                {
                    "user_id": user.id,
                    "question": request.question,
                    "answer": answer_text,
                    "context": context,
                }
            ).execute()
            logger.debug(f"Conversation saved for user {user.email}")
        except Exception as e:
            logger.error(f"Failed to save conversation for {user.email}: {str(e)}")

        duration = (datetime.now() - start_time).total_seconds()
        logger.info(f"Answer generated for {user.email} | Duration: {duration:.2f}s")

        return AnswerResponse(answer=answer_text)
    except HTTPException:
        raise
    except Exception as e:
        error_str = str(e)
        if "429" in error_str and ("Quota" in error_str or "quota" in error_str):
             logger.warning(f"Quota exceeded (caught via string): {user.email}")
             if api_key:
                 detail = "Your Custom Google API Key quota exceeded."
             else:
                 detail = "Server Quota Exceeded. Please try again later or add your own Google API Key in Settings."
             raise HTTPException(status_code=429, detail=detail)

        logger.error(f"Question failed for {user.email}: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))


async def get_user_stats(user):
    try:
        result = supabase.table("user_stats").select("*").eq("user_id", user.id).execute()
        if result.data and len(result.data) > 0:
            row = result.data[0]
            return {"files_processed": row["files_processed"], "tokens_used": row["tokens_used"]}
        else:
            supabase.table("user_stats").insert({"user_id": user.id, "files_processed": 0, "tokens_used": 0}).execute()
            return {"files_processed": 0, "tokens_used": 0}
    except Exception as e:
        logger.error(f"Failed to get stats for {user.email}: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


async def update_user_stats(user, files_delta: int = 0, tokens_delta: int = 0):
    try:
        result = supabase.table("user_stats").select("*").eq("user_id", user.id).execute()
        if result.data and len(result.data) > 0:
            row = result.data[0]
            new_files = row["files_processed"] + files_delta
            new_tokens = row["tokens_used"] + tokens_delta
        else:
            new_files = files_delta
            new_tokens = tokens_delta
        
        supabase.table("user_stats").upsert({
            "user_id": user.id,
            "files_processed": new_files,
            "tokens_used": new_tokens
        }).execute()
        
        return {"files_processed": new_files, "tokens_used": new_tokens}
    except Exception as e:
        logger.error(f"Failed to update stats for {user.email}: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


async def delete_user_account(user):
    try:
        user_id = user.id
        user_email = user.email
        logger.info(f"Account deletion requested for user: {user_email}")
        
        # 1. Delete user's conversations (Cascades if constraint fixed, but safe to run)
        try:
            supabase.table("conversations").delete().eq("user_id", user_id).execute()
        except Exception:
            pass

        # 2. Delete user's stats (Cascades if constraint fixed)
        try:
            supabase.table("user_stats").delete().eq("user_id", user_id).execute()
        except Exception:
            pass

        # 3. CRITICAL: Delete storage objects using the RPC function we just created
        try:
            supabase.rpc('delete_storage_objects_for_user', {'target_user_id': user_id}).execute()
            logger.info(f"Deleted storage objects for user {user_email}")
        except Exception as e:
            logger.warning(f"Failed to delete storage objects (RPC): {str(e)}")

        # 4. Delete the user from auth.users using admin API
        supabase.auth.admin.delete_user(user_id)
        logger.info(f"Successfully deleted user account: {user_email}")
        
        return {"message": "Account deleted successfully"}
    except Exception as e:
        logger.error(f"Failed to delete account for {user.email}: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Failed to delete account: {str(e)}")
