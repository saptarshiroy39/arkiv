from threading import Lock
from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field
import time

class Chunk(BaseModel):
    text: str
    source: str
    page_number: Optional[int] = None
    chunk_index: int
    metadata: Dict[str, Any] = Field(default_factory=dict)
    
class ProcessingStats(BaseModel):
    files_processed: int = 0
    chunks_created: int = 0
    errors: List[str] = Field(default_factory=list)
    start_time: float = Field(default_factory=time.time)
    
    @property
    def duration(self) -> float:
        return time.time() - self.start_time

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

class UserStatsResponse(BaseModel):
    files_processed: int
    tokens_used: int

class UpdateStatsRequest(BaseModel):
    files_delta: int = 0
    tokens_delta: int = 0
