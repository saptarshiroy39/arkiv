from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field

class Chunk(BaseModel):
    text: str
    source: str
    page: Optional[int] = None
    idx: int
    meta: Dict[str, Any] = Field(default_factory=dict)

class Question(BaseModel):
    text: str
    chat_id: str | None = None

class Answer(BaseModel):
    text: str

class KeyRequest(BaseModel):
    key: str

class Config(BaseModel):
    url: str
    anon_key: str
