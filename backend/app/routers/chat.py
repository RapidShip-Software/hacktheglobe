"""Chat endpoint — connects GardenGate to Gemini for patient-facing conversation."""

from fastapi import APIRouter
from pydantic import BaseModel
from langchain_core.messages import SystemMessage, HumanMessage

from ..services.gemini_client import get_gemini_llm

router = APIRouter(prefix="/api", tags=["chat"])

SYSTEM_PROMPT = """You are a warm, caring garden helper for an elderly patient named Margaret who uses a remote health monitoring app called Canopy.

Your role:
- Be gentle, encouraging, and reassuring
- Use simple language (no medical jargon)
- Remind her about blood pressure logging, medications, and staying active
- Reference her garden metaphor — her health is reflected by a growing plant
- Keep responses short (2-3 sentences max)
- If she mentions pain, distress, or emergency symptoms, gently suggest calling her family (the butterfly contacts) or a doctor
- You can answer basic health questions but always recommend consulting her doctor for medical decisions

Context about Margaret:
- She is an elderly patient living at home
- She has family contacts: Sarah Chen (daughter), Dr. Patel (physician), James Chen (son)
- She takes Lisinopril 10mg for blood pressure and Metformin 500mg for diabetes
- Her garden grows when she logs blood pressure, takes medications, and does check-ins
"""


class ChatRequest(BaseModel):
    message: str
    patient_name: str = "Margaret"


class ChatResponse(BaseModel):
    reply: str


@router.post("/chat", response_model=ChatResponse)
async def chat(req: ChatRequest) -> ChatResponse:
    """Send a message to the garden helper AI."""
    try:
        llm = get_gemini_llm()
        messages = [
            SystemMessage(content=SYSTEM_PROMPT),
            HumanMessage(content=req.message),
        ]
        response = llm.invoke(messages)
        return ChatResponse(reply=response.content)
    except Exception as e:
        return ChatResponse(
            reply="I'm having a little trouble right now, dear. Please try again in a moment, or tap a butterfly to call your family."
        )
