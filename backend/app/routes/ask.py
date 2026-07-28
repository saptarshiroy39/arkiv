from fastapi import APIRouter, Depends, HTTPException
from openai import OpenAI
from pydantic import BaseModel
from app.config import CHAT_MODEL, GOOGLE_API_KEY, GEMINI_BASE_URL, SYSTEM_PROMPT, USER_PROMPT, TOP_K
from app.deps import get_user_id
from app.rag.vectorstore import get_vectorstore

router = APIRouter()

client = OpenAI(
    api_key=GOOGLE_API_KEY,
    base_url=GEMINI_BASE_URL,
)

class AskRequest(BaseModel):
    question: str
    session_id: str = "default_index"

@router.post("/ask")
async def ask(body: AskRequest, user_id: str = Depends(get_user_id)) -> dict:
    prefixed_session_id = f"{user_id}_{body.session_id}"
    store = get_vectorstore(prefixed_session_id)

    is_summary_request = any(word in body.question.lower() for word in ["summarize", "summary", "overview", "tl;dr"])
    k = TOP_K * 2 if is_summary_request else TOP_K
    docs = store.similarity_search(body.question, k=k)

    if not docs:
        raise HTTPException(400, "No documents found for this session.")

    context = "\n\n".join(d.page_content for d in docs)
    response = client.chat.completions.create(
        model=CHAT_MODEL,
        messages=[
            {
                "role": "system",
                "content": SYSTEM_PROMPT,
            },
            {
                "role": "user",
                "content": USER_PROMPT.format(context=context, question=body.question),
            },
        ],
    )

    answer = response.choices[0].message.content
    if not answer:
        raise HTTPException(500, "Failed to generate a response from the AI model.")

    return {"answer": answer}

