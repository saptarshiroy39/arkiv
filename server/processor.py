# Arkiv Processor
# 1. Handles text sanitization, error handling, and AI-powered image processing


import io

from PIL import Image

from .config import genai, logger


def sanitize_text(text: str) -> str:
    if not text:
        return ""
    text = text.replace('\x00', '')
    text = ''.join(char for char in text if char == '\n' or char == '\t' or char == '\r' or ord(char) >= 32)
    return text


def simplify_error_message(error: Exception) -> str:
    """Convert verbose API errors into user-friendly messages."""
    error_str = str(error)
    if "404" in error_str or "NOT_FOUND" in error_str:
        return "Error 404: Model not found"
    elif "401" in error_str or "UNAUTHENTICATED" in error_str:
        return "Error 401: Authentication failed"
    elif "403" in error_str or "PERMISSION_DENIED" in error_str:
        return "Error 403: Permission denied"
    elif "429" in error_str or "RESOURCE_EXHAUSTED" in error_str:
        return "Error 429: Rate limit exceeded, please try again later"
    elif "500" in error_str or "INTERNAL" in error_str:
        return "Error 500: Server error, please try again"
    elif "timeout" in error_str.lower():
        return "Request timed out, please try again"
    else:
        return "An error occurred while processing your request"


def get_image_description(image_bytes: bytes, filename: str, api_key: str = None) -> str:
    """Use Gemini Vision to describe an image."""
    try:
        logger.info(f"Processing image with Gemini Vision: {filename}")
        
        if api_key:
            import google.generativeai as custom_genai
            custom_genai.configure(api_key=api_key)
            model = custom_genai.GenerativeModel("gemini-flash-latest")
        else:
            model = genai.GenerativeModel("gemini-flash-latest")
        
        image = Image.open(io.BytesIO(image_bytes))

        prompt = """Analyze this image in detail. Extract and describe:
1. Any text visible in the image (transcribe it exactly)
2. The main content/subject of the image
3. Any data, charts, diagrams, or tables (describe the information they contain)
4. Key details that would be useful for answering questions about this image

Provide a comprehensive description that captures all important information."""

        response = model.generate_content([prompt, image])
        return response.text
    except Exception as e:
        logger.error(f"Image processing failed for {filename}: {str(e)}")
        return f"[Image: {filename} - {simplify_error_message(e)}]"


def process_image(file_bytes: bytes, filename: str, api_key: str = None) -> str:
    texts = [f"=== Image: {filename} ===\n"]
    vision_text = get_image_description(file_bytes, filename, api_key=api_key)
    if vision_text:
        texts.append(f"[AI Image Analysis]\n{vision_text}\n")
    return sanitize_text("\n".join(texts))
