from pydantic import BaseModel, Field
from datetime import date
from typing import Optional


class ExpenseCreate(BaseModel):
    date: date
    category: str
    amount: float
    department: str
    description: str | None = None
    
class ExpenseUpdate(BaseModel):
    date: date 
    category: str | None = None
    amount: float | None = None
    department: str | None = None
    description: str | None = None
    