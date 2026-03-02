import asyncio

from langchain_core.documents import Document
from langchain_text_splitters import RecursiveCharacterTextSplitter

from server.config import CHUNK_OVERLAP, CHUNK_SIZE
from server.services.utils import clean_text, get_file_type, process_latex
from server.read.csv import read_csv
from server.read.docx import read_docx
from server.read.excel import read_excel
from server.read.image import read_image
from server.read.pdf import read_pdf
from server.read.pptx import read_pptx
from server.read.text import read_text
from server.storage.pinecone import get_vectorstore
from server.storage.faiss_store import add_documents_faiss

READERS = {
    "pdf": read_pdf,
    "docs": read_docx,
    "sheets": read_excel,
    "csv": read_csv,
    "slides": read_pptx,
    "text": read_text,
}

splitter = RecursiveCharacterTextSplitter(chunk_size=CHUNK_SIZE, chunk_overlap=CHUNK_OVERLAP)


async def process_file(path, filename, user_id, chat_id, api_key=None, storage_mode="cloud"):
    ftype = get_file_type(filename)

    # 1. Read
    if ftype == "image":
        pages = await asyncio.to_thread(read_image, path, api_key)
    elif ftype in READERS:
        pages = await asyncio.to_thread(READERS[ftype], path)
    else:
        raise ValueError(f"Unsupported: {filename}")

    # 2. Clean + LaTeX → Documents
    docs = []
    for page in pages:
        text = process_latex(clean_text(page["text"]))
        if text:
            docs.append(Document(page_content=text, metadata={"file": filename, "page": page["page"]}))

    if not docs:
        return {"file": filename, "chunks": 0}

    # 3. Split
    chunks = splitter.split_documents(docs)

    # 4. Embed + Store
    namespace = f"{user_id}_{chat_id}"
    if storage_mode == "local":
        await asyncio.to_thread(add_documents_faiss, namespace, chunks, api_key)
    else:
        store = get_vectorstore(namespace, api_key)
        await asyncio.to_thread(store.add_documents, chunks)

    return {"file": filename, "chunks": len(chunks)}
