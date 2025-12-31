from .filetype import get_file_type
from .pdf import read_pdf
from .docx import read_docx
from .excel import read_excel
from .csv import read_csv
from .pptx import read_pptx
from .image import read_image
from .text import read_text

def read_file(blob, fname, ftype, api_key=None):
    if ftype == "pdf": return read_pdf(blob, fname, api_key=api_key)
    if ftype == "docs": return read_docx(blob, fname)
    if ftype == "sheets": return read_excel(blob, fname)
    if ftype == "csv": return read_csv(blob, fname)
    if ftype == "slides": return read_pptx(blob, fname, api_key=api_key)
    if ftype == "image": return read_image(blob, fname, api_key=api_key)
    return read_text(blob, fname)

__all__ = [
    "get_file_type",
    "read_file",
    "read_pdf",
    "read_docx",
    "read_excel",
    "read_csv",
    "read_pptx",
    "read_image",
    "read_text",
]
