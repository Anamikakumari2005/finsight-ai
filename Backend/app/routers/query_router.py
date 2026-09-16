from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.services.text_to_sql import generate_sql, execute_sql

router = APIRouter()

@router.post("/ask")
def ask_question(question: str, db: Session = Depends(get_db)):
    # Step 1: generate_sql() call karo user ke question se
    sql_query = generate_sql(question)
    # Step 2: execute_sql() call karo jo SQL mila usse
    result = execute_sql(sql_query, db) 
    # Step 3: result return karo (saath mein generated SQL bhi bhej do, taaki dashboard pe dikha sako "ye query chali")
    return {
        "generated_sql": sql_query,
        "result": [dict(row._mapping) for row in result] # SQLAlchemy Row ko dict mein convert karo
    }
    