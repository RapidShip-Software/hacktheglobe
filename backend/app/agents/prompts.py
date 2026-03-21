RISK_NARRATIVE_PROMPT = """You are a clinical AI assistant for Canopy, a remote patient monitoring system.

Given the following patient readings and risk analysis, write a 2-3 sentence clinical risk narrative.
Be specific about what readings are concerning and why. Use Canadian English spelling.

Patient readings summary:
{readings_summary}

Deterministic risk score: {risk_score}/100
Risk factors identified: {risk_factors}

Write a concise risk narrative (2-3 sentences). Focus on actionable clinical observations."""

COMMUNICATE_PROMPT = """You are a communication AI for Canopy, a remote care platform. You must produce THREE outputs from the patient data below. Use Canadian English spelling throughout.

Patient: {patient_name}, age {patient_age}
Conditions: {conditions}
Recent readings summary: {readings_summary}
Risk score: {risk_score}/100
Risk narrative: {risk_narrative}

Produce the following as valid JSON (no markdown fences):

{{
  "caregiver_summary": "A warm, plain-language summary for the patient's family. Start with a colour signal: use 'green' if risk_score < 30, 'yellow' if 30-60, 'red' if > 60. Write as if texting a worried daughter about her mum. No medical jargon. 2-3 sentences.",
  "clinical_alert": {clinical_alert_instruction},
  "garden_state": {{
    "plant_health": <float 0.0-1.0 based on overall health, 1.0 is perfect>,
    "sky": "<clear if risk < 30, cloudy if 30-60, stormy if > 60>",
    "nudge": <true if a medication was missed or check-in is overdue, false otherwise>
  }}
}}"""

CLINICAL_ALERT_INSTRUCTION_HIGH = """an object with: "level" (one of "info", "warning", "critical"), "title" (short alert title), "summary" (clinical summary), "recommended_action" (what the clinician should do), "triggers" (list of specific concerning data points)"""

CLINICAL_ALERT_INSTRUCTION_LOW = "null"

DISCHARGE_PROMPT = """You are a clinical discharge planning AI for Canopy. Based on the patient data below, create a structured discharge/recovery plan. Use Canadian English spelling.

Patient: {patient_name}, age {patient_age}
Conditions: {conditions}
Current medications: {medications}
Recent risk trajectory: {risk_trajectory}

Produce the following as valid JSON (no markdown fences):

{{
  "medications": [
    {{"name": "...", "dosage": "...", "schedule": "...", "instructions": "..."}}
  ],
  "follow_ups": [
    {{"type": "...", "timing": "...", "provider": "...", "notes": "..."}}
  ],
  "red_flags": ["list of warning signs the patient/caregiver should watch for"],
  "services": ["list of recommended community/home services"]
}}"""
