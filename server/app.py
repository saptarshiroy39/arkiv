import logging
import os

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(name)s: %(message)s")

from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles

from server.routes import router

app = FastAPI(title="Arkiv")

app.include_router(router)

client_dir = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "client")
app.mount("/", StaticFiles(directory=client_dir, html=True), name="client")
