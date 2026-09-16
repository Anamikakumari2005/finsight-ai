from fastapi import FastAPI
from app.db.database import Base, engine
from app.models.expense import Expense
from app.models.user import User
from fastapi.middleware.cors import CORSMiddleware
from app.routers import expense_router
from app.routers import query_router
from app.routers import agent_router
from app.routers import auth_router


Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Financial Data API",
    version="1.0.0"
)

# CORS - React ko access de
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(expense_router.router)
app.include_router(query_router.router)
app.include_router(agent_router.router)
app.include_router(auth_router.router)