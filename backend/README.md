---
title: Arkiv
emoji: ⚡
colorFrom: gray
colorTo: green
sdk: docker
pinned: false
app_port: 7860
---

<h1 align="center">
  <b>🖥️</b>
  <br>
  <b>Arkiv (Backend)</b>
</h1>

<p align="center">
  <b>FastAPI</b> backend for the <b>Arkiv</b> project.
</p>

## ⚙️ _API Endpoints_

| METHOD                                           | ENDPOINT       | DESCRIPTION                                   |
| ------------------------------------------------ | -------------- | --------------------------------------------- |
| ![GET](https://img.shields.io/badge/GET-blue)    | `/`            | API name, version & status                    |
| ![POST](https://img.shields.io/badge/POST-green) | `/chat/upload` | Upload and process documents into Pinecone    |
| ![POST](https://img.shields.io/badge/POST-green) | `/chat/query`  | Query the document context (returns response) |
| ![POST](https://img.shields.io/badge/POST-green) | `/chat/stream` | SSE feed for real-time LLM response streaming |

## 📁 _Structure_

```
backend/
├── app/
│   ├── main.py         # FastAPI app entry point
│   ├── config.py       # App configuration (env vars)
│   ├── routes/         # API route definitions
│   │   └── chat.py     # Chat and upload routes
│   ├── rag/            # RAG implementations
│   │   ├── loader.py   # Document loaders
│   │   ├── chunker.py  # Text splitting
│   │   ├── embedder.py # Vector embeddings
│   │   ├── vectorstore.py # Pinecone integration
│   │   ├── cleaner.py  # Text cleaning
│   │   └── pipeline.py # E2E processing logic
│   └── static/         # Static files
├── requirements.txt    # Python dependencies
└── .env.example        # Environment variables template
```

## 🚀 _Getting Started_

```bash
cd backend
```

```bash
uv venv .venv
```

```bash
.venv\Scripts\activate       # Windows
# OR
source .venv/bin/activate    # Linux / macOS
```

```bash
uv pip install -r requirements.txt
```

```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

- 🚀 [**_`API`_**](http://localhost:8000) - API runs at [`localhost:8000`](http://localhost:8000)
- 📚 [**_`Swagger UI Docs`_**](http://localhost:8000/docs) - Swagger UI docs at [`localhost:8000/docs`](http://localhost:8000/docs)
