import asyncio

from langchain_google_genai import ChatGoogleGenerativeAI

from server.config import CHAT_MODEL, GOOGLE_API_KEY, TOP_K
from server.storage.pinecone import get_vectorstore

PROMPT = """You are Arkiv, a helpful document assistant.
Answer the question based ONLY on the provided context.
If the context contains math or LaTeX, preserve them using $ for inline and $$ for display math.
If you cannot answer from the context, say so honestly and do NOT include any sources.
Only if you used information from the documents, list the files you referenced under "Sources:" as a numbered list (e.g. 1. `filename.pdf`).
Do NOT include files you did not reference.

Context:
{context}

Question: {question}"""


async def chat_with_docs(question, user_id, chat_id, api_key=None):
    key = api_key or GOOGLE_API_KEY
    store = get_vectorstore(f"{user_id}_{chat_id}", key)

    # Retrieve
    docs = await asyncio.to_thread(store.similarity_search, question, k=TOP_K)

    if not docs:
        return {
            "text": "No relevant documents found. Upload some files first.",
            "sources": [],
        }

    # Build context
    context = "\n\n".join(
        f"[{d.metadata.get('file', '')}]\n{d.page_content}" for d in docs
    )

    # Ask LLM
    llm = ChatGoogleGenerativeAI(model=CHAT_MODEL, google_api_key=key, max_retries=3)
    answer = await asyncio.to_thread(
        llm.invoke, PROMPT.format(context=context, question=question)
    )

    return {"text": answer.content}
