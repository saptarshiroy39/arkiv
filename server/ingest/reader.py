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
                cell_text = [cell.text for cell in row.cells]
                row_text = "\t".join(cell_text)
                
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
        
        for sheet in wb:
            text_parts.append(f"--- Sheet: {sheet.title} ---")
            
            for row in sheet.iter_rows(values_only=True):
                clean_row = []
                for cell in row:
                    if cell is None:
                        clean_row.append("")
                    else:
                        clean_row.append(str(cell))
                
                row_text = "\t".join(clean_row)
                if row_text.strip():
                    text_parts.append(row_text)

        return "\n".join(text_parts)
    except Exception as e:
        logger.error(f"Error reading Excel {filename}: {e}")
        return ""


def read_csv(file_bytes: bytes, filename: str, **kwargs) -> str:
    try:
        content = file_bytes.decode('utf-8', errors='replace')
        return "\n".join(["\t".join(r) for r in csv.reader(io.StringIO(content)) if any(r)])
    except Exception as e:
        logger.error(f"Error reading CSV {filename}: {e}")
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
        
        if api_key:
            genai.configure(api_key=api_key)
            model = genai.GenerativeModel("gemini-flash-latest")
        else:
            model = default_genai.GenerativeModel("gemini-flash-latest")

        image = Image.open(io.BytesIO(file_bytes))
        prompt = "Analyze this image. Extract: 1. Text (transcribed) 2. Main content 3. Data/Charts 4. Key details."
        
        response = model.generate_content([prompt, image])
        return f"[Image Analysis for {filename}]\n{response.text}"
    except Exception as e:
        logger.error(f"Error analyzing image {filename}: {e}")
        return ""


# Dispatcher
_READERS: Dict[str, Callable] = {
    "pdf": read_pdf,
    "docs": read_docx,
    "sheets": read_excel,
    "csv": read_csv,
    "slides": read_pptx,
    "text": read_text,
    "image": read_image,
}


def read_file(file_bytes: bytes, filename: str, file_type: str, api_key: str = None) -> str:
    reader = _READERS.get(file_type)
    if not reader:
        return read_text(file_bytes, filename)
        
    return reader(file_bytes, filename, api_key=api_key)
