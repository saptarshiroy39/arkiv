from fastapi import APIRouter, HTTPException
from openai import OpenAI
from pydantic import BaseModel, Field

from app.config import (
    CHAT_MODEL,
    GEMINI_BASE_URL,
    GOOGLE_API_KEY,
    SCORE_THRESHOLD,
    SYSTEM_PROMPT,
    TEMPERATURE,
    TOP_K,
    USER_PROMPT,
)
from app.rag.processor import format_context
from app.rag.vectorstore import search_docs

router = APIRouter(tags=["RAG"])

client = OpenAI(
    api_key=GOOGLE_API_KEY,
    base_url=GEMINI_BASE_URL,
)


class AskRequest(BaseModel):
    question: str
    session_id: str
    top_k: int = Field(default=TOP_K, ge=1, le=20)
    temperature: float = Field(default=TEMPERATURE, ge=0.0, le=1.0)
    score_threshold: float = Field(default=SCORE_THRESHOLD, ge=0.0, le=1.0)


@router.post("/ask")
async def ask(body: AskRequest) -> dict:
    is_summary = any(
        word in body.question.lower()
        for word in ["summarize", "summary", "overview", "tl;dr", "tldr", "key points"]
    )
    k = body.top_k * 2 if is_summary else body.top_k
    threshold = min(body.score_threshold, 0.2) if is_summary else body.score_threshold

    docs = search_docs(
        body.question,
        session_id=body.session_id,
        k=k,
        score_threshold=threshold,
    )

    if not docs:
        raise HTTPException(400, "No relevant documents found for this query.")

    context = format_context(docs)
    response = client.chat.completions.create(
        model=CHAT_MODEL,
        temperature=body.temperature,
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
