from langchain_core.documents import Document

from app.config import DEFAULT_SESSION_ID
from app.rag.chunker import chunk_docs
from app.rag.processor import clean_text, process_latex
from app.rag.loader import read_csv, read_docx, read_json, read_md, read_pdf, read_pptx, read_tex, read_txt, read_xlsx
from app.rag.vectorstore import add_docs

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

def _clean_docs(docs: list[Document], original_name: str = "Document") -> list[Document]:
    for doc in docs:
        doc.page_content = clean_text(doc.page_content)
        doc.page_content = process_latex(doc.page_content)
        doc.metadata["file_name"] = original_name
    return docs

def process_file(path: str, ext: str, session_id: str = DEFAULT_SESSION_ID, original_name: str = "Document") -> int:
    loader = LOADERS[ext.lower()]
    docs = loader(path)
    docs = _clean_docs(docs, original_name=original_name)
    chunks = chunk_docs(docs)
    add_docs(chunks, session_id=session_id)
    return len(chunks)
