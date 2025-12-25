import re

def normalize_text(text):
    if not text: return ""

    text = text.replace('\x00', '')
    text = re.sub(r"\s+", " ", text)
    return text.strip()

def sanitize_filename(fname):
    return re.sub(r'[^a-zA-Z0-9._-]', '_', fname)
