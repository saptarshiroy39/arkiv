import google.generativeai as genai
from server.config import genai as def_genai, logger

def read_image(blob, fname, api_key=None, **kwargs):
    try:
        if api_key:
            genai.configure(api_key=api_key)
            model = genai.GenerativeModel("gemini-2.0-flash")
        else:
            model = def_genai.GenerativeModel("gemini-2.0-flash")

        img_part = {"mime_type": "image/png", "data": blob}
        prompt = """Analyze this image with high fidelity.
1. if it contains text, extract all of it **verbatim**.
2. If it contains data/charts, describe every data point, axis, and relation in explicit detail.
3. If it is a scene, describe it fully.
4. Do not summarize. Be exhaustive."""
        
        res = model.generate_content([prompt, img_part])
        return [{"text": f"[Analysis for {fname}]\n{res.text}", "page": 1}]
    except Exception as e:
        logger.error(f"Image error {fname}: {e}")
        return []
