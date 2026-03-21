import json
import statistics
from datetime import datetime, timedelta, timezone

from langchain_core.messages import HumanMessage

from .state import PatientState
from .prompts import (
    RISK_NARRATIVE_PROMPT,
    COMMUNICATE_PROMPT,
    CLINICAL_ALERT_INSTRUCTION_HIGH,
    CLINICAL_ALERT_INSTRUCTION_LOW,
    DISCHARGE_PROMPT,
)
from ..services.gemini_client import get_gemini_llm
from ..services.supabase_client import get_patient_by_id, get_readings_for_patient


# ---------------------------------------------------------------------------
# Node 1: ingest_data (pure Python, no LLM)
# ---------------------------------------------------------------------------

def ingest_data(state: PatientState) -> dict:
    patient_id = state["patient_id"]
    readings = get_readings_for_patient(patient_id, limit=100)

    now = datetime.now(timezone.utc)
    seven_days_ago = now - timedelta(days=7)

    recent = [
        r for r in readings
        if datetime.fromisoformat(r["recorded_at"].replace("Z", "+00:00")) >= seven_days_ago
    ]

    timeline: list[dict] = []
    bp_values: list[float] = []
    activity_values: list[int] = []
    missed_meds: list[dict] = []
    symptoms: list[dict] = []
    checkins: list[dict] = []

    for r in recent:
        entry = {
            "type": r["type"],
            "value": r["value"],
            "recorded_at": r["recorded_at"],
        }
        timeline.append(entry)

        if r["type"] == "bp" and r["value"].get("systolic"):
            bp_values.append(r["value"]["systolic"])
        elif r["type"] == "activity" and r["value"].get("steps") is not None:
            activity_values.append(r["value"]["steps"])
        elif r["type"] == "medication" and not r["value"].get("taken", True):
            missed_meds.append(r)
        elif r["type"] == "symptom":
            symptoms.append(r)
        elif r["type"] == "checkin":
            checkins.append(r)

    baselines: dict = {}
    if bp_values:
        baselines["bp_mean"] = statistics.mean(bp_values)
        baselines["bp_stdev"] = statistics.stdev(bp_values) if len(bp_values) > 1 else 10.0
    if activity_values:
        baselines["activity_mean"] = statistics.mean(activity_values)

    baselines["missed_med_count"] = len(missed_meds)
    baselines["symptom_count"] = len(symptoms)
    baselines["checkin_count"] = len(checkins)
    baselines["total_readings"] = len(recent)

    # Check for days without check-in
    checkin_dates = set()
    for c in checkins:
        dt = datetime.fromisoformat(c["recorded_at"].replace("Z", "+00:00"))
        checkin_dates.add(dt.date())
    days_without_checkin = 0
    for i in range(7):
        d = (now - timedelta(days=i)).date()
        if d not in checkin_dates:
            days_without_checkin += 1
    baselines["days_without_checkin"] = days_without_checkin

    # Check consecutive days with elevated BP
    bp_by_date: dict[str, list[float]] = {}
    for r in recent:
        if r["type"] == "bp" and r["value"].get("systolic"):
            dt = datetime.fromisoformat(r["recorded_at"].replace("Z", "+00:00"))
            key = dt.date().isoformat()
            bp_by_date.setdefault(key, []).append(r["value"]["systolic"])

    elevated_bp_days = 0
    for i in range(7):
        d = (now - timedelta(days=i)).date().isoformat()
        if d in bp_by_date and max(bp_by_date[d]) > 140:
            elevated_bp_days += 1
    baselines["elevated_bp_days"] = elevated_bp_days

    # Activity reduction
    if activity_values and baselines.get("activity_mean", 0) > 0:
        recent_3_day_activity = activity_values[:3] if len(activity_values) >= 3 else activity_values
        avg_recent = statistics.mean(recent_3_day_activity)
        baselines["activity_reduction"] = avg_recent / baselines["activity_mean"]
    else:
        baselines["activity_reduction"] = 1.0

    timeline.sort(key=lambda x: x["recorded_at"])

    return {
        "raw_readings": recent,
        "timeline": timeline,
        "baselines": baselines,
    }


# ---------------------------------------------------------------------------
# Node 2: assess_risk (hybrid: deterministic + Gemini)
# ---------------------------------------------------------------------------

