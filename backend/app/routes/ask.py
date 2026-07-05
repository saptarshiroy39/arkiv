from fastapi import APIRouter, Depends, HTTPException
from langchain_core.messages import HumanMessage
from langchain_google_genai import ChatGoogleGenerativeAI
from pydantic import BaseModel

from app.config import CHAT_MODEL, GOOGLE_API_KEY, PROMPT, TOP_K
from app.deps import get_user_id
from app.rag.vectorstore import get_vectorstore

router = APIRouter()

llm = ChatGoogleGenerativeAI(model=CHAT_MODEL, google_api_key=GOOGLE_API_KEY)

class AskRequest(BaseModel):
    question: str
    session_id: str = "default_index"

class AskResponse(BaseModel):
    answer: str

@router.post("/ask")
async def ask(body: AskRequest, user_id: str = Depends(get_user_id)) -> AskResponse:
    prefixed_session_id = f"{user_id}_{body.session_id}"
    store = get_vectorstore(prefixed_session_id)

    is_summary_request = any(word in body.question.lower() for word in ["summarize", "summary", "overview", "tl;dr"])
    k = TOP_K * 2 if is_summary_request else TOP_K
    docs = store.similarity_search(body.question, k=k)

    if not docs:
        raise HTTPException(400, "No documents found for this session.")

    context = "\n\n".join(d.page_content for d in docs)
    response = llm.invoke([HumanMessage(content=PROMPT.format(context=context, question=body.question))])

    return AskResponse(answer=str(response.content))
