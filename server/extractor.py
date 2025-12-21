# Arkiv Extractor
# 1. Handles extraction of text from various file formats: PDF, Word, Excel, PowerPoint, Text, CSV, Markdown


import csv
import io

from docx import Document as DocxDocument
from openpyxl import load_workbook
from pptx import Presentation
from PyPDF2 import PdfReader
import pdfplumber

from .config import logger
from .processor import sanitize_text


def _extract_pdf_with_pypdf2(file_bytes: bytes, filename: str) -> str | None:
    """Try to extract text using PyPDF2, with decryption support for protected PDFs."""
    try:
        pdf_reader = PdfReader(io.BytesIO(file_bytes))
        
        # Check if PDF is encrypted and try to decrypt with empty password
        if pdf_reader.is_encrypted:
            try:
                # Many "protected" PDFs use empty password for owner restrictions
                decrypt_result = pdf_reader.decrypt("")
                if decrypt_result == 0:
                    # Decryption failed, try with empty string as second attempt
                    pdf_reader.decrypt("")
            except Exception as decrypt_error:
                logger.warning(f"PyPDF2 decryption failed for {filename}: {decrypt_error}")
                return None
        
        text = f"=== PDF Document: {filename} ===\n"
        extracted_any = False
        
        for page in pdf_reader.pages:
            try:
                page_text = page.extract_text()
                if page_text and page_text.strip():
                    text += page_text + "\n"
                    extracted_any = True
            except Exception as page_error:
                logger.warning(f"PyPDF2 failed to extract page in {filename}: {page_error}")
                continue
        
        if extracted_any:
            return text
        return None
        
    except Exception as e:
        logger.warning(f"PyPDF2 extraction failed for {filename}: {e}")
        return None


def _extract_pdf_with_pdfplumber(file_bytes: bytes, filename: str) -> str | None:
    """Fallback extraction using pdfplumber for protected or complex PDFs."""
    try:
        text = f"=== PDF Document: {filename} ===\n"
        extracted_any = False
        
        with pdfplumber.open(io.BytesIO(file_bytes)) as pdf:
            for page in pdf.pages:
                try:
                    page_text = page.extract_text()
                    if page_text and page_text.strip():
                        text += page_text + "\n"
                        extracted_any = True
                except Exception as page_error:
                    logger.warning(f"pdfplumber failed to extract page in {filename}: {page_error}")
                    continue
        
        if extracted_any:
            return text
        return None
        
    except Exception as e:
        logger.warning(f"pdfplumber extraction failed for {filename}: {e}")
        return None


def process_word_document(file_bytes: bytes, filename: str) -> str:
    """Extract text from Word documents (.doc, .docx)."""
    try:
        doc = DocxDocument(io.BytesIO(file_bytes))
        texts = [f"=== Word Document: {filename} ===\n"]
        for para in doc.paragraphs:
            if para.text.strip():
                texts.append(para.text)
        # Also extract text from tables
        for table in doc.tables:
            for row in table.rows:
                row_text = "\t".join(cell.text for cell in row.cells)
                if row_text.strip():
                    texts.append(row_text)
        return sanitize_text("\n".join(texts))
    except Exception as e:
        logger.error(f"Word processing failed for {filename}: {str(e)}")
        return f"[Word Document: {filename} - Failed to extract text]"


def process_excel_document(file_bytes: bytes, filename: str) -> str:
    """Extract text from Excel files (.xls, .xlsx)."""
    try:
        wb = load_workbook(io.BytesIO(file_bytes), data_only=True)
        texts = [f"=== Excel Spreadsheet: {filename} ===\n"]
        for sheet_name in wb.sheetnames:
            sheet = wb[sheet_name]
            texts.append(f"\n--- Sheet: {sheet_name} ---\n")
            for row in sheet.iter_rows(values_only=True):
                row_values = [str(cell) if cell is not None else "" for cell in row]
                if any(v.strip() for v in row_values):
                    texts.append("\t".join(row_values))
        return sanitize_text("\n".join(texts))
    except Exception as e:
        logger.error(f"Excel processing failed for {filename}: {str(e)}")
        return f"[Excel: {filename} - Failed to extract text]"


def process_powerpoint_document(file_bytes: bytes, filename: str) -> str:
    """Extract text from PowerPoint files (.ppt, .pptx)."""
    try:
        prs = Presentation(io.BytesIO(file_bytes))
        texts = [f"=== PowerPoint: {filename} ===\n"]
        for slide_num, slide in enumerate(prs.slides, 1):
            texts.append(f"\n--- Slide {slide_num} ---\n")
            for shape in slide.shapes:
                if hasattr(shape, "text") and shape.text.strip():
                    texts.append(shape.text)
        return sanitize_text("\n".join(texts))
    except Exception as e:
        logger.error(f"PowerPoint processing failed for {filename}: {str(e)}")
        return f"[PowerPoint: {filename} - Failed to extract text]"


def process_pdf_document(file_bytes: bytes, filename: str) -> str:
    """
    Tries multiple extraction methods:
    1. PyPDF2 with empty password decryption (handles most protected PDFs)
    2. pdfplumber as fallback (uses pdfminer, handles some edge cases)
    """
    # First, try PyPDF2 (faster, handles most cases)
    result = _extract_pdf_with_pypdf2(file_bytes, filename)
    if result:
        logger.info(f"Successfully extracted PDF with PyPDF2: {filename}")
        return sanitize_text(result)
    
    # Fallback to pdfplumber for protected or complex PDFs
    logger.info(f"PyPDF2 failed, trying pdfplumber for: {filename}")
    result = _extract_pdf_with_pdfplumber(file_bytes, filename)
    if result:
        logger.info(f"Successfully extracted PDF with pdfplumber: {filename}")
        return sanitize_text(result)
    
    # Both methods failed
    logger.error(f"All PDF extraction methods failed for {filename}")
    return f"[PDF: {filename} - Failed to extract text. The PDF may be password-protected or contain only images.]"


def process_text_document(file_bytes: bytes, filename: str) -> str:
    """Extract text from plain text files."""
    try:
        return sanitize_text(f"=== Text File: {filename} ===\n" + file_bytes.decode('utf-8', errors='ignore'))
    except Exception as e:
        logger.error(f"Text processing failed for {filename}: {str(e)}")
        return f"[Text File: {filename} - Failed to read text]"


def process_csv_document(file_bytes: bytes, filename: str) -> str:
    """Extract text from CSV files."""
    try:
        content = file_bytes.decode('utf-8', errors='ignore')
        texts = [f"=== CSV File: {filename} ===\n"]
        reader = csv.reader(content.splitlines())
        for row in reader:
            if any(cell.strip() for cell in row):
                texts.append("\t".join(row))
        return sanitize_text("\n".join(texts))
    except Exception as e:
        logger.error(f"CSV processing failed for {filename}: {str(e)}")
        return f"[CSV: {filename} - Failed to extract data]"


def process_markdown_document(file_bytes: bytes, filename: str) -> str:
    """Extract text from Markdown files, preserving structure."""
    try:
        content = file_bytes.decode('utf-8', errors='ignore')
        return sanitize_text(f"=== Markdown Document: {filename} ===\n" + content)
    except Exception as e:
        logger.error(f"Markdown processing failed for {filename}: {str(e)}")
        return f"[Markdown: {filename} - Failed to read text]"
