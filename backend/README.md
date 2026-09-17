---
title: Arkiv
emoji: ⚡
colorFrom: gray
colorTo: green
sdk: docker
pinned: false
app_port: 7860
short_description: RAG Application
---

<h1 align="center">
  <img src="./app/static/logo.png" alt="⚡" width="64">
  <br>
  <b>Arkiv (Backend)</b>
</h1>

<p align="center">
  <b>FastAPI</b> backend for the <b>Arkiv</b> project.
</p>

<p align="center">
  <a href="https://github.com/saptarshiroy39/arkiv">
    <img alt="Version" src="https://img.shields.io/badge/version-v2.6.0-emerald">
  </a>
  <a href="https://github.com/saptarshiroy39/arkiv/blob/main/LICENSE">
    <img alt="GitHub License" src="https://img.shields.io/github/license/saptarshiroy39/arkiv?color=crimson">
  </a>
</p>

---

## ✳️ _API Endpoints_

| METHOD | ENDPOINT | TAG | DESCRIPTION |
| :---: | :---: | :---: | :---: |
| ![GET](https://img.shields.io/badge/GET-blue) | `/` | default | API name, version & status |
| ![POST](https://img.shields.io/badge/POST-green) | `/upload` | RAG | Upload & process documents into Qdrant Cloud |
| ![POST](https://img.shields.io/badge/POST-green) | `/ask` | RAG | Session-based RAG Question Answering |
| ![GET](https://img.shields.io/badge/GET-blue) | `/chats` | RAG | Active chat sessions list |
| ![DELETE](https://img.shields.io/badge/DELETE-red) | `/delete/{session_id}` | RAG | Delete session vectorstore points |
| ![DELETE](https://img.shields.io/badge/DELETE-red) | `/clear` | RAG | Clear all vectorstore points |

---

## ✳️ _Structure_

```
backend/
├── app/
│   ├── main.py             # FastAPI app entry point & CORS
│   ├── config.py           # App configuration
│   ├── routes/             # API route definitions
│   │   ├── ask.py          # /ask endpoint (RAG query handler)
│   │   ├── upload.py       # /upload endpoint (tempfile streaming)
│   │   ├── delete.py       # /delete/{session_id} endpoint
│   │   ├── clear.py        # /clear endpoint
│   │   └── chats.py        # /chats session list endpoint
│   ├── rag/                # RAG implementations
│   │   ├── loader.py       # Multi-format document loaders (PDF, DOCX, XLSX, etc.)
│   │   ├── chunker.py      # Recursive character text splitter
│   │   ├── embedder.py     # Gemini vector embeddings (768-dim)
│   │   ├── vectorstore.py  # Qdrant Cloud integration with session filtering
│   │   ├── cleaner.py      # Text cleaning & LaTeX formula processor
│   │   └── pipeline.py     # E2E document processing pipeline
│   └── static/             # Static files & favicon
├── pyproject.toml          # Python project configuration
├── uv.lock                 # Dependency lockfile
└── .env.example            # Environment variables template
```

---

## ✳️ _Getting Started_

```bash
cd backend
```

```bash
uv sync
```

```bash
uv run uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

---

## ✳️ _API Documentation_

▶️ [**_`API`_**](http://localhost:8000) - API runs at [`localhost:8000`](http://localhost:8000)

▶️ [**_`Swagger UI Docs`_**](http://localhost:8000/docs) - Swagger UI docs at [`localhost:8000/docs`](http://localhost:8000/docs)
