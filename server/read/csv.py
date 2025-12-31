import io
import csv
from server.config import logger

def read_csv(blob, fname, **kwargs):
    try:
        txt = blob.decode('utf-8', errors='replace')
        content = "\n".join(["\t".join(r) for r in csv.reader(io.StringIO(txt)) if any(r)])
        return [{"text": content, "page": 1}] if content else []
    except Exception as e:
        logger.error(f"CSV error {fname}: {e}")
        return []