def assess_risk(state: PatientState) -> dict:
    baselines = state["baselines"]
    risk_score = 0.0
    risk_factors: list[str] = []

    # Elevated BP for 3+ days AND missed meds = +40
    elevated_bp_days = baselines.get("elevated_bp_days", 0)
    missed_meds = baselines.get("missed_med_count", 0)
    if elevated_bp_days >= 3 and missed_meds > 0:
        risk_score += 40
        risk_factors.append(f"Elevated BP (>140 systolic) for {elevated_bp_days} days with {missed_meds} missed medication(s)")
    elif elevated_bp_days >= 2:
        risk_score += 20
        risk_factors.append(f"Elevated BP for {elevated_bp_days} days")

    # Symptoms = +15 each
    symptom_count = baselines.get("symptom_count", 0)
    if symptom_count > 0:
        risk_score += min(symptom_count * 15, 30)
        risk_factors.append(f"{symptom_count} symptom report(s) (dizziness, pain, etc.)")

    # Reduced activity for 2+ days = +10
    if baselines.get("activity_reduction", 1.0) < 0.5:
        risk_score += 10
        risk_factors.append("Activity reduced to less than 50% of 7-day average")

    # No check-in for 2+ days = +20
    if baselines.get("days_without_checkin", 0) >= 2:
        risk_score += 20
        risk_factors.append(f"No check-in for {baselines['days_without_checkin']} of last 7 days")

    # Missed meds without elevated BP still adds some risk
    if missed_meds > 0 and elevated_bp_days < 3:
        risk_score += min(missed_meds * 5, 15)
        risk_factors.append(f"{missed_meds} missed medication(s)")

    risk_score = min(risk_score, 100.0)

    # Build readings summary for LLM
    readings_summary = _build_readings_summary(state["timeline"], baselines)

    # Gemini call for risk narrative (with fallback)
    try:
        llm = get_gemini_llm()
        prompt = RISK_NARRATIVE_PROMPT.format(
            readings_summary=readings_summary,
            risk_score=risk_score,
            risk_factors=", ".join(risk_factors) if risk_factors else "None identified",
        )
        response = llm.invoke([HumanMessage(content=prompt)])
        risk_narrative = response.content.strip()
    except Exception:
        # Fallback narrative from deterministic data
        if risk_factors:
            risk_narrative = f"Risk score {risk_score:.0f}/100. Key factors: {'; '.join(risk_factors)}. Monitoring recommended."
        else:
            risk_narrative = f"Risk score {risk_score:.0f}/100. All readings are within normal range. No concerns at this time."

    return {
        "risk_score": risk_score,
        "risk_narrative": risk_narrative,
    }


# ---------------------------------------------------------------------------
# Node 3: communicate (single Gemini call -> 3 outputs)
# ---------------------------------------------------------------------------

def communicate(state: PatientState) -> dict:
    patient_id = state["patient_id"]
    patient = get_patient_by_id(patient_id)

    risk_score = state["risk_score"]
    clinical_alert_instruction = (
        CLINICAL_ALERT_INSTRUCTION_HIGH if risk_score > 40 else CLINICAL_ALERT_INSTRUCTION_LOW
    )

    readings_summary = _build_readings_summary(state["timeline"], state["baselines"])

    prompt = COMMUNICATE_PROMPT.format(
        patient_name=patient["name"] if patient else "Unknown",
        patient_age=patient["age"] if patient else "Unknown",
        conditions=", ".join(patient.get("conditions", [])) if patient else "Unknown",
        readings_summary=readings_summary,
        risk_score=risk_score,
        risk_narrative=state["risk_narrative"],
        clinical_alert_instruction=clinical_alert_instruction,
    )

    # Gemini call with full fallback
    try:
        llm = get_gemini_llm()
        response = llm.invoke([HumanMessage(content=prompt)])
        raw = response.content.strip()

        # Parse JSON from response (handle markdown fences if present)
        json_str = raw
        if "```json" in json_str:
            json_str = json_str.split("```json")[1].split("```")[0].strip()
        elif "```" in json_str:
            json_str = json_str.split("```")[1].split("```")[0].strip()

        result = json.loads(json_str)
    except Exception:
        # Full fallback if Gemini fails or returns bad JSON
        patient_name = patient["name"] if patient else "Margaret"
        signal = "green" if risk_score < 30 else ("yellow" if risk_score <= 60 else "red")
        missed = state["baselines"].get("missed_med_count", 0)

        summaries = {
            "green": f"green: {patient_name} is doing well today. All readings are within normal range and medications are being taken on schedule. No concerns at this time.",
            "yellow": f"yellow: {patient_name}'s readings need some attention. {state['risk_narrative']} A check-in call would be helpful.",
            "red": f"red: {patient_name} needs attention. {state['risk_narrative']} Please contact the care team promptly.",
        }

        clinical_alert_fallback = None
        if risk_score > 40:
            clinical_alert_fallback = {
                "level": "critical" if risk_score > 60 else "warning",
                "title": "Elevated Risk Detected",
                "summary": state["risk_narrative"],
                "recommended_action": "Review patient readings and consider scheduling a follow-up appointment.",
                "triggers": [f"Risk score: {risk_score:.0f}/100"],
            }

        result = {
            "caregiver_summary": summaries[signal],
            "clinical_alert": clinical_alert_fallback,
            "garden_state": {
                "plant_health": max(0.2, 1.0 - (risk_score / 100)),
                "sky": "clear" if risk_score < 30 else ("cloudy" if risk_score <= 60 else "stormy"),
                "nudge": missed > 0,
            },
        }

    return {
        "caregiver_summary": result.get("caregiver_summary", ""),
        "clinical_alert": result.get("clinical_alert"),
        "garden_state": result.get("garden_state", {"plant_health": 0.8, "sky": "clear", "nudge": False}),
    }


