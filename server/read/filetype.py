import os

def get_file_type(fname):
    ext = os.path.splitext(fname)[1].lower()

    mapping = {
        ".pdf": "pdf",

        ".png": "image", 
        ".jpg": "image", 
        ".jpeg": "image", 
        ".gif": "image", 
        ".webp": "image",

        ".doc": "docs", 
        ".docx": "docs",

        ".xls": "sheets", 
        ".xlsx": "sheets",

        ".csv": "csv",

        ".ppt": "slides", 
        ".pptx": "slides",
        
        ".txt": "text", 
        ".md": "text",
        ".json": "text"
    }

    return mapping.get(ext, "unknown")
