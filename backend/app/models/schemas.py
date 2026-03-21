from datetime import datetime
from typing import Optional

from pydantic import BaseModel, Field


class Medication(BaseModel):
    name: str
    dosage: str
    schedule: str
    purpose: str


class Contact(BaseModel):
    name: str
    relation: str
    phone: str
    avatar: str


class Patient(BaseModel):
    id: str
    name: str
    age: int
    conditions: list[str] = Field(default_factory=list)
    medications: list[Medication] = Field(default_factory=list)
    contacts: list[Contact] = Field(default_factory=list)
    created_at: Optional[datetime] = None


class ReadingValue(BaseModel):
    """Flexible reading value container."""
    systolic: Optional[int] = None
    diastolic: Optional[int] = None
    taken: Optional[bool] = None
    medication_name: Optional[str] = None
    description: Optional[str] = None
    severity: Optional[str] = None
    steps: Optional[int] = None
    mood: Optional[str] = None
    note: Optional[str] = None


class ReadingCreate(BaseModel):
    patient_id: str
    type: str = Field(pattern=r"^(bp|medication|symptom|activity|checkin)$")
    value: dict
    recorded_at: Optional[datetime] = None


class Reading(BaseModel):
    id: str
    patient_id: str
    type: str
    value: dict
    recorded_at: datetime


class GardenState(BaseModel):
    plant_health: float = Field(default=0.8, ge=0.0, le=1.0)
    sky: str = Field(default="clear", pattern=r"^(clear|cloudy|stormy)$")
    nudge: bool = False


class ClinicalAlert(BaseModel):
    level: str = Field(pattern=r"^(info|warning|critical)$")
    title: str
    summary: str
    recommended_action: str
    triggers: list[str] = Field(default_factory=list)


class Assessment(BaseModel):
    id: str
    patient_id: str
    risk_score: float = Field(default=0.0, ge=0.0, le=100.0)
    risk_narrative: Optional[str] = None
    caregiver_summary: Optional[str] = None
    clinical_alert: Optional[dict] = None
    garden_state: Optional[dict] = None
    created_at: Optional[datetime] = None


class DischargePlan(BaseModel):
    id: str
    patient_id: str
    medications: Optional[list[dict]] = None
    follow_ups: Optional[list[dict]] = None
    red_flags: list[str] = Field(default_factory=list)
    services: list[str] = Field(default_factory=list)
    created_by: str = "system"
    created_at: Optional[datetime] = None


class CaregiverNote(BaseModel):
    id: str
    patient_id: str
    author: str
    content: str
    created_at: Optional[datetime] = None


class CaregiverNoteCreate(BaseModel):
    author: str
    content: str


class PatientSummary(BaseModel):
    patient: Patient
    latest_assessment: Optional[Assessment] = None
    recent_readings: list[Reading] = Field(default_factory=list)