# ---------------------------------------------------------------------------
# Node 4: plan_discharge (only if discharge_flag=True)
# ---------------------------------------------------------------------------

def plan_discharge(state: PatientState) -> dict:
    patient_id = state["patient_id"]
    patient = get_patient_by_id(patient_id)

    medications_str = json.dumps(patient.get("medications", []), indent=2) if patient else "[]"
    risk_trajectory = f"Current risk score: {state['risk_score']}/100. {state['risk_narrative']}"

    prompt = DISCHARGE_PROMPT.format(
        patient_name=patient["name"] if patient else "Unknown",
        patient_age=patient["age"] if patient else "Unknown",
        conditions=", ".join(patient.get("conditions", [])) if patient else "Unknown",
        medications=medications_str,
        risk_trajectory=risk_trajectory,
    )

    try:
        llm = get_gemini_llm()
        response = llm.invoke([HumanMessage(content=prompt)])
        raw = response.content.strip()

        json_str = raw
        if "```json" in json_str:
            json_str = json_str.split("```json")[1].split("```")[0].strip()
        elif "```" in json_str:
            json_str = json_str.split("```")[1].split("```")[0].strip()

        discharge_plan = json.loads(json_str)
    except Exception:
        meds = patient.get("medications", []) if patient else []
        discharge_plan = {
            "medications": [
                {"name": m.get("name", ""), "dosage": m.get("dosage", ""), "schedule": m.get("schedule", ""), "instructions": "Continue as prescribed"}
                for m in meds
            ],
            "follow_ups": [
                {"type": "GP visit", "timing": "Within 1 week", "provider": "Primary care physician", "notes": "Review blood pressure readings and medication adherence"}
            ],
            "red_flags": [
                "Sudden severe headache",
                "Chest pain or shortness of breath",
                "Blood pressure above 180/120",
                "Dizziness or fainting",
                "Swelling in legs or ankles",
            ],
            "services": [
                "Home physiotherapy",
                "Community nursing visits",
                "Medication delivery service",
            ],
        }

    return {
        "discharge_plan": discharge_plan,
    }


# ---------------------------------------------------------------------------
# Helper
# ---------------------------------------------------------------------------

def _build_readings_summary(timeline: list[dict], baselines: dict) -> str:
    lines: list[str] = []

    bp_readings = [t for t in timeline if t["type"] == "bp"]
    if bp_readings:
        latest_bp = bp_readings[-1]["value"]
        lines.append(f"Latest BP: {latest_bp.get('systolic', '?')}/{latest_bp.get('diastolic', '?')}")
        if baselines.get("bp_mean"):
            lines.append(f"7-day BP average (systolic): {baselines['bp_mean']:.0f}")
        lines.append(f"Days with elevated BP (>140): {baselines.get('elevated_bp_days', 0)}")

    lines.append(f"Missed medications (7 days): {baselines.get('missed_med_count', 0)}")
    lines.append(f"Symptom reports: {baselines.get('symptom_count', 0)}")
    lines.append(f"Check-ins: {baselines.get('checkin_count', 0)}")
    lines.append(f"Days without check-in: {baselines.get('days_without_checkin', 0)}")

    if baselines.get("activity_mean"):
        lines.append(f"Average activity (steps): {baselines['activity_mean']:.0f}")
        lines.append(f"Activity reduction ratio: {baselines.get('activity_reduction', 1.0):.2f}")

    # Add recent symptoms detail
    symptoms = [t for t in timeline if t["type"] == "symptom"]
    for s in symptoms[-3:]:
        lines.append(f"Symptom: {s['value'].get('description', 'unknown')} (severity: {s['value'].get('severity', 'unknown')})")

    return "\n".join(lines)
