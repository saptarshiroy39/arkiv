from langchain_community.document_loaders import (
    JSONLoader,
    TextLoader,
    UnstructuredCSVLoader,
    UnstructuredExcelLoader,
    UnstructuredMarkdownLoader,
    UnstructuredPowerPointLoader,
    UnstructuredWordDocumentLoader,
)
from langchain_core.documents import Document
from langchain_pymupdf4llm import PyMuPDF4LLMLoader


# https://docs.langchain.com/oss/python/integrations/document_loaders/pymupdf4llm
def read_pdf(path: str) -> list[Document]:
    return PyMuPDF4LLMLoader(path).load()

# https://python.langchain.com/docs/integrations/document_loaders/csv
def read_csv(path: str) -> list[Document]:
    return UnstructuredCSVLoader(file_path=path, mode="elements", encoding="utf-8").load()

# https://python.langchain.com/api_reference/community/document_loaders/langchain_community.document_loaders.text.TextLoader
def read_txt(path: str) -> list[Document]:
    return TextLoader(path, encoding="utf-8").load()

# https://python.langchain.com/docs/integrations/document_loaders/unstructured_file/
def read_md(path: str) -> list[Document]:
    return UnstructuredMarkdownLoader(path, encoding="utf-8").load()

# https://python.langchain.com/docs/integrations/document_loaders/json
def read_json(path: str) -> list[Document]:
    return JSONLoader(file_path=path, jq_schema=".", text_content=False).load()

# https://python.langchain.com/api_reference/community/document_loaders/langchain_community.document_loaders.text.TextLoader
def read_tex(path: str) -> list[Document]:
    return TextLoader(path, encoding="utf-8").load()

# https://python.langchain.com/docs/integrations/document_loaders/microsoft_word
def read_docx(path: str) -> list[Document]:
    return UnstructuredWordDocumentLoader(path, mode="elements").load()

# https://python.langchain.com/docs/integrations/document_loaders/microsoft_excel
def read_xlsx(path: str) -> list[Document]:
    return UnstructuredExcelLoader(path, mode="elements").load()

# https://python.langchain.com/docs/integrations/document_loaders/microsoft_powerpoint
def read_pptx(path: str) -> list[Document]:
    return UnstructuredPowerPointLoader(path, mode="elements").load()


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
