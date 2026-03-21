from fastapi import APIRouter, HTTPException

from ..models.schemas import ReadingCreate, Reading, Assessment
from ..services.supabase_client import create_reading, create_assessment, get_patient_by_id
from ..agents.graph import graph

router = APIRouter(prefix="/api/readings", tags=["readings"])


@router.post("", response_model=Assessment)
async def post_reading(data: ReadingCreate) -> Assessment:
    """Accept a reading, trigger LangGraph pipeline, store assessment."""
    patient = get_patient_by_id(data.patient_id)
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")

    # Store the reading
    create_reading(
        patient_id=data.patient_id,
        reading_type=data.type,
        value=data.value,
        recorded_at=data.recorded_at,
    )

    # Run LangGraph pipeline
    initial_state = {
        "patient_id": data.patient_id,
        "raw_readings": [],
        "timeline": [],
        "baselines": {},
        "risk_score": 0.0,
        "risk_narrative": "",
        "caregiver_summary": "",
        "clinical_alert": None,
        "garden_state": {"plant_health": 0.8, "sky": "clear", "nudge": False},
        "discharge_flag": False,
        "discharge_plan": None,
    }

    result = graph.invoke(initial_state)

    # Store the assessment
    assessment_data = {
        "patient_id": data.patient_id,
        "risk_score": result["risk_score"],
        "risk_narrative": result["risk_narrative"],
        "caregiver_summary": result["caregiver_summary"],
        "clinical_alert": result.get("clinical_alert"),
        "garden_state": result.get("garden_state"),
    }
    stored = create_assessment(assessment_data)
    return Assessment(**stored)
