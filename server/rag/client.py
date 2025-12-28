from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.prompts import PromptTemplate
from langchain_core.output_parsers import StrOutputParser
from server.config import GOOGLE_API_KEY

class LLMClient:
    def __init__(self, api_key=None, temp=0.3):
        key = api_key or GOOGLE_API_KEY
        self.llm = ChatGoogleGenerativeAI(
            model="gemini-flash-latest",
            google_api_key=key,
            temperature=temp
        )
        
    def get_answer_chain(self):
        tmpl = """You are a helpful and precise document assistant.
Your goal is to answer the user's question using ONLY the provided context.

Instructions:
1. Use ONLY the context below to answer. Do not use outside knowledge.
2. If the user asks about the document's content, provide a detailed, well-structured answer.
3. **Always cite page numbers** from the context using inline code format (e.g., `[Page 2]`) when referencing specific information.
4. Format your response using Markdown:
   - Use headers for sections.
   - Use bullet points for lists.
   - Use bold text for emphasis.
   - Use code blocks for any code or structured data.
5. If the exact answer is not in the context, say "I cannot find the answer to that in the provided documents." responsibly. Do not make up information.
6. If the context is empty or irrelevant to the question, politely refuse to answer.

Context: {context}

Question: {question}

Answer:"""
        
        prompt = PromptTemplate.from_template(tmpl)
        return prompt | self.llm | StrOutputParser()
