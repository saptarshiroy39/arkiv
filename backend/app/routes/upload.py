import os
import shutil
import tempfile

from fastapi import APIRouter, File, Form, HTTPException, UploadFile

from app.config import ALLOWED_TYPES, MAX_FILE_COUNT, MAX_FILE_SIZE
from app.rag.pipeline import process_file

router = APIRouter(tags=["RAG"])


@router.post("/upload")
async def upload_files(files: list[UploadFile] = File(...), session_id: str = Form(...)) -> dict:
    if len(files) > MAX_FILE_COUNT:
        raise HTTPException(400, f"Maximum {MAX_FILE_COUNT} files allowed")

    results, errors, total_chunks = [], [], 0

    with tempfile.TemporaryDirectory() as tmp_dir:
        for file in files:
            original_name = file.filename or "upload.bin"
            ext = original_name.rsplit(".", 1)[-1].lower() if "." in original_name else ""
            
            if ext not in ALLOWED_TYPES:
                errors.append({"source": original_name,"error": f"Unsupported file type: .{ext}",})
                continue

            if file.size and file.size > MAX_FILE_SIZE:
                errors.append({"source": original_name, "error": "File too large"})
                continue

            temp_path = os.path.join(tmp_dir, f"temp.{ext}")

            try:
                with open(temp_path, "wb") as out_file:
                    shutil.copyfileobj(file.file, out_file)

                chunks = process_file(temp_path, ext, session_id=session_id)
                total_chunks += chunks
                results.append({"source": original_name, "chunks": chunks})
            except Exception as e:
                errors.append({"source": original_name, "error": str(e)})

    if not results and errors:
        raise HTTPException(
            422, {"message": "All files failed to process", "errors": errors}
        )

    return {
        "total_files": len(files),
        "total_chunks": total_chunks,
        "details": results,
        "errors": errors,
    }
