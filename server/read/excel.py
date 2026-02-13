import pandas as pd


def read_excel(path: str) -> list[dict]:
    sheets = pd.read_excel(path, sheet_name=None, engine="openpyxl")
    pages = []
    for i, (name, df) in enumerate(sheets.items(), 1):
        if df.empty:
            continue
        text = f"Sheet: {name}\n{df.to_string(index=False)}"
        pages.append({"text": text, "page": i})
    return pages
