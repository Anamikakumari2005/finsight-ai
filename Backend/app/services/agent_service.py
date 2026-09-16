from typing import TypedDict
from dotenv import load_dotenv
from app.services.policy_rag_service import answer_policy_question
from langgraph.graph import StateGraph, START, END
from langchain_groq import ChatGroq
from app.services.text_to_sql import generate_sql, execute_sql
from app.db.database import SessionLocal
import os


load_dotenv()

llm = ChatGroq(
               model="openai/gpt-oss-120b",
               api_key=os.getenv("GROQ_API_KEY"))


class AgentState(TypedDict):
    question: str          # user ka original sawaal
    route: str             # "sql" / "rag" / "both" (router decide karega)
    sql_result: str        # SQL se aaya answer (agar chahiye)
    rag_result: str        # RAG se aaya answer (agar chahiye)
    final_answer: str      # combine kiya hua final jawab
    
def router_node(state: AgentState) -> AgentState:
    question = state["question"]
    prompt = f"""
    You are a routing assistant for a financial dashboard system.
Given a user's question, decide which data source is needed to answer it:

- Respond "sql" if the question is about numbers, amounts, totals, or specific expense records (e.g. "how much was spent on X", "list expenses in Y department")
- Respond "rag" if the question is about company policies, rules, or limits (e.g. "what is the travel policy", "what is the approval limit for X")
- Respond "both" if the question requires comparing actual spending data AGAINST a policy rule (e.g. "did our travel spending exceed the policy limit")

Respond with ONLY one word: sql, rag, or both. No explanation, no punctuation.

Question: {question}

    """
    
    response = llm.invoke(prompt)    
    route = response.content.strip().lower()
    state["route"] = route
    return state    

def sql_node(state: AgentState) -> AgentState:
    question = state["question"]
    sql_query = generate_sql(question)
    
    db = SessionLocal()
    try:
        result = execute_sql(sql_query, db)
    finally:
        db.close()
    
    return {"sql_result": str(result)}


def rag_node(state: AgentState) -> AgentState:
    question = state["question"]
    answer = answer_policy_question(question)
    state["rag_result"] = answer
    return state

def combine_node(state: AgentState) -> AgentState:
    question = state["question"]
    sql_result = state.get("sql_result", "")
    rag_result = state.get("rag_result", "")
    
    prompt = f"""
    User asked: {question}
    SQL data found: {sql_result}
    Policy information found: {rag_result}
    
    Combine this information into a clear, natural answer for the user.
    If one of the data sources is empty, just use the information that is available.
    """
    
    response = llm.invoke(prompt)
    state["final_answer"] = response.content.strip()
    return state

graph = StateGraph(AgentState)

# Step 1: Nodes add karo
graph.add_node("router", router_node)
graph.add_node("sql", sql_node)
graph.add_node("rag", rag_node)
graph.add_node("combine", combine_node)

# Step 2: Start se router tak edge
graph.add_edge(START, "router")

# Step 3: Router ke baad — conditional edge (route ke hisaab se decide)
def route_decision(state: AgentState):
    route = state["route"]
    if route == "sql":
        return ["sql"]
    elif route == "rag":
        return ["rag"]
    else:  # "both"
        return ["sql", "rag"]

graph.add_conditional_edges("router", route_decision, ["sql", "rag"])

# Step 4: SQL aur RAG dono, combine tak jaate hain
graph.add_edge("sql", "combine")
graph.add_edge("rag", "combine")

# Step 5: Combine ke baad END
graph.add_edge("combine", END)

# Step 6: Graph ko "compile" karo (usable banane ke liye)
app_graph = graph.compile()

