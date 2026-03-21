"""Seed Margaret Chen's patient profile into Supabase."""
import os
import json
import sys

from dotenv import load_dotenv
from supabase import create_client

# Load env from backend
load_dotenv(os.path.join(os.path.dirname(__file__), "..", "backend", ".env"))


def seed_margaret() -> str:
    """Insert Margaret Chen and return her patient ID."""
    url = os.getenv("SUPABASE_URL")
    key = os.getenv("SUPABASE_SERVICE_ROLE_KEY")
    if not url or not key:
        print("Error: SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set in backend/.env")
        sys.exit(1)

    client = create_client(url, key)

    margaret = {
        "name": "Margaret Chen",
        "age": 74,
        "conditions": ["hypertension", "type_2_diabetes", "post_hip_replacement"],
        "medications": json.dumps([
            {"name": "Lisinopril", "dosage": "10mg", "schedule": "morning", "purpose": "Blood pressure"},
            {"name": "Metformin", "dosage": "500mg", "schedule": "morning_evening", "purpose": "Diabetes"},
            {"name": "Acetaminophen", "dosage": "500mg", "schedule": "as_needed", "purpose": "Pain management"},
        ]),
        "contacts": json.dumps([
            {"name": "Sarah Chen", "relation": "Daughter", "phone": "+1-647-555-0123", "avatar": "butterfly_blue"},
            {"name": "Dr. Patel", "relation": "GP", "phone": "+1-416-555-0456", "avatar": "robin_red"},
            {"name": "James Chen", "relation": "Son", "phone": "+1-905-555-0789", "avatar": "butterfly_green"},
        ]),
    }

    # Check if Margaret already exists
    existing = client.table("patients").select("id").eq("name", "Margaret Chen").execute()
    if existing.data:
        patient_id = existing.data[0]["id"]
        print(f"Margaret Chen already exists with ID: {patient_id}")
        return patient_id

    result = client.table("patients").insert(margaret).execute()
    patient_id = result.data[0]["id"]
    print(f"Seeded Margaret Chen with ID: {patient_id}")
    return patient_id


if __name__ == "__main__":
    seed_margaret()
