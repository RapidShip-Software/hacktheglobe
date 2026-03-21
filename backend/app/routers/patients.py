from fastapi import APIRouter, HTTPException

from ..models.schemas import (
    Patient,
    PatientWithRisk,
    PatientProfile,
    CaregiverNote,
    CaregiverNoteCreate,
)
from ..services.supabase_client import (
    get_all_patients,
    get_patient_by_id,
    get_latest_assessment,
    get_readings_for_patient,
    get_caregiver_notes,
    create_caregiver_note,
)

router = APIRouter(prefix="/api/patients", tags=["patients"])


@router.get("", response_model=list[PatientWithRisk])
async def list_patients() -> list[PatientWithRisk]:
    """Return all patients with their latest risk scores."""
    patients = get_all_patients()
    result: list[PatientWithRisk] = []
    for p in patients:
        assessment = get_latest_assessment(p["id"])
        result.append(
            PatientWithRisk(
                id=p["id"],
                name=p["name"],
                age=p["age"],
                conditions=p.get("conditions", []),
                risk_score=assessment["risk_score"] if assessment else 0.0,
                latest_summary=assessment.get("caregiver_summary") if assessment else None,
            )
        )
    return result


@router.get("/{patient_id}/profile", response_model=PatientProfile)
async def get_profile(patient_id: str) -> PatientProfile:
    """Return patient + recent readings + latest assessment + notes."""
    patient = get_patient_by_id(patient_id)
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")

    assessment = get_latest_assessment(patient_id)
    readings = get_readings_for_patient(patient_id, limit=50)
    notes = get_caregiver_notes(patient_id)

    return PatientProfile(
        patient=Patient(**patient),
        latest_assessment=assessment,
        recent_readings=readings,
        caregiver_notes=notes,
    )


@router.post("/{patient_id}/notes", response_model=CaregiverNote)
async def add_note(patient_id: str, data: CaregiverNoteCreate) -> CaregiverNote:
    """Create a caregiver note."""
    patient = get_patient_by_id(patient_id)
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")

    note = create_caregiver_note(
        patient_id=patient_id,
        author=data.author,
        content=data.content,
    )
    return CaregiverNote(**note)
