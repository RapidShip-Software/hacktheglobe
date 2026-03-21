"""Seed 7 days of realistic readings for Margaret Chen."""
import os
import sys
import json
from datetime import datetime, timedelta, timezone

from dotenv import load_dotenv
from supabase import create_client

load_dotenv(os.path.join(os.path.dirname(__file__), "..", "backend", ".env"))


def seed_readings() -> None:
    """Generate and insert 7 days of readings for Margaret."""
    url = os.getenv("SUPABASE_URL")
    key = os.getenv("SUPABASE_SERVICE_ROLE_KEY")
    if not url or not key:
        print("Error: SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set in backend/.env")
        sys.exit(1)

    client = create_client(url, key)

    # Find Margaret
    result = client.table("patients").select("id").eq("name", "Margaret Chen").execute()
    if not result.data:
        print("Error: Margaret Chen not found. Run seed_margaret.py first.")
        sys.exit(1)

    patient_id = result.data[0]["id"]
    now = datetime.now(timezone.utc)
    readings: list[dict] = []

    # Day profiles:
    # Days 1-4: Normal (BP ~125/80, all meds taken, daily check-ins, normal activity)
    # Day 5: BP starts rising (135/85), one missed medication
    # Day 6: BP higher (142/88), missed medication again, reports mild dizziness
    # Day 7 (today): BP still elevated (145/90), missed morning medication, lower activity

    day_profiles = [
        # (day_offset, systolic, diastolic, meds_taken, activity_steps, symptom, mood)
        (-6, 122, 78, True, 4200, None, "good"),
        (-5, 126, 80, True, 3800, None, "good"),
        (-4, 124, 79, True, 4500, None, "well"),
        (-3, 128, 82, True, 4000, None, "good"),
        (-2, 135, 85, False, 3200, None, "okay"),        # Day 5: BP rising, missed med
        (-1, 142, 88, False, 2100, "mild dizziness", "tired"),  # Day 6: worse
        (0, 145, 90, False, 1500, "dizziness", "tired"),   # Day 7 (today): elevated
    ]

    for day_offset, systolic, diastolic, meds_taken, steps, symptom, mood in day_profiles:
        day = now + timedelta(days=day_offset)
        morning = day.replace(hour=8, minute=30, second=0, microsecond=0)
        midday = day.replace(hour=12, minute=0, second=0, microsecond=0)
        evening = day.replace(hour=18, minute=0, second=0, microsecond=0)

        # BP reading (morning)
        readings.append({
            "patient_id": patient_id,
            "type": "bp",
            "value": json.dumps({"systolic": systolic, "diastolic": diastolic}),
            "recorded_at": morning.isoformat(),
        })

        # Medication (morning) - Lisinopril
        readings.append({
            "patient_id": patient_id,
            "type": "medication",
            "value": json.dumps({
                "medication_name": "Lisinopril",
                "taken": meds_taken,
            }),
            "recorded_at": morning.replace(minute=45).isoformat(),
        })

        # Medication (morning) - Metformin
        readings.append({
            "patient_id": patient_id,
            "type": "medication",
            "value": json.dumps({
                "medication_name": "Metformin",
                "taken": meds_taken,
            }),
            "recorded_at": morning.replace(hour=9, minute=0).isoformat(),
        })

        # Activity (midday)
        readings.append({
            "patient_id": patient_id,
            "type": "activity",
            "value": json.dumps({"steps": steps}),
            "recorded_at": midday.isoformat(),
        })

        # Symptom if present
        if symptom:
            readings.append({
                "patient_id": patient_id,
                "type": "symptom",
                "value": json.dumps({
                    "description": symptom,
                    "severity": "mild" if "mild" in symptom else "moderate",
                }),
                "recorded_at": midday.replace(minute=30).isoformat(),
            })

        # Evening check-in
        readings.append({
            "patient_id": patient_id,
            "type": "checkin",
            "value": json.dumps({"mood": mood, "note": f"Day {7 + day_offset} check-in"}),
            "recorded_at": evening.isoformat(),
        })

        # Evening Metformin
        readings.append({
            "patient_id": patient_id,
            "type": "medication",
            "value": json.dumps({
                "medication_name": "Metformin",
                "taken": meds_taken,
            }),
            "recorded_at": evening.replace(minute=30).isoformat(),
        })

    # Clear existing readings for Margaret
    client.table("readings").delete().eq("patient_id", patient_id).execute()

    # Insert all readings
    client.table("readings").insert(readings).execute()
    print(f"Seeded {len(readings)} readings for Margaret Chen (patient_id: {patient_id})")


if __name__ == "__main__":
    seed_readings()
