from fastapi import APIRouter, Depends
from app.services.agent_service import app_graph
from app.dependencies import get_current_user
from app.models.user import User

router = APIRouter()

@router.post("/agent-ask")
def agent_ask(question: str, current_user: User = Depends(get_current_user)):
    result = app_graph.invoke({"question": question})
    return {
        "route": result["route"],
        "answer": result["final_answer"]
    }