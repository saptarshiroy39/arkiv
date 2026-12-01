from typing import Literal, TypedDict
from fastapi import APIRouter, HTTPException
from openai import AsyncOpenAI
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
from app.rag.pipeline import _format
from app.rag.vectorstore import search_docs

router = APIRouter(tags=["RAG"])

client = AsyncOpenAI(
    api_key=GOOGLE_API_KEY,
    base_url=GEMINI_BASE_URL,
)


class ChatMessage(TypedDict):
    role: Literal["user", "assistant"]
    content: str


class AskRequest(BaseModel):
    question: str
    session_id: str
    history: list[ChatMessage] = Field(default_factory=list)
    top_k: int = Field(default=TOP_K, ge=1, le=20)
    temperature: float = Field(default=TEMPERATURE, ge=0.0, le=1.0)
    score_threshold: float = Field(default=SCORE_THRESHOLD, ge=0.0, le=1.0)


SUMMARY_KEYWORDS = ("summarize", "summary", "overview", "tl;dr", "tldr", "key points")


@router.post("/ask")
async def ask(body: AskRequest) -> dict:
    is_summary = any(w in body.question.lower() for w in SUMMARY_KEYWORDS)
    k = body.top_k * 2 if is_summary else body.top_k
    threshold = min(body.score_threshold, 0.2) if is_summary else body.score_threshold

    if not (docs := await search_docs(body.question, session_id=body.session_id, k=k, score_threshold=threshold)):
        raise HTTPException(400, "No relevant documents found.")

    context = _format(docs)
    messages = [
        {"role": "system", "content": SYSTEM_PROMPT},
        *body.history[-10:],
        {"role": "user", "content": USER_PROMPT.format(context=context, question=body.question)},
    ]

    response = await client.chat.completions.create(
        model=CHAT_MODEL,
        temperature=body.temperature,
        messages=messages,
    )

    return {"answer": response.choices[0].message.content or "No response generated."}
