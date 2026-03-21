-- Canopy Database Schema
-- Run this in Supabase SQL Editor

-- Enable Realtime on assessments table after creation

CREATE TABLE IF NOT EXISTS patients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  age INT NOT NULL,
  conditions TEXT[] DEFAULT '{}',
  medications JSONB DEFAULT '[]',
  contacts JSONB DEFAULT '[]',
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS readings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID REFERENCES patients(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('bp', 'medication', 'symptom', 'activity', 'checkin')),
  value JSONB NOT NULL,
  recorded_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS assessments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID REFERENCES patients(id) ON DELETE CASCADE,
  risk_score FLOAT NOT NULL DEFAULT 0,
  risk_narrative TEXT,
  caregiver_summary TEXT,
  clinical_alert JSONB,
  garden_state JSONB DEFAULT '{"plant_health": 0.8, "sky": "clear", "nudge": false}',
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS discharge_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID REFERENCES patients(id) ON DELETE CASCADE,
  medications JSONB,
  follow_ups JSONB,
  red_flags TEXT[] DEFAULT '{}',
  services TEXT[] DEFAULT '{}',
  created_by TEXT DEFAULT 'system',
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS caregiver_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID REFERENCES patients(id) ON DELETE CASCADE,
  author TEXT NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable Realtime
ALTER PUBLICATION supabase_realtime ADD TABLE assessments;
ALTER PUBLICATION supabase_realtime ADD TABLE readings;

-- Indexes
CREATE INDEX IF NOT EXISTS idx_readings_patient ON readings(patient_id, recorded_at DESC);
CREATE INDEX IF NOT EXISTS idx_assessments_patient ON assessments(patient_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_assessments_risk ON assessments(risk_score) WHERE risk_score > 40;
