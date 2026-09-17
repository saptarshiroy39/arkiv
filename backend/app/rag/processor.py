import re
from langchain_core.documents import Document


def clean_text(text: str) -> str:
    if not text:
        return ""
    text = text.replace("\x00", "")
    text = re.sub(r"[ \t]+", " ", text)
    text = re.sub(r"\n{3,}", "\n\n", text)
    return text.strip()


def process_latex(text: str) -> str:
    if not text:
        return text

    text = re.sub(r"\\\[(.*?)\\\]", r"$$\1$$", text, flags=re.DOTALL)
    text = re.sub(r"\\\((.*?)\\\)", r"$\1$", text, flags=re.DOTALL)

    display = r"equation|align|gather|displaymath|eqnarray|multline|flalign|split"
    text = re.sub(
        rf"\\begin{{({display})\*?}}(.*?)\\end{{\1\*?}}",
        r"$$\2$$",
        text,
        flags=re.DOTALL,
    )

    matrix = r"matrix|pmatrix|bmatrix|vmatrix|Bmatrix|cases|array"
    text = re.sub(
        rf"(?<!\$)\\begin{{({matrix})\*?}}(.*?)\\end{{\1\*?}}",
        r"$$\\begin{\1}\2\\end{\1}$$",
        text,
        flags=re.DOTALL,
    )

    return re.sub(r"\${3,}", "$$", text)


def format_context(docs: list[Document]) -> str:
    formatted_chunks = []
    for doc in docs:
        file_name = doc.metadata.get("file_name", "Document")

        page = doc.metadata.get("page_label")
        if page is None and "page" in doc.metadata:
            raw_page = doc.metadata["page"]
            if isinstance(raw_page, int):
                page = str(raw_page + 1)
            elif raw_page is not None:
                page = str(raw_page)

        meta_header = f"[Source: {file_name}" + (f" | Page: {page}]" if page else "]")
        formatted_chunks.append(f"{meta_header}\n{doc.page_content}")

    return "\n\n---\n\n".join(formatted_chunks)
