from app.rag.chunker import chunk_docs
from app.rag.cleaner import clean_text, process_latex
from app.rag.loader import (
    read_pdf,
    read_csv,
    read_txt,
    read_md,
    read_json,
    read_tex,
    read_docx,
    read_xlsx,
    read_pptx,
)
from app.rag.vectorstore import add_documents
from langchain_core.documents import Document

LOADERS = {
    "pdf": read_pdf,
    "csv": read_csv,
    "txt": read_txt,
    "md": read_md,
    "json": read_json,
    "tex": read_tex,
    "docx": read_docx,
    "xlsx": read_xlsx,
    "pptx": read_pptx,
}

def _clean_docs(docs: list[Document]) -> list[Document]:
    for doc in docs:
        doc.page_content = clean_text(doc.page_content)
        doc.page_content = process_latex(doc.page_content)
    return docs

def process_file(path: str, ext: str, session_id: str = "default_index") -> int:
    loader = LOADERS.get(ext.lower())
    if loader is None:
        raise ValueError(f"Unsupported file type: .{ext}")

    docs = loader(path)
    docs = _clean_docs(docs)
    chunks = chunk_docs(docs)
    add_documents(chunks, session_id=session_id)
    return len(chunks)
