import time

from fastapi import APIRouter, HTTPException

from ..models.schemas import ReadingCreate, Reading, Assessment
from ..services.supabase_client import create_reading, create_assessment, get_patient_by_id, get_latest_assessment
from ..agents.graph import graph

router = APIRouter(prefix="/api/readings", tags=["readings"])

# Cooldown: only run the full LangGraph pipeline once per 5 minutes per patient
_last_pipeline_run: dict[str, float] = {}
PIPELINE_COOLDOWN_SECONDS = 300


@router.post("", response_model=Assessment)
async def post_reading(data: ReadingCreate) -> Assessment:
    """Accept a reading, trigger LangGraph pipeline (with cooldown), store assessment."""
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

    # Check cooldown - return latest assessment if pipeline ran recently
    now = time.time()
    last_run = _last_pipeline_run.get(data.patient_id, 0)
    if now - last_run < PIPELINE_COOLDOWN_SECONDS:
        existing = get_latest_assessment(data.patient_id)
        if existing:
            return Assessment(**existing)

    _last_pipeline_run[data.patient_id] = now

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
