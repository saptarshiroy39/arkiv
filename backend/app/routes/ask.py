from fastapi import APIRouter, HTTPException
from openai import OpenAI
from pydantic import BaseModel

from app.config import CHAT_MODEL, DEFAULT_SESSION_ID, GEMINI_BASE_URL, GOOGLE_API_KEY, SYSTEM_PROMPT, TOP_K, USER_PROMPT
from app.rag.processor import format_context
from app.rag.vectorstore import search_docs

router = APIRouter(tags=["RAG"])

client = OpenAI(
    api_key=GOOGLE_API_KEY,
    base_url=GEMINI_BASE_URL,
)


class AskRequest(BaseModel):
    question: str
    session_id: str = DEFAULT_SESSION_ID


@router.post("/ask")
async def ask(body: AskRequest) -> dict:
    is_summary = any(
        word in body.question.lower()
        for word in ["summarize", "summary", "overview", "tl;dr", "tldr", "key points"]
    )
    k = TOP_K * 2 if is_summary else TOP_K

    docs = search_docs(body.question, session_id=body.session_id, k=k)

    if not docs:
        raise HTTPException(400, "No documents found for this session.")

    context = format_context(docs)
    response = client.chat.completions.create(
        model=CHAT_MODEL,
        messages=[
            {
                "role": "system", 
                "content": SYSTEM_PROMPT
            },
            {
                "role": "user",
                "content": USER_PROMPT.format(context=context, question=body.question),
            },
        ],
    )

    answer = response.choices[0].message.content or "No response generated."
    return {"answer": answer}
