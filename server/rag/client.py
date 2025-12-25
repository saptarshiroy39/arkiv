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
        tmpl = """You are Arkiv, a document assistant. Answer the question using ONLY the context provided.
        
Keep these in mind:
- Be concise and to the point.
- Use bullet points for any lists.
- If you can't find the answer, say "I couldn't find this information in your documents."

Context: {context}

Question: {question}

Answer:"""
        
        prompt = PromptTemplate.from_template(tmpl)
        return prompt | self.llm | StrOutputParser()
