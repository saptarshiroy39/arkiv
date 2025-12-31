import io
from docx import Document
from server.config import logger

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
        return [{"text": "\n".join(parts), "page": 1}] if parts else []
    except Exception as e:
        logger.error(f"Docx error {fname}: {e}")
        return []
