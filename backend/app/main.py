from app.routes.auth import router as auth_router
from app.routes.ask import router as ask_router
from app.routes.delete import router as delete_router
from app.routes.clear import router as clear_router
from app.routes.chats import router as chats_router
from app.routes.upload import router as upload_router
from app.config import APP_NAME, APP_VERSION, CORS_ORIGINS, ENV
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
import os

app = FastAPI(
    title=APP_NAME,
    version=APP_VERSION,
    docs_url=None if ENV == "production" else "/docs",
    redoc_url=None if ENV == "production" else "/redoc",
    openapi_url=None if ENV == "production" else "/openapi.json",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router)
app.include_router(ask_router)
app.include_router(upload_router)
app.include_router(delete_router)
app.include_router(clear_router)
app.include_router(chats_router)

@app.get("/")
@app.head("/") # UptimeRobot
async def root():
    return {
        "name": APP_NAME,
        "version": APP_VERSION,
        "status": "OK"
    }

app.mount("/static", StaticFiles(directory="app/static"), name="static")

@app.get('/favicon.ico', include_in_schema=False)
async def favicon():
    return FileResponse(os.path.join("app", "static", "favicon.ico"))
