import asyncio

from langchain_google_genai import ChatGoogleGenerativeAI

from server.config import CHAT_MODEL, GOOGLE_API_KEY, TOP_K
from server.storage.faiss_store import get_faiss_store
from server.storage.pinecone import get_vectorstore

PROMPT = """You are Arkiv, a helpful document assistant.
Answer the question based ONLY on the provided context.
If the context contains math or LaTeX, preserve them using $ for inline and $$ for display math.
If you cannot answer from the context, say so honestly.
Do NOT list sources yourself — they will be added automatically.

Context:
{context}

Question: {question}"""


async def chat_with_docs(
    question, user_id, chat_id, api_key=None, storage_mode="cloud"
):
    key = api_key or GOOGLE_API_KEY
    namespace = f"{user_id}_{chat_id}"

    # Retrieve
    if storage_mode == "local":
        store = get_faiss_store(namespace, key)
        if not store:
            return {
                "text": "No relevant documents found. Upload some files first.",
                "sources": [],
            }
        docs = await asyncio.to_thread(store.similarity_search, question, k=TOP_K)
    else:
        store = get_vectorstore(namespace, key)
        docs = await asyncio.to_thread(store.similarity_search, question, k=TOP_K)

    if not docs:
        return {
            "text": "No relevant documents found. Upload some files first.",
            "sources": [],
        }

    # Build context
    context = "\n\n".join(
        f"[{d.metadata.get('file', '')} | Page {d.metadata.get('page', 1)}]\n{d.page_content}"
        for d in docs
    )

    # Ask LLM
    llm = ChatGoogleGenerativeAI(model=CHAT_MODEL, google_api_key=key, max_retries=3)
    answer = await asyncio.to_thread(
        llm.invoke, PROMPT.format(context=context, question=question)
    )

    # Build sources from retrieved chunks
    filenames = sorted(set(d.metadata.get("file", "") for d in docs))
    source_lines = [f"{i}. `{fname}`" for i, fname in enumerate(filenames, 1)]

    full = f"{answer.content}\n\n**Sources:**\n" + "\n".join(source_lines)
    return {"text": full}
