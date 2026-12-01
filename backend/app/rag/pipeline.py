import re
from langchain_core.documents import Document
from app.rag.chunker import chunk_docs
from app.rag.loader import LOADERS


RE_SPACES = re.compile(r"[ \t]+")
RE_NEWLINES = re.compile(r"\n{3,}")


def _clean(text: str) -> str:
    if not text:
        return ""
    text = text.replace("\x00", "")
    text = RE_SPACES.sub(" ", text)
    return RE_NEWLINES.sub("\n\n", text).strip()


def _format(docs: list[Document]) -> str:
    formatted_chunks = []
    for doc in docs:
        file_name = doc.metadata.get("file_name", "Document")
        p = doc.metadata.get("page_label") or doc.metadata.get("page")
        page = p + 1 if isinstance(p, int) else p
        header = f"[Source: {file_name} | Page: {page}]" if page is not None else f"[Source: {file_name}]"
        formatted_chunks.append(f"{header}\n{doc.page_content}")
    return "\n\n---\n\n".join(formatted_chunks)


def _process(path: str, name: str, ext: str) -> list[Document]:
    docs = LOADERS[ext](path)
    for doc in docs:
        doc.page_content = _clean(doc.page_content)
        doc.metadata["file_name"] = name
    return chunk_docs(docs)
