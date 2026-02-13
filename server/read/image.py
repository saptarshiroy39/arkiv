import base64
import mimetypes

from langchain_core.messages import HumanMessage
from langchain_google_genai import ChatGoogleGenerativeAI

from server.config import CHAT_MODEL, GOOGLE_API_KEY

IMAGE_PROMPT = (
    "Describe this image in detail. Extract all visible text. "
    "Write any math formulas in LaTeX using $ for inline and $$ for display."
)


def read_image(path, api_key=None):
    with open(path, "rb") as f:
        b64 = base64.b64encode(f.read()).decode()

    mime = mimetypes.guess_type(path)[0] or "image/png"

    llm = ChatGoogleGenerativeAI(model=CHAT_MODEL, google_api_key=api_key or GOOGLE_API_KEY, max_retries=3)
    msg = HumanMessage(content=[
        {"type": "text", "text": IMAGE_PROMPT},
        {"type": "image_url", "image_url": {"url": f"data:{mime};base64,{b64}"}}
    ])
    result = llm.invoke([msg])
    text = result.content or ""

    return [{"text": text, "page": 1}] if text.strip() else []
