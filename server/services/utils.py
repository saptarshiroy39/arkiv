import os
import re
import tempfile


def save_temp(content: bytes, filename: str) -> str:
    suffix = os.path.splitext(filename)[1]
    tmp = tempfile.NamedTemporaryFile(delete=False, suffix=suffix)
    tmp.write(content)
    tmp.close()
    return tmp.name


def cleanup(path: str) -> None:
    if os.path.exists(path):
        os.unlink(path)


def clean_text(text: str) -> str:
    if not text:
        return ""
    text = text.replace("\x00", "")
    text = re.sub(r"\n{3,}", "\n\n", text)
    text = re.sub(r" {2,}", " ", text)
    text = re.sub(r"\t+", " ", text)
    return text.strip()


def process_latex(text: str) -> str:
    if not text:
        return text

    text = re.sub(r'\\\[(.*?)\\\]', r'$$\1$$', text, flags=re.DOTALL)
    text = re.sub(r'\\\((.*?)\\\)', r'$\1$', text, flags=re.DOTALL)

    display_envs = r'equation|align|gather|displaymath|eqnarray|multline|flalign|split'
    text = re.sub(
        rf'\\begin\{{({display_envs})\*?\}}(.*?)\\end\{{\1\*?\}}',
        r'$$\2$$', text, flags=re.DOTALL
    )

    matrix_envs = r'matrix|pmatrix|bmatrix|vmatrix|Bmatrix|cases|array'
    text = re.sub(
        rf'(?<!\$)\\begin\{{({matrix_envs})\*?\}}(.*?)\\end\{{\1\*?\}}',
        r'$$\\begin{\1}\2\\end{\1}$$', text, flags=re.DOTALL
    )

    text = re.sub(r'\${3,}', '$$', text)
    return text


def get_file_type(fname: str) -> str:
    ext = os.path.splitext(fname)[1].lower()
    mapping = {
        ".pdf": "pdf",
        ".png": "image", ".jpg": "image", ".jpeg": "image", ".webp": "image",
        ".docx": "docs",
        ".xlsx": "sheets",
        ".csv": "csv",
        ".pptx": "slides",
        ".txt": "text", ".md": "text", ".json": "text",
    }
    return mapping.get(ext, "unknown")
