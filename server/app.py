# Arkiv API
# 1. FastAPI server for Arkiv
# 2. Handles authentication, file upload, and chat history


import os

import uvicorn
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from .config import CLIENT_DIR, EASTER_EGG_DIR
from .routes import router

app = FastAPI(title="Arkiv API", version="1.0.0")

# CORS Configuration
# For production, set ALLOWED_ORIGINS="https://yourdomain.com" in .env
# For development, defaults to "*" (allow all)
allowed_origins = os.getenv("ALLOWED_ORIGINS", "*").split(",")

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(router)

# Mount easter_egg folder for standalone easter egg module
app.mount("/easter_egg", StaticFiles(directory=EASTER_EGG_DIR), name="easter_egg")
app.mount("/", StaticFiles(directory=CLIENT_DIR, html=True), name="static")

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
