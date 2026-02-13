from pydantic import BaseModel


class AskRequest(BaseModel):
    text: str
    chat_id: str


class AskResponse(BaseModel):
    text: str
    sources: list[dict] | None = None


class VerifyKeyRequest(BaseModel):
    key: str
