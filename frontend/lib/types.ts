/** Mirrors backend Pydantic models */

export type Medication = {
  name: string;
  dosage: string;
  schedule: string;
  purpose: string;
};

export type Contact = {
  name: string;
  relation: string;
  phone: string;
  avatar: string;
};

export type Patient = {
  id: string;
  name: string;
  age: number;
  conditions: string[];
  medications: Medication[];
  contacts: Contact[];
  created_at: string | null;
};

export type ReadingValue = {
  systolic?: number;
  diastolic?: number;
  taken?: boolean;
  medication_name?: string;
  description?: string;
  severity?: string;
  steps?: number;
  mood?: string;
  note?: string;
};

export type Reading = {
  id: string;
  patient_id: string;
  type: "bp" | "medication" | "symptom" | "activity" | "checkin";
  value: ReadingValue;
  recorded_at: string;
};

export type GardenState = {
  plant_health: number;
  sky: "clear" | "cloudy" | "stormy";
  nudge: boolean;
};

export type ClinicalAlert = {
  level: "info" | "warning" | "critical";
  title: string;
  summary: string;
  recommended_action: string;
  triggers: string[];
};

export type Assessment = {
  id: string;
  patient_id: string;
  risk_score: number;
  risk_narrative: string | null;
  caregiver_summary: string | null;
  clinical_alert: ClinicalAlert | null;
  garden_state: GardenState | null;
  created_at: string | null;
};

export type DischargePlan = {
  id: string;
  patient_id: string;
  medications: Record<string, unknown>[] | null;
  follow_ups: Record<string, unknown>[] | null;
  red_flags: string[];
  services: string[];
  created_by: string;
  created_at: string | null;
};

export type CaregiverNote = {
  id: string;
  patient_id: string;
  author: string;
  content: string;
  created_at: string | null;
};

export type PatientSummary = {
  patient: Patient;
  latest_assessment: Assessment | null;
  recent_readings: Reading[];
};
