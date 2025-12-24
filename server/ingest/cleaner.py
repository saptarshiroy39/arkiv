import re

def normalize_text(text: str) -> str:
    if not text:
        return ""

    text = text.replace('\x00', '')
    text = text.replace("\n", " ").replace("\t", " ").replace("\r", " ")
    text = re.sub(r"\s+", " ", text)

    return text.strip()

def sanitize_filename(filename: str) -> str:
    return re.sub(r'[^a-zA-Z0-9._-]', '_', filename)
