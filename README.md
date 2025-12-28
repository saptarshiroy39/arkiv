<h1 align="center"><b>Arkiv</b></h1>

<p align="center">
  <a href="https://arkiv.bysr.me/"><b>Arkiv</b></a> is an AI-powered document assistant that lets you upload files and have intelligent conversations about their content. Built with <a href="https://fastapi.tiangolo.com"><b>FastAPI</b></a> and powered by <a href="https://ai.google.dev"><b>Google Gemini</b></a>, Arkiv uses RAG (Retrieval Augmented Generation) to provide accurate, context-aware answers from your documents.
</p>

---

## ✨ Features

| FEATUREs                    | DESCRIPTION                                                           | TECHNOLOGY                              |
|-----------------------------|-----------------------------------------------------------------------|-----------------------------------------|
| 📄 **Document Upload**      | Support for PDF, DOCX, XLSX, CSV, PPTX, images, and text files        | ***pdfplumber***, ***python-docx***     |
| 🤖 **AI-Powered Q&A**       | Ask questions and get accurate answers from your uploaded documents   | ***Google Gemini***, ***LangChain***    |
| 🖼️ **Image Analysis**       | Automatic description and text extraction from images using vision AI | ***Gemini Vision***                     |
| 🔑 **BYOK Support**         | Bring Your Own Key - use your personal Google Gemini API key          | ***Built-in***                          |
| 💬 **Chat History**         | Save and restore previous conversations with local storage            | ***Built-in***                          |
| 🔐 **User Authentication**  | Secure login, signup with OTP verification                            | ***Supabase Auth***                     |
| 🧠 **Vector Search**        | Semantic document search using embeddings for accurate retrieval      | ***Pinecone***, ***Google Embeddings*** |
| ⚡ **Real-time Processing** | Fast document chunking and indexing for instant querying              | ***LangChain Splitters***               |

---

## 🎯 System Overview

Arkiv uses a sophisticated RAG (Retrieval-Augmented Generation) architecture with secure multi-user support. The frontend is served directly by FastAPI for simplified deployment without Node.js.

![Arkiv](Arkiv.png)

---

## 🏗️ Architecture

Arkiv uses a modern RAG (Retrieval Augmented Generation) architecture:

| #   | COMPONENTs         | DESCRIPTION                                                       | STACK                                |
|----|---------------------|-------------------------------------------------------------------|--------------------------------------|
| 1️⃣ | **Frontend**        | React-based SPA with auth, chat, settings, and file upload UI     | ***React***, ***Vanilla CSS***       |
| 2️⃣ | **Backend**         | FastAPI server handling file processing, embeddings, and chat     | ***FastAPI***, ***Python***          |
| 3️⃣ | **Ingestion**       | Document readers, text cleaning, and semantic chunking pipeline   | ***pdfplumber***, ***LangChain***    |
| 4️⃣ | **Vector Store**    | Embeddings storage and similarity search for document retrieval   | ***Pinecone***                       |
| 5️⃣ | **LLM Layer**       | Question answering with context from retrieved document chunks    | ***Google Gemini***, ***LangChain*** |
| 6️⃣ | **Auth & Database** | User authentication, session management, and conversation storage | ***Supabase***                       |

---

## 📁 Supported File Types

| TYPE          | EXTENSIONS                               |
|---------------|------------------------------------------|
| Documents     | `.pdf`, `.doc`, `.docx`                  |
| Spreadsheets  | `.xls`, `.xlsx`, `.csv`                  |
| Presentations | `.ppt`, `.pptx`                          |
| Images        | `.png`, `.jpg`, `.jpeg`, `.gif`, `.webp` |
| Text          | `.txt`, `.md`, `.json`, `.py`, `.js`     |

---

<p align="center">
  Made with ❤️ by <a href="https://arkiv.bysr.me/">Saptarshi Roy</a>
</p>
