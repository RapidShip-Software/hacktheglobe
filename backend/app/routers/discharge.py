from fastapi import APIRouter, HTTPException

from ..models.schemas import DischargePlan
from ..services.supabase_client import (
    get_patient_by_id,
    create_discharge_plan,
)
from ..agents.graph import graph

router = APIRouter(prefix="/api/patients", tags=["discharge"])


@router.post("/{patient_id}/discharge", response_model=DischargePlan)
async def trigger_discharge(patient_id: str) -> DischargePlan:
    """Trigger discharge planning agent for a patient."""
    patient = get_patient_by_id(patient_id)
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")

    # Run LangGraph pipeline with discharge_flag=True
    initial_state = {
        "patient_id": patient_id,
        "raw_readings": [],
        "timeline": [],
        "baselines": {},
        "risk_score": 0.0,
        "risk_narrative": "",
        "caregiver_summary": "",
        "clinical_alert": None,
        "garden_state": {"plant_health": 0.8, "sky": "clear", "nudge": False},
        "discharge_flag": True,
        "discharge_plan": None,
    }

    result = graph.invoke(initial_state)

    discharge_plan = result.get("discharge_plan", {})

    # Store the discharge plan
    plan_data = {
        "patient_id": patient_id,
        "medications": discharge_plan.get("medications"),
        "follow_ups": discharge_plan.get("follow_ups"),
        "red_flags": discharge_plan.get("red_flags", []),
        "services": discharge_plan.get("services", []),
        "created_by": "ai_agent",
    }
    stored = create_discharge_plan(plan_data)
    return DischargePlan(**stored)
