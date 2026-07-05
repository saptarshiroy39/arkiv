import os

from fastapi import APIRouter, Depends, File, Form, HTTPException, UploadFile

from app.config import ALLOWED_TYPES, MAX_FILE_COUNT, MAX_FILE_SIZE, UPLOAD_DIR
from app.deps import get_user_id
from app.rag.pipeline import process_file

router = APIRouter()

@router.post("/upload")
async def upload_files(files: list[UploadFile] = File(...), session_id: str = Form(...), user_id: str = Depends(get_user_id)) -> dict:
    prefixed_session_id = f"{user_id}_{session_id}"
    results = []
    errors = []
    total_chunks = 0

    if len(files) > MAX_FILE_COUNT:
        raise HTTPException(400, f"Maximum {MAX_FILE_COUNT} files allowed")

    os.makedirs(UPLOAD_DIR, exist_ok=True)

    for file in files:
        original_name = file.filename or "upload.bin"
        safe_name = os.path.basename(original_name)
        ext = safe_name.rsplit(".", 1)[-1].lower()
        if ext not in ALLOWED_TYPES:
            errors.append({"source": original_name, "error": f"Unsupported file type: .{ext}"})
            continue

        content = await file.read()
        if len(content) > MAX_FILE_SIZE:
            errors.append({"source": original_name, "error": "File too large"})
            continue

        path = os.path.join(UPLOAD_DIR, safe_name)

        try:
            with open(path, "wb") as f:
                f.write(content)
            chunks = process_file(path, ext, session_id=prefixed_session_id)
            total_chunks += chunks
            results.append({"source": original_name, "chunks": chunks})
        except Exception as e:
            errors.append({"source": original_name, "error": str(e)})
        finally:
            if os.path.exists(path):
                os.remove(path)

    if not results and errors:
        raise HTTPException(422, {"message": "All files failed to process", "errors": errors})

    return {
        "total_files": len(files),
        "total_chunks": total_chunks,
        "details": results,
        "errors": errors,
    }
