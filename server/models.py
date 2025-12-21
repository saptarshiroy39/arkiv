# Arkiv Models
# 1. Pydantic models for Arkiv
# 2. Handles authentication, file upload, and chat history


from pydantic import BaseModel


class QuestionRequest(BaseModel):
    question: str


class ConfigResponse(BaseModel):
    supabase_url: str
    supabase_anon_key: str



class VerifyKeyRequest(BaseModel):
    api_key: str


class AnswerResponse(BaseModel):
    answer: str


class UserStatsResponse(BaseModel):
    files_processed: int
    tokens_used: int


class UpdateStatsRequest(BaseModel):
    files_delta: int = 0
    tokens_delta: int = 0
