import io
import csv
import logging
from typing import Optional, Callable, Dict

import pdfplumber
from docx import Document as DocxDocument
from openpyxl import load_workbook
from pptx import Presentation
from PIL import Image


import google.generativeai as genai
from server.config import genai as default_genai, logger


def read_pdf(file_bytes: bytes, filename: str, **kwargs) -> str:
    text_parts = []
    try:
        with pdfplumber.open(io.BytesIO(file_bytes)) as pdf:
            for page in pdf.pages:
                text = page.extract_text()
                if text:
                    text_parts.append(text)
        
        if not text_parts:
             return f"[PDF: {filename} - No extractable text found]"
             
        return "\n".join(text_parts)
    except Exception as e:
        logger.error(f"Error reading PDF {filename}: {e}")
        return ""

def read_docx(file_bytes: bytes, filename: str, **kwargs) -> str:
    text_parts = []
    try:
        doc = DocxDocument(io.BytesIO(file_bytes))
        for para in doc.paragraphs:
            if para.text.strip():
                text_parts.append(para.text)
        
        for table in doc.tables:
            for row in table.rows:
                row_text = "\t".join(cell.text for cell in row.cells)
                if row_text.strip():
                    text_parts.append(row_text)
                    
        return "\n".join(text_parts)
    except Exception as e:
        logger.error(f"Error reading DOCX {filename}: {e}")
        return ""

def read_excel(file_bytes: bytes, filename: str, **kwargs) -> str:
    text_parts = []
    try:
        wb = load_workbook(io.BytesIO(file_bytes), data_only=True)
        for sheet_name in wb.sheetnames:
            text_parts.append(f"--- Sheet: {sheet_name} ---")
            sheet = wb[sheet_name]
            for row in sheet.iter_rows(values_only=True):
                row_values = [str(cell) if cell is not None else "" for cell in row]
                if any(val.strip() for val in row_values):
                    text_parts.append("\t".join(row_values))
        return "\n".join(text_parts)
    except Exception as e:
        logger.error(f"Error reading Excel {filename}: {e}")
        return ""

def read_pptx(file_bytes: bytes, filename: str, **kwargs) -> str:
    text_parts = []
    try:
        prs = Presentation(io.BytesIO(file_bytes))
        for i, slide in enumerate(prs.slides, 1):
            text_parts.append(f"--- Slide {i} ---")
            for shape in slide.shapes:
                if hasattr(shape, "text") and shape.text.strip():
                    text_parts.append(shape.text)
        return "\n".join(text_parts)
    except Exception as e:
        logger.error(f"Error reading PPTX {filename}: {e}")
        return ""

def read_text(file_bytes: bytes, filename: str, **kwargs) -> str:
    try:
        return file_bytes.decode('utf-8', errors='ignore')
    except Exception as e:
        logger.error(f"Error reading Text file {filename}: {e}")
        return ""

def read_image(file_bytes: bytes, filename: str, api_key: str = None, **kwargs) -> str:
    try:
        logger.info(f"Analyzing image: {filename}")
        
        # Configure GenAI
        if api_key:
            import google.generativeai as custom_genai
            custom_genai.configure(api_key=api_key)
            model = custom_genai.GenerativeModel("gemini-flash-latest")
        else:
            # Use default configured instance from config
            model = default_genai.GenerativeModel("gemini-flash-latest")

        image = Image.open(io.BytesIO(file_bytes))
        
        prompt = """Analyze this image in detail. Extract and describe:
        1. Any text visible (transcribe exactly)
        2. The main content/subject
        3. Data, charts, or diagrams
        4. Key details useful for search
        """
        
        response = model.generate_content([prompt, image])
        return f"[Image Analysis for {filename}]\n{response.text}"
    except Exception as e:
        logger.error(f"Error analyzing image {filename}: {e}")
        return f"[Image Analysis Failed: {e}]"

# Dispatcher
_READERS: Dict[str, Callable] = {
    "pdf": read_pdf,
    "docs": read_docx,
    "sheets": read_excel,
    "slides": read_pptx,
    "text": read_text,
    "image": read_image,
}

def read_file(file_bytes: bytes, filename: str, file_type: str, api_key: str = None) -> str:
    reader = _READERS.get(file_type)
    if not reader:
        return read_text(file_bytes, filename)
        
    return reader(file_bytes, filename, api_key=api_key)
