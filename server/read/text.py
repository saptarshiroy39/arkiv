def read_text(blob, fname, **kwargs):
    try:
        txt = blob.decode('utf-8', errors='ignore')
        return [{"text": txt, "page": 1}] if txt else []
    except Exception:
        return []
