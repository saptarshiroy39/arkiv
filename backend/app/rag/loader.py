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


# PDF
# https://docs.langchain.com/oss/python/integrations/document_loaders/pymupdf4llm
def read_pdf(path: str) -> list[Document]:
    loader = PyMuPDF4LLMLoader(path)
    docs = loader.load()
    return docs

# CSV
# https://python.langchain.com/docs/integrations/document_loaders/csv
def read_csv(path: str) -> list[Document]:
    loader = UnstructuredCSVLoader(file_path=path, mode="elements", encoding="utf-8")
    docs = loader.load()
    return docs

# TXT
# https://python.langchain.com/api_reference/community/document_loaders/langchain_community.document_loaders.text.TextLoader
def read_txt(path: str) -> list[Document]:
    loader = TextLoader(path, encoding="utf-8")
    docs = loader.load()
    return docs

# MD
# https://python.langchain.com/docs/integrations/document_loaders/unstructured_file/
def read_md(path: str) -> list[Document]:
    loader = UnstructuredMarkdownLoader(path, encoding="utf-8")
    docs = loader.load()
    return docs

# JSON
# https://python.langchain.com/docs/integrations/document_loaders/json
def read_json(path: str) -> list[Document]:
    loader = JSONLoader(file_path=path, jq_schema=".", text_content=False)
    docs = loader.load()
    return docs

# TEX
# https://python.langchain.com/api_reference/community/document_loaders/langchain_community.document_loaders.text.TextLoader
def read_tex(path: str) -> list[Document]:
    loader = TextLoader(path, encoding="utf-8")
    docs = loader.load()
    return docs

# DOCX
# https://python.langchain.com/docs/integrations/document_loaders/microsoft_word
def read_docx(path: str) -> list[Document]:
    loader = UnstructuredWordDocumentLoader(path, mode="elements")
    docs = loader.load()
    return docs

# XLSX
# https://python.langchain.com/docs/integrations/document_loaders/microsoft_excel
def read_xlsx(path: str) -> list[Document]:
    loader = UnstructuredExcelLoader(path, mode="elements")
    docs = loader.load()
    return docs

# PPTX
# https://python.langchain.com/docs/integrations/document_loaders/microsoft_powerpoint
def read_pptx(path: str) -> list[Document]:
    loader = UnstructuredPowerPointLoader(path, mode="elements")
    docs = loader.load()
    return docs
