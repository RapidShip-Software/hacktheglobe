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


FALLBACK_RESPONSES = {
    "sad": "I'm so sorry you're feeling that way, {name}. You're not alone, and it's okay to have tough days. Would you like to tap a butterfly to call Sarah or James? Sometimes hearing a familiar voice helps.",
    "depressed": "I hear you, {name}, and I'm glad you told me. Please know your family cares about you deeply. Tap the butterfly to reach Sarah, she would love to hear from you. You matter so much.",
    "pain": "I'm sorry you're in pain, {name}. Please let your family or Dr. Patel know. You can tap the robin to call the doctor, or the butterfly to reach Sarah.",
    "help": "Of course, {name}! I'm here for you. You can log your blood pressure with the heart button, take your medications, or tap a butterfly to call your family anytime.",
    "dizzy": "Dizziness can be worrying, {name}. Please sit down somewhere safe and have some water. If it doesn't pass, tap the robin to call Dr. Patel.",
    "default": [
        "Hello {name}! Your garden is doing beautifully today. Remember, every time you log your blood pressure or take your medication, your plant grows a little more!",
        "Hi {name}! I hope you're having a good day. Don't forget your Lisinopril this morning, it helps keep your garden blooming!",
        "Welcome back, {name}! Your family is always just a butterfly tap away if you need them. Is there anything I can help with?",
        "Good to see you, {name}! A little walk today would do wonders for both you and your garden. How are you feeling?",
    ],
}

_fallback_index = 0


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
    except Exception:
        global _fallback_index
        msg_lower = req.message.lower()
        # Check for emotional/health keywords
        for keyword in ("depress", "sad", "lonely", "crying", "upset", "anxious", "scared"):
            if keyword in msg_lower:
                return ChatResponse(reply=FALLBACK_RESPONSES["sad"].format(name=req.patient_name))
        for keyword in ("pain", "hurt", "ache"):
            if keyword in msg_lower:
                return ChatResponse(reply=FALLBACK_RESPONSES["pain"].format(name=req.patient_name))
        for keyword in ("dizzy", "faint", "lightheaded"):
            if keyword in msg_lower:
                return ChatResponse(reply=FALLBACK_RESPONSES["dizzy"].format(name=req.patient_name))
        for keyword in ("help",):
            if keyword in msg_lower:
                return ChatResponse(reply=FALLBACK_RESPONSES["help"].format(name=req.patient_name))
        # Default rotating responses
        defaults = FALLBACK_RESPONSES["default"]
        reply = defaults[_fallback_index % len(defaults)].format(name=req.patient_name)
        _fallback_index += 1
        return ChatResponse(reply=reply)
