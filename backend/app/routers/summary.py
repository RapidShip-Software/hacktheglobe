from fastapi import APIRouter, HTTPException

from ..models.schemas import Assessment, PatientSummary, Patient
from ..services.supabase_client import (
    get_patient_by_id,
    get_latest_assessment,
    get_readings_for_patient,
    get_assessments_for_patient,
)

router = APIRouter(prefix="/api/patients", tags=["summary"])


@router.get("/{patient_id}/summary")
async def get_summary(patient_id: str) -> dict:
    """Return latest caregiver summary for a patient."""
    patient = get_patient_by_id(patient_id)
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")

    assessment = get_latest_assessment(patient_id)
    if not assessment:
        return {
            "patient_id": patient_id,
            "caregiver_summary": "No assessment data available yet.",
            "risk_score": 0.0,
            "garden_state": {"plant_health": 0.8, "sky": "clear", "nudge": False},
        }

    return {
        "patient_id": patient_id,
        "caregiver_summary": assessment.get("caregiver_summary", ""),
        "risk_score": assessment.get("risk_score", 0.0),
        "garden_state": assessment.get("garden_state"),
        "risk_narrative": assessment.get("risk_narrative", ""),
        "created_at": assessment.get("created_at"),
    }


@router.get("/{patient_id}/history", response_model=list[Assessment])
async def get_history(patient_id: str, limit: int = 30) -> list[Assessment]:
    """Return last N assessments for a patient."""
    patient = get_patient_by_id(patient_id)
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")

    assessments = get_assessments_for_patient(patient_id, limit=limit)
    return [Assessment(**a) for a in assessments]
