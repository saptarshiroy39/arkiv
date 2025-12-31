import google.generativeai as genai
from server.config import genai as def_genai, logger

def read_pptx(blob, fname, api_key=None, **kwargs):
    try:
        if api_key:
            genai.configure(api_key=api_key)
            model = genai.GenerativeModel("gemini-2.0-flash")
        else:
            model = def_genai.GenerativeModel("gemini-2.0-flash")
        
        pptx_part = {"mime_type": "application/vnd.openxmlformats-officedocument.presentationml.presentation", "data": blob}
        prompt = """You are a high-fidelity presentation transcription system.
1. Extract ALL text from every slide **verbatim**.
2. For every chart, graph, or diagram, provide a **highly detailed description** of the visual, including specific data points, axis labels, and legends. Do not just say "a chart showing growth" - list the actual numbers.
3. Include any visible speaker notes or footer text.
4. IMPORTANT: Start the content of each slide with the delimiter [Page N] where N is the slide number. Ensure every slide has this delimiter.
5. Do not summarize. Transcription must be complete."""
        res = model.generate_content([prompt, pptx_part])
        return [{"text": f"[Content from {fname}]\n{res.text}", "page": 1}]
    except Exception as e:
        logger.error(f"PPTX error {fname}: {e}")
        return []
