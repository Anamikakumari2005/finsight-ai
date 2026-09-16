from groq import Groq
import os
from dotenv import load_dotenv
from sqlalchemy import text
from sqlalchemy.orm import Session

load_dotenv()


SCHEMA = """
Table: expenses
Columns:
- id (integer) - unique identifier
- date (date) - date of the expense
- category (text) - category of the expense
- amount (float) - amount spent
- department (text) - department responsible for the expense
- description (text, optional) - additional details about the expense
"""


def generate_sql(question: str) -> str:
    client = Groq(api_key=os.getenv("GROQ_API_KEY"))
    
    prompt = f"""
    You are a SQL expert. Given the following database schema:
    
    {SCHEMA}
    
    Convert this question into a valid SQLite query.
IMPORTANT: Always use case-insensitive comparison for text fields (use LOWER() function on both column and value, e.g. WHERE LOWER(department) = LOWER('marketing')).
Return ONLY the SQL query, nothing else — no explanation, no markdown formatting.For partial text matches, use LIKE with % wildcards, e.g. WHERE LOWER(department) LIKE LOWER('%marketing%')
    
    Question: {question}
    """
    
    
    response = client.chat.completions.create(
    model="openai/gpt-oss-120b",
    messages=[
        {"role": "user", "content": prompt}
    ]
)
    
    sql_query = response.choices[0].message.content
    return sql_query

def execute_sql(sql_query: str, db: Session):
    # Step 1: Safety check - sirf SELECT allow karo
    if not sql_query.strip().upper().startswith("SELECT"):
        raise ValueError("Only SELECT queries are allowed for safety reasons.")
    # Step 2: db.execute() se query run karo
    result = db.execute(text(sql_query))
    # Step 3: Result ko rows mein convert karo
    rows = result.fetchall()
    # Step 4: Return karo
    return rows