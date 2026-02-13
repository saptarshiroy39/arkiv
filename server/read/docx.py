from docx import Document


def read_docx(path: str) -> list[dict]:
    doc = Document(path)
    text = "\n".join(p.text for p in doc.paragraphs if p.text.strip())
    return [{"text": text, "page": 1}] if text else []
