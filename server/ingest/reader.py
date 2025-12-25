import io
import csv
import pdfplumber
from docx import Document
from openpyxl import load_workbook
from pptx import Presentation
from PIL import Image
import google.generativeai as genai
from server.config import genai as def_genai, logger

def read_pdf(blob, fname, **kwargs):
    parts = []
    try:
        with pdfplumber.open(io.BytesIO(blob)) as pdf:
            for page in pdf.pages:
                txt = page.extract_text()
                if txt: parts.append(txt)
        return "\n".join(parts) if parts else f"[No text in {fname}]"
    except Exception as e:
        logger.error(f"PDF error {fname}: {e}")
        return ""


def read_docx(blob, fname, **kwargs):
    parts = []
    try:
        doc = Document(io.BytesIO(blob))
        for p in doc.paragraphs:
            if p.text.strip(): parts.append(p.text)
        for table in doc.tables:
            for row in table.rows:
                row_txt = "\t".join([c.text for c in row.cells])
                if row_txt.strip(): parts.append(row_txt)
        return "\n".join(parts)
    except Exception as e:
        logger.error(f"Docx error {fname}: {e}")
        return ""


def read_excel(blob, fname, **kwargs):
    parts = []
    try:
        wb = load_workbook(io.BytesIO(blob), data_only=True)
        for sheet in wb:
            parts.append(f"--- {sheet.title} ---")
            for row in sheet.iter_rows(values_only=True):
                # filter out None and join
                vals = [str(v) if v is not None else "" for v in row]
                line = "\t".join(vals)
                if line.strip(): parts.append(line)
        return "\n".join(parts)
    except Exception as e:
        logger.error(f"Excel error {fname}: {e}")
        return ""


def read_csv(blob, fname, **kwargs):
    try:
        txt = blob.decode('utf-8', errors='replace')
        return "\n".join(["\t".join(r) for r in csv.reader(io.StringIO(txt)) if any(r)])
    except Exception as e:
        logger.error(f"CSV error {fname}: {e}")
        return ""


def read_pptx(blob, fname, **kwargs):
    parts = []
    try:
        prs = Presentation(io.BytesIO(blob))
        for i, slide in enumerate(prs.slides, 1):
            parts.append(f"--- Slide {i} ---")
            for shape in slide.shapes:
                if hasattr(shape, "text") and shape.text.strip():
                    parts.append(shape.text)
        return "\n".join(parts)
    except Exception as e:
        logger.error(f"PPTX error {fname}: {e}")
        return ""


def read_text(blob, fname, **kwargs):
    try:
        return blob.decode('utf-8', errors='ignore')
    except Exception:
        return ""


def read_image(blob, fname, api_key=None, **kwargs):
    try:
        if api_key:
            genai.configure(api_key=api_key)
            model = genai.GenerativeModel("gemini-flash-latest")
        else:
            model = def_genai.GenerativeModel("gemini-flash-latest")

        img = Image.open(io.BytesIO(blob))
        # simpler, more human prompt
        prompt = "Describe this image in detail. Extract any text, charts, or key data point you see."
        
        res = model.generate_content([prompt, img])
        return f"[Analysis for {fname}]\n{res.text}"
    except Exception as e:
        logger.error(f"Image error {fname}: {e}")
        return ""


def read_file(blob, fname, ftype, api_key=None):
    if ftype == "pdf": return read_pdf(blob, fname)
    if ftype == "docs": return read_docx(blob, fname)
    if ftype == "sheets": return read_excel(blob, fname)
    if ftype == "csv": return read_csv(blob, fname)
    if ftype == "slides": return read_pptx(blob, fname)
    if ftype == "image": return read_image(blob, fname, api_key=api_key)
    return read_text(blob, fname)
