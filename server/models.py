from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field

class Chunk(BaseModel):
    text: str
    source: str
    page_number: Optional[int] = None
    chunk_index: int
    metadata: Dict[str, Any] = Field(default_factory=dict)

# -- API Models --

class QuestionRequest(BaseModel):
    question: str

class AnswerResponse(BaseModel):
    answer: str

class VerifyKeyRequest(BaseModel):
    api_key: str

class ConfigResponse(BaseModel):
    supabase_url: str
    supabase_anon_key: str
