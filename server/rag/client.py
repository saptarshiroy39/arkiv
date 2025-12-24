from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.prompts import PromptTemplate
from langchain_core.output_parsers import StrOutputParser
from server.config import GOOGLE_API_KEY

class LLMClient:
    def __init__(self, api_key: str = None, temperature: float = 0.3):
        key = api_key if api_key else GOOGLE_API_KEY
        self.model = ChatGoogleGenerativeAI(
            model="gemini-flash-latest",
            google_api_key=key,
            temperature=temperature
        )
        
    def get_answer_chain(self):
        prompt_template = """
        You are Arkiv, a helpful document assistant. Answer based on the context provided.
        
        ## Guidelines:
        - Be concise and direct.
        - Use bullet points for lists.
        - If the answer isn't in the context, say "I couldn't find this information in your documents."
        
        Context: {context}
        
        Question: {question}
        
        Answer:
        """
        
        prompt = PromptTemplate(
            template=prompt_template,
            input_variables=["context", "question"]
        )
        
        return prompt | self.model | StrOutputParser()
