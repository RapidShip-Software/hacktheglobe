import json
import os
from functools import lru_cache
from datetime import datetime
from typing import Optional

from supabase import create_client, Client

# JSONB columns that may be stored as double-encoded strings
_JSONB_FIELDS = {"value", "medications", "contacts", "clinical_alert", "garden_state", "follow_ups"}


def _fix_row(row: dict) -> dict:
    """Parse any JSONB fields that were stored as double-encoded strings."""
    for key in _JSONB_FIELDS:
        val = row.get(key)
        if isinstance(val, str):
            try:
                row[key] = json.loads(val)
            except (json.JSONDecodeError, TypeError):
                pass
    return row


def _fix_rows(rows: list[dict]) -> list[dict]:
    return [_fix_row(r) for r in rows]


@lru_cache(maxsize=1)
def get_supabase_client() -> Client:
    """Get or create the Supabase client singleton."""
    url = os.getenv("SUPABASE_URL")
    key = os.getenv("SUPABASE_SERVICE_ROLE_KEY")
    if not url or not key:
        raise ValueError("SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set")
    return create_client(url, key)


# ---------------------------------------------------------------------------
# Patients
# ---------------------------------------------------------------------------

def get_all_patients() -> list[dict]:
    sb = get_supabase_client()
    resp = sb.table("patients").select("*").execute()
    return _fix_rows(resp.data)


def get_patient_by_id(patient_id: str) -> Optional[dict]:
    sb = get_supabase_client()
    resp = sb.table("patients").select("*").eq("id", patient_id).single().execute()
    return _fix_row(resp.data) if resp.data else None


# ---------------------------------------------------------------------------
# Readings
# ---------------------------------------------------------------------------

def create_reading(patient_id: str, reading_type: str, value: dict, recorded_at: Optional[datetime] = None) -> dict:
    sb = get_supabase_client()
    row: dict = {
        "patient_id": patient_id,
        "type": reading_type,
        "value": value,
    }
    if recorded_at:
        row["recorded_at"] = recorded_at.isoformat()
    resp = sb.table("readings").insert(row).execute()
    return resp.data[0]


def get_readings_for_patient(patient_id: str, limit: int = 50) -> list[dict]:
    sb = get_supabase_client()
    resp = (
        sb.table("readings")
        .select("*")
        .eq("patient_id", patient_id)
        .order("recorded_at", desc=True)
        .limit(limit)
        .execute()
    )
    return _fix_rows(resp.data)


# ---------------------------------------------------------------------------
# Assessments
# ---------------------------------------------------------------------------

def create_assessment(data: dict) -> dict:
    sb = get_supabase_client()
    resp = sb.table("assessments").insert(data).execute()
    return resp.data[0]


def get_latest_assessment(patient_id: str) -> Optional[dict]:
    sb = get_supabase_client()
    resp = (
        sb.table("assessments")
        .select("*")
        .eq("patient_id", patient_id)
        .order("created_at", desc=True)
        .limit(1)
        .execute()
    )
    return _fix_row(resp.data[0]) if resp.data else None


def get_assessments_for_patient(patient_id: str, limit: int = 30) -> list[dict]:
    sb = get_supabase_client()
    resp = (
        sb.table("assessments")
        .select("*")
        .eq("patient_id", patient_id)
        .order("created_at", desc=True)
        .limit(limit)
        .execute()
    )
    return _fix_rows(resp.data)


def get_high_risk_assessments(threshold: float = 40.0) -> list[dict]:
    sb = get_supabase_client()
    resp = (
        sb.table("assessments")
        .select("*, patients(name, age, conditions)")
        .gt("risk_score", threshold)
        .order("created_at", desc=True)
        .limit(50)
        .execute()
    )
    return _fix_rows(resp.data)


# ---------------------------------------------------------------------------
# Discharge Plans
# ---------------------------------------------------------------------------

def create_discharge_plan(data: dict) -> dict:
    sb = get_supabase_client()
    resp = sb.table("discharge_plans").insert(data).execute()
    return resp.data[0]


def get_latest_discharge_plan(patient_id: str) -> Optional[dict]:
    sb = get_supabase_client()
    resp = (
        sb.table("discharge_plans")
        .select("*")
        .eq("patient_id", patient_id)
        .order("created_at", desc=True)
        .limit(1)
        .execute()
    )
    return _fix_row(resp.data[0]) if resp.data else None


# ---------------------------------------------------------------------------
# Caregiver Notes
# ---------------------------------------------------------------------------

def create_caregiver_note(patient_id: str, author: str, content: str) -> dict:
    sb = get_supabase_client()
    resp = (
        sb.table("caregiver_notes")
        .insert({"patient_id": patient_id, "author": author, "content": content})
        .execute()
    )
    return resp.data[0]


def get_caregiver_notes(patient_id: str, limit: int = 20) -> list[dict]:
    sb = get_supabase_client()
    resp = (
        sb.table("caregiver_notes")
        .select("*")
        .eq("patient_id", patient_id)
        .order("created_at", desc=True)
        .limit(limit)
        .execute()
    )
    return resp.data
