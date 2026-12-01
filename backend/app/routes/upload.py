import asyncio
import os
import shutil
import tempfile
from fastapi import APIRouter, File, Form, HTTPException, UploadFile
from app.config import ALLOWED_TYPES, MAX_FILE_COUNT, MAX_FILE_SIZE
from app.rag.pipeline import _process
from app.rag.vectorstore import add_docs

router = APIRouter(tags=["RAG"])


@router.post("/upload")
async def upload_files(files: list[UploadFile] = File(...), session_id: str = Form(...)) -> dict:
    if len(files) > MAX_FILE_COUNT:
        raise HTTPException(400, f"Maximum {MAX_FILE_COUNT} files allowed")

    validated_files = []
    for file in files:
        if not file.filename:
            raise HTTPException(400, "Filename is missing")
        ext = file.filename.rsplit(".", 1)[-1].lower()
        if ext not in ALLOWED_TYPES:
            raise HTTPException(400, f"Unsupported file type: .{ext}")
        if file.size and file.size > MAX_FILE_SIZE:
            raise HTTPException(400, f"File too large: {file.filename}")
        validated_files.append((file, ext))

    all_chunks = []
    with tempfile.TemporaryDirectory(ignore_cleanup_errors=True) as tmp_dir:
        tasks = []
        for idx, (file, ext) in enumerate(validated_files):
            temp_path = os.path.join(tmp_dir, f"{idx}_{file.filename}")
            with open(temp_path, "wb") as out_file:
                shutil.copyfileobj(file.file, out_file)
            tasks.append(asyncio.to_thread(_process, temp_path, file.filename, ext))

        results = await asyncio.gather(*tasks)
        for chunks in results:
            all_chunks.extend(chunks)

    await add_docs(all_chunks, session_id=session_id)
    return {"message": "Files processed successfully"}
