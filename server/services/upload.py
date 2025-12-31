import re
from typing import List
from fastapi import HTTPException, UploadFile
from server.config import logger
from server.models import Chunk
from server.read import get_file_type, read_file
from server.process import normalize_text, sanitize_filename, chunk_text
from server.rag.rag import ingest_chunks
from .utils import simplify_error

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
                blob = await f.read()
                segments = read_file(blob, fname, ftype, api_key=api_key)
                
                if not segments:
                    logger.warning(f"Empty text in {fname}")
                    continue
                    
                full_text_parts = []
                
                for seg in segments:
                    txt = normalize_text(seg["text"])
                    if not txt: continue
                    full_text_parts.append(txt)
                
                if not full_text_parts:
                    continue
                    
                full_text = "\n\n".join(full_text_parts)
                file_chunk_idx = 0
                parts = re.split(r'\[Page (\d+)\]', full_text)
                current_page = 1
                
                if parts[0].strip():
                    for piece in chunk_text(parts[0]):
                        chunks.append(Chunk(
                            text=piece,
                            source=fname,
                            idx=file_chunk_idx,
                            meta={"type": ftype, "page": 1}
                        ))
                        file_chunk_idx += 1


                for i in range(1, len(parts), 2):
                    try:
                        current_page = int(parts[i])
                    except:
                        pass
                    
                    content = parts[i+1]
                    if not content.strip(): continue
                    
                    for piece in chunk_text(content):
                        chunks.append(Chunk(
                            text=piece,
                            source=fname,
                            idx=file_chunk_idx,
                            meta={"type": ftype, "page": current_page}
                        ))
                        file_chunk_idx += 1

            except Exception as e:
                logger.error(f"Failed handling {fname}: {e}")
                continue

        if not chunks:
            raise HTTPException(status_code=400, detail="Couldn't extract any text")
            
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
