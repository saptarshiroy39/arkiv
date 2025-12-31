import google.generativeai as genai
from server.config import genai as def_genai, logger

def read_pdf(blob, fname, api_key=None, **kwargs):
    try:
        if api_key:
            genai.configure(api_key=api_key)
            model = genai.GenerativeModel("gemini-2.0-flash")
        else:
            model = def_genai.GenerativeModel("gemini-2.0-flash")
        
        pdf_part = {"mime_type": "application/pdf", "data": blob}
        prompt = """You are a high-fidelity document transcription system.
1. Extract ALL text from this document **verbatim**. Do not summarize, abbreviated, or skip any content.
2. Convert all tables into valid Markdown tables, preserving every single cell value.
3. For charts, graphs, and images, provide a **dense, highly detailed textual description** containing all labels, data points, and trends visible.
4. IMPORTANT: Start the content of each page with the delimiter [Page N] where N is the page number. Ensure every page has this delimiter.
5. Do not include any conversational filler (e.g., "Here is the text"). Just output the content."""
        res = model.generate_content([prompt, pdf_part])
        return [{"text": f"[Content from {fname}]\n{res.text}", "page": 1}]
    except Exception as e:
        logger.error(f"PDF error {fname}: {e}")
        return []
