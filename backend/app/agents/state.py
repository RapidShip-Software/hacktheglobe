from typing import TypedDict, Optional


class PatientState(TypedDict):
    patient_id: str
    raw_readings: list[dict]
    timeline: list[dict]
    baselines: dict
    risk_score: float
    risk_narrative: str
    caregiver_summary: str
    clinical_alert: Optional[dict]
    garden_state: dict
    discharge_flag: bool
    discharge_plan: Optional[dict]
