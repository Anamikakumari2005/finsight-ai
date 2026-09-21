from langchain_community.document_loaders import PyPDFLoader
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_huggingface import HuggingFaceInferenceAPIEmbeddings
from langchain_community.vectorstores import FAISS
from langchain_groq import ChatGroq
import os
from dotenv import load_dotenv
load_dotenv()

POLICY_DOCS_PATH = "policy_docs"

def get_embeddings():
    return HuggingFaceInferenceAPIEmbeddings(
        api_key=os.getenv("HF_TOKEN"),
        model_name="sentence-transformers/all-MiniLM-L6-v2"
    )

def load_and_split_documents():
    all_chunks = []
    for filename in os.listdir(POLICY_DOCS_PATH):
        if filename.endswith(".pdf"):
            loader = PyPDFLoader(os.path.join(POLICY_DOCS_PATH, filename))
            documents = loader.load()
            
            splitter = RecursiveCharacterTextSplitter(chunk_size=500, chunk_overlap=50)
            chunks = splitter.split_documents(documents)
            all_chunks.extend(chunks)
    
    return all_chunks


def build_vectorstore():
    chunks = load_and_split_documents()
    
    embeddings = get_embeddings()
    
    vectorstore = FAISS.from_documents(chunks, embeddings)
    vectorstore.save_local("policy_faiss_index")
    
    return vectorstore


def answer_policy_question(question: str) -> str:
    embeddings = get_embeddings()
    
    vectorstore = FAISS.load_local(
        "policy_faiss_index", 
        embeddings, 
        allow_dangerous_deserialization=True
    )
    
    retriever = vectorstore.as_retriever(search_kwargs={"k": 3})
    relevant_docs = retriever.invoke(question)
    
    context = "\n\n".join([doc.page_content for doc in relevant_docs])
    
    prompt = f"""
You are a helpful policy assistant. Use the following policy document excerpts 
to answer the question. 

IMPORTANT: 
- If the policy applies generally to all employees/departments, state the general 
  rule/limit clearly, even if you don't have department-specific spending data.
- If the question asks you to compare against actual spending figures, and you don't 
  have those figures, still state what the policy limit IS — just note that you 
  cannot make the comparison without the spending data.

If the policy information truly isn't in the excerpts at all, say you don't know.

Policy excerpts:
{context}

Question: {question}

Answer:
"""
    
    llm = ChatGroq(model="openai/gpt-oss-120b", api_key=os.getenv("GROQ_API_KEY"))
    response = llm.invoke(prompt)
    
    return response.content