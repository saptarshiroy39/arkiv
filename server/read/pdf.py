import pdfplumber


def read_pdf(path: str) -> list[dict]:
    pages = []
    with pdfplumber.open(path) as pdf:
        for i, page in enumerate(pdf.pages, 1):
            text = page.extract_text() or ""
            if text.strip():
                pages.append({"text": text, "page": i})
    return pages
