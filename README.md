<h1 align="center"><b>Arkiv</b></h1>

<a href="https://arkiv.up.railway.app/"><b>Arkiv</b></a> is an intelligent multi-format document analysis system built with FastAPI and LangChain that provides **RAG-based** AI-powered document understanding through natural conversation. Powered by Google Gemini AI models, Arkiv delivers instant answers from your PDFs, images, Office documents, and text files—all through a unified conversational interface with secure authentication.

---

## ✨ Features

| FEATURES                        | DESCRIPTION                                                                        | TECHNOLOGY                              |
|---------------------------------|------------------------------------------------------------------------------------|-----------------------------------------|
| 📄 **Multi-Format Processing** | Upload & process PDF (including protected), Images, Word, Excel, CSV, PowerPoint, Markdown & TXT files | ***pdfplumber***, ***Pillow***, ***python-docx***, ***openpyxl***, ***python-pptx*** |
| 🖼️ **AI Vision Analysis**      | Analyze images using Gemini Vision for comprehensive content extraction            | ***Gemini Flash Latest***               |
| 🤖 **Contextual AI Q&A**       | RAG-powered question answering with responses grounded in your documents           | ***Gemini Flash Latest***               |
| 🔍 **Vector Search**           | Lightning-fast semantic search across all your documents using local FAISS         | ***FAISS***, ***LangChain***            |
| 📚 **Batch Upload**            | Process multiple files simultaneously with drag-and-drop interface                 | ***Built-in***                          |
| 🧩 **Smart Chunking**          | Automatic text splitting and optimization for enhanced retrieval accuracy          | ***RecursiveCharacterTextSplitter***    |
| 🔐 **Secure Authentication**   | OTP-based user authentication with email/password and secure session management    | ***Supabase Auth***                     |
| 🔑 **Bring Your Own Key**      | Use your own Google Gemini API keys instead of the server default                  | ***Local Storage***                     |
| 🎚️ **Multi-Key Management**    | Store up to 3 custom keys and switch between them instantly using a header toggle  | ***Header Toggle UI***                  |
| 👥 **User Isolation**          | Private document storage with per-user metadata enforcement                        | ***Supabase RLS***                      |
| 💬 **Chat History**            | Persistent conversation logs with context-aware follow-up question support         | ***Built-in***                          |
| 📊 **Token Tracking**          | Monitor AI usage and token consumption across all interactions                     | ***Built-in***                          |
| ❄️ **Easter Egg**              | Fun interactive snow mode with redesigned rotating toggle and transparency effects | ***CSS Animations***                    |

---

## 📁 Supported File Formats

| Format     | Extensions                               | Processing Method                                        |
|------------|------------------------------------------|----------------------------------------------------------|
| PDF        | `.pdf`                                   | Text extraction via pdfplumber (supports protected PDFs) |
| Images     | `.png`, `.jpg`, `.jpeg`, `.gif`, `.webp` | AI Vision analysis via Gemini                            |
| Word       | `.doc`, `.docx`                          | Text + table extraction                                  |
| Excel      | `.xls`, `.xlsx`                          | All sheets extraction                                    |
| PowerPoint | `.ppt`, `.pptx`                          | All slides extraction                                    |
| CSV        | `.csv`                                   | Structured data extraction                               |
| Markdown   | `.md`, `.markdown`                       | Direct text processing with structure preservation       |
| Text       | `.txt`                                   | Direct text processing                                   |

---

## 📂 Folder Structure

```
Arkiv/
├── client/                # Frontend (React + Babel)
│   ├── core/                 # App, Auth, Config, Supabase
│   ├── chat/                 # ChatInput, ChatMessages
│   ├── sidebar/              # Sidebar, FileUpload, ChatHistory, ProfileDropdown
│   ├── header/               # Header
│   ├── settings/             # All settings tabs
│   └── styles/               # CSS modules
|
├── server/                # Backend (FastAPI)
│   ├── app.py                # FastAPI app entry
│   ├── config.py             # Environment, logging, constants
│   ├── routes.py             # API endpoints
│   ├── services.py           # Business logic
│   ├── models.py             # Pydantic models
│   ├── dependencies.py       # Auth dependency
│   ├── extractor.py          # Document text extraction (PDF, Word, Excel, etc.)
│   ├── processor.py          # Text sanitization + AI image processing
│   └── rag.py                # RAG pipeline (FAISS + LangChain)
|
├── easter_egg/            # Season-wise Easter egg features
├── email_templates/       # Supabase email templates
└── Configuration files
```

---

## 🎯 System Overview

Arkiv uses a sophisticated RAG (Retrieval-Augmented Generation) architecture with secure multi-user support. The frontend is served directly by FastAPI for simplified deployment without Node.js.

![Arkiv Overview](Arkiv.png)

## 🧩 Architecture Flow

```
User Upload → Document Processing → Text Extraction → Smart Chunking
     ↓
Vector Embeddings → Local FAISS Store → Vector Index
     ↓
User Question → Vector Similarity Search → Context Retrieval → RAG Generation → Response
```

---

<p align="center">
  <a href="https://arkiv.up.railway.app/">Made</a> with 💙 by Saptarshi Roy
</p>