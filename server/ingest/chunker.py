from langchain_text_splitters import RecursiveCharacterTextSplitter

def chunk_text(text, size=1500, overlap=150):
    if not text:
        return []

    splitter = RecursiveCharacterTextSplitter(
        chunk_size=size,
        chunk_overlap=overlap,
        separators=["\n\n", "\n", ". ", " ", ""]
    )
    
    return splitter.split_text(text)
