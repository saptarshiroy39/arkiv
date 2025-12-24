from pathlib import Path

def get_file_type(path: str) -> str:
    ext = Path(path).suffix.lower()

    ext_map = {
        # PDF
        ".pdf": "pdf",
        
        # Images
        ".png": "image",
        ".jpg": "image",
        ".jpeg": "image",
        ".gif": "image",
        ".webp": "image",
        
        # Documents
        ".doc": "docs",
        ".docx": "docs",
        
        # Sheets/Data
        ".xls": "sheets",
        ".xlsx": "sheets",
        ".csv": "csv",
        
        # Slides
        ".ppt": "slides",
        ".pptx": "slides",
        
        # Text/Code
        ".txt": "text",
        ".rtf": "text",
        ".md": "text",
        ".py": "text",
        ".js": "text",
        ".json": "text",
        ".xml": "text",
        ".html": "text",
        ".css": "text",
    }

    if ext not in ext_map:
        return "unknown"

    return ext_map[ext]
