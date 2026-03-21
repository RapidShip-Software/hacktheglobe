# MASTER BUILD PROMPT — Canopy Hackathon Build
# Hack the Globe 2026 | Health & Humanity | BCG Toronto
# Paste this into Claude Code (Opus + Max thinking)

You are building a hackathon project for Hack the Globe 2026. The PRD and Technical Reference documents are already in your context. This is a 22-hour build (Saturday 10am to Sunday 8am EST). Submissions are due Sunday March 22 at 8:00 AM EST. Judging starts at 9:30 AM.

## WHAT WE ARE BUILDING

A continuous remote care platform 'Canopy' for elderly patients with THREE interfaces and a multi-agent AI backend:

1. **Garden App** (patient-facing iPad web app) — living garden metaphor, zero digital literacy required
2. **Caregiver Dashboard** (family-facing responsive web app) — daily green/yellow/red signal
3. **Clinical Dashboard** (clinician-facing desktop web app) — AI risk alerts, patient list
4. **FastAPI Backend** with a 4-node LangGraph multi-agent pipeline using Gemini 2.0 Flash
5. **Supabase** for PostgreSQL + Auth + Realtime subscriptions

## CRITICAL CONSTRAINTS

- **Time**: ~22 hours. Every decision must optimize for speed. No over-engineering.
- **One patient demo**: Margaret Chen, 74, post-hip-replacement. All UI is built around her.
- **Three screens, one story**: The demo shows data flowing from patient app → AI pipeline → caregiver dashboard + clinical dashboard simultaneously.
- **Supabase Realtime**: All three frontends subscribe to live updates. When Margaret logs a reading, the caregiver and clinician see it within seconds.
- **No auth for hackathon**: Skip login/signup. Hardcode the demo patient. Auth is a slide-only feature.
- **Canadian spelling**: Use "colour" not "color" in UI copy, "organisation" not "organization", etc.

## TECH STACK (DO NOT DEVIATE)

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 14+ (App Router), React 18, TypeScript |
| Styling | Tailwind CSS 3.4+ |
| Animations | Framer Motion 11+ |
| Charts | Recharts |
| Icons | Lucide React |
| Backend | FastAPI (Python 3.12) |
| AI Orchestration | LangGraph 0.2+ |
| LLM | Google Gemini 2.0 Flash via langchain-google-genai |
| Database | Supabase (PostgreSQL + Realtime) |
| Deploy Frontend | Vercel |
| Deploy Backend | Railway |

## PROJECT STRUCTURE

```
hacktheglobe/
├── frontend/                     # Next.js monorepo
│   ├── app/
│   │   ├── garden/               # Patient garden app
│   │   │   └── page.tsx
│   │   ├── caregiver/            # Caregiver dashboard
│   │   │   └── page.tsx
│   │   ├── clinical/             # Clinical dashboard
│   │   │   └── page.tsx
│   │   ├── layout.tsx
│   │   └── page.tsx              # Landing/router page
│   ├── components/
│   │   ├── garden/               # HealthPlant, Sky, ButterflyContact, GardenGate, MedicationReminder
│   │   ├── caregiver/            # DailySignal, WeeklyDigest, CaregiverNotes, HistoryView
│   │   ├── clinical/             # PatientList, AlertCard, RiskTimeline, PatientProfile, DischargeFlow
│   │   └── shared/               # StatusBadge, Card, Button, LoadingSpinner
│   ├── lib/
│   │   ├── supabase.ts           # Supabase client + Realtime helpers
│   │   ├── api.ts                # FastAPI client wrapper
│   │   └── types.ts              # Shared TypeScript types (mirror Pydantic models)
│   ├── public/
│   ├── tailwind.config.ts
│   ├── next.config.js
│   ├── package.json
│   └── .env.local
├── backend/
│   ├── app/
│   │   ├── main.py               # FastAPI app, CORS, route registration
│   │   ├── routers/
│   │   │   ├── readings.py       # POST /api/readings
│   │   │   ├── patients.py       # GET /api/patients, GET /api/patients/{id}/profile
│   │   │   ├── alerts.py         # GET /api/alerts
│   │   │   ├── summary.py        # GET /api/patients/{id}/summary
│   │   │   └── discharge.py      # POST /api/patients/{id}/discharge
│   │   ├── agents/
│   │   │   ├── state.py          # PatientState TypedDict
│   │   │   ├── graph.py          # LangGraph StateGraph definition + compilation
│   │   │   ├── nodes.py          # ingest_data, assess_risk, communicate, plan_discharge
│   │   │   └── prompts.py        # Prompt templates for Gemini
│   │   ├── services/
│   │   │   ├── supabase_client.py
│   │   │   └── gemini_client.py
│   │   └── models/
│   │       └── schemas.py        # Pydantic models
│   ├── requirements.txt
│   └── .env
├── seed/
│   ├── setup_db.sql              # Supabase SQL schema
│   ├── seed_margaret.py          # Seed Margaret's patient profile
│   └── seed_readings.py          # Seed 7 days of realistic readings
├── docs/                         # Reference docs (gitignored)
├── .gitignore
├── LICENSE
└── README.md
```

## SUPABASE SCHEMA

Run this in Supabase SQL Editor:

```sql
-- Enable Realtime on assessments table after creation

CREATE TABLE patients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  age INT NOT NULL,
  conditions TEXT[] DEFAULT '{}',
  medications JSONB DEFAULT '[]',
  contacts JSONB DEFAULT '[]',
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE readings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID REFERENCES patients(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('bp', 'medication', 'symptom', 'activity', 'checkin')),
  value JSONB NOT NULL,
  recorded_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE assessments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID REFERENCES patients(id) ON DELETE CASCADE,
  risk_score FLOAT NOT NULL DEFAULT 0,
  risk_narrative TEXT,
  caregiver_summary TEXT,
  clinical_alert JSONB,
  garden_state JSONB DEFAULT '{"plant_health": 0.8, "sky": "clear", "nudge": false}',
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE discharge_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID REFERENCES patients(id) ON DELETE CASCADE,
  medications JSONB,
  follow_ups JSONB,
  red_flags TEXT[] DEFAULT '{}',
  services TEXT[] DEFAULT '{}',
  created_by TEXT DEFAULT 'system',
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE caregiver_notes (
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
CREATE INDEX idx_readings_patient ON readings(patient_id, recorded_at DESC);
CREATE INDEX idx_assessments_patient ON assessments(patient_id, created_at DESC);
CREATE INDEX idx_assessments_risk ON assessments(risk_score) WHERE risk_score > 40;
```

## MARGARET'S SEED DATA

```python
# Margaret Chen — our demo patient
margaret = {
    "name": "Margaret Chen",
    "age": 74,
    "conditions": ["hypertension", "type_2_diabetes", "post_hip_replacement"],
    "medications": [
        {"name": "Lisinopril", "dosage": "10mg", "schedule": "morning", "purpose": "Blood pressure"},
        {"name": "Metformin", "dosage": "500mg", "schedule": "morning_evening", "purpose": "Diabetes"},
        {"name": "Acetaminophen", "dosage": "500mg", "schedule": "as_needed", "purpose": "Pain management"},
    ],
    "contacts": [
        {"name": "Sarah Chen", "relation": "Daughter", "phone": "+1-647-555-0123", "avatar": "butterfly_blue"},
        {"name": "Dr. Patel", "relation": "GP", "phone": "+1-416-555-0456", "avatar": "robin_red"},
        {"name": "James Chen", "relation": "Son", "phone": "+1-905-555-0789", "avatar": "butterfly_green"},
    ]
}
```

For the 7-day seed readings, generate realistic data where:
- Days 1-4: Normal readings (BP ~125/80, all meds taken, daily check-ins, normal activity)
- Day 5: BP starts rising (135/85), one missed medication
- Day 6: BP higher (142/88), missed medication again, reports mild dizziness
- Day 7 (today): BP still elevated (145/90), missed morning medication, lower activity
- This creates a natural escalation that the AI detects as a yellow/amber alert

## LANGGRAPH AGENT PIPELINE

### State Schema (backend/app/agents/state.py)
```python
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
```

### Graph Definition (backend/app/agents/graph.py)
```python
from langgraph.graph import StateGraph, END
from .nodes import ingest_data, assess_risk, communicate, plan_discharge
from .state import PatientState

workflow = StateGraph(PatientState)

workflow.add_node("ingest_data", ingest_data)
workflow.add_node("assess_risk", assess_risk)
workflow.add_node("communicate", communicate)
workflow.add_node("plan_discharge", plan_discharge)

workflow.set_entry_point("ingest_data")
workflow.add_edge("ingest_data", "assess_risk")
workflow.add_edge("assess_risk", "communicate")

workflow.add_conditional_edges(
    "communicate",
    lambda s: "plan_discharge" if s.get("discharge_flag") else END,
    {"plan_discharge": "plan_discharge", END: END}
)
workflow.add_edge("plan_discharge", END)

graph = workflow.compile()
```

### Node Logic (backend/app/agents/nodes.py)

**ingest_data**: Pure Python, no LLM. Normalise raw readings. Append to timeline. Compute 7-day and 30-day rolling averages. Tag deviations >1.5 std dev from personal baseline.

**assess_risk**: Hybrid. Deterministic scoring rules first:
- Elevated BP (>140/90) for 3+ days AND missed meds = +40 pts
- Single symptom (dizziness, chest pain, swelling) = +15 pts
- Reduced activity (<50% of 7-day avg) for 2+ days = +10 pts
- No check-in for 2+ days = +20 pts
Then Gemini 2.0 Flash generates a risk_narrative (2-3 sentences) and recommended_action.

**communicate**: Single Gemini call produces 3 outputs:
1. Caregiver summary: warm, plain language, starts with green/yellow/red emoji, no jargon
2. Clinical alert (only if risk_score > 40): structured JSON
3. Garden state: {plant_health: 0-1, sky: clear|cloudy|stormy, nudge: bool}

**plan_discharge**: Only on discharge_flag=true. Gemini generates structured recovery plan.

## FRONTEND DESIGN REQUIREMENTS

### Garden App (/garden)
- **Colour palette**: Soft greens (#E8F5E9, #A5D6A7, #66BB6A), warm sky blues (#E3F2FD, #90CAF9), warm browns (#EFEBE9) for earth
- **Layout**: Full-screen garden scene. NO menus, NO hamburger icons, NO settings.
- **Centre**: A health plant that visually reflects plant_health (0-1). Lush and blooming at 1.0, slightly wilted at 0.5, visibly droopy at 0.2. Use Framer Motion for gentle sway animation.
- **Top**: Sky gradient that shifts based on sky state. Clear = sunny gradient. Cloudy = soft grey clouds. Appointment clouds drift in with event text.
- **Bottom left/right**: Butterfly contacts. Each is a distinct coloured butterfly SVG. Tap to initiate call (show call modal). Gentle hover animation.
- **Bottom centre**: Medication reminder bar. Large pill icon + medication name + "Take Now" button. Slides up when a medication is due.
- **Gate**: A garden gate icon/illustration on the right edge. Tap to open the AI help chat panel.
- **Typography**: Minimum 18px body, 24px headers. High contrast. No grey-on-white.
- **Target device**: iPad (1024x768 minimum). Must look beautiful on tablet.

### Caregiver Dashboard (/caregiver)
- **Colour palette**: Clean whites, soft blues (#EFF6FF), warm accents. Professional but warm.
- **Hero element**: The Daily Signal card. Large, front and centre. Shows the emoji (green circle/yellow circle/red circle), the natural language summary, and a timestamp.
- **Below**: Quick actions row — "Call Mum", "Add Note", "View History"
- **History**: Simple timeline of past daily signals with date and summary. Scrollable.
- **Notes**: Simple text input to add notes visible to the GP.
- **Responsive**: Must look good on mobile (375px) and desktop (1440px).

### Clinical Dashboard (/clinical)
- **Colour palette**: Professional healthcare — whites, slate greys (#F8FAFC, #64748B), teal accents (#0D9488) for alerts.
- **Layout**: Sidebar patient list + main content area.
- **Patient list**: Each patient shows name, age, current risk score as a coloured badge (green <30, yellow 30-60, red >60).
- **Patient detail**: Click a patient to see their full profile — timeline chart (Recharts), recent readings table, AI risk narrative, caregiver notes.
- **Alert banner**: When risk_score > 40, show a prominent alert banner at the top with the clinical_alert content and recommended action.
- **Desktop only**: Minimum 1024px width.

## BUILD PHASES

Execute these in order. Do not skip ahead. Each phase must be working before starting the next.

### PHASE 1: Foundation (Target: first 2 hours)
1. Set up the Next.js frontend with App Router, TypeScript, Tailwind, Framer Motion
2. Set up the FastAPI backend with CORS, health check endpoint
3. Create the Supabase client libraries (frontend + backend)
4. Create shared types (TypeScript types that mirror Pydantic schemas)
5. Create the seed scripts (Margaret + 7 days of readings)
6. Write the SQL schema file
7. Create a landing page at / that links to /garden, /caregiver, /clinical
8. Verify: Frontend runs on localhost:3000, backend on localhost:8000, seed data loads into Supabase

### PHASE 2: Backend + AI Pipeline (Target: next 4 hours)
1. Build all Pydantic models (schemas.py)
2. Build the Supabase service layer (CRUD operations)
3. Build the LangGraph state, nodes, and graph
4. Build the Gemini client wrapper
5. Build the prompt templates
6. Build all FastAPI routes:
   - POST /api/readings (accepts a reading, triggers LangGraph pipeline, stores assessment)
   - GET /api/patients/{id}/summary (returns latest caregiver summary)
   - GET /api/patients/{id}/history (returns last N assessments)
   - GET /api/patients/{id}/profile (returns patient + recent readings + latest assessment)
   - GET /api/alerts (returns all assessments where risk_score > 40)
   - POST /api/patients/{id}/discharge (triggers discharge planning agent)
   - GET /api/patients (returns all patients with latest risk scores)
   - POST /api/patients/{id}/notes (creates a caregiver note)
7. Test the full pipeline: POST a reading → LangGraph runs → assessment stored → verify caregiver_summary and clinical_alert are generated correctly
8. Verify: Every endpoint returns correct data. The AI pipeline processes a reading end-to-end in <5 seconds.

### PHASE 3: Garden App Frontend (Target: next 3 hours)
1. Build the garden scene layout (full screen, no scroll)
2. Build the HealthPlant component with Framer Motion animation (sway, bloom/wilt states)
3. Build the Sky component (gradient + appointment clouds)
4. Build the ButterflyContact components (3 contacts, tap-to-call modal)
5. Build the MedicationReminder bar (slides up, tap to acknowledge, POST to /api/readings)
6. Build the BP entry flow (large buttons, minimal steps, POST to /api/readings)
7. Build the GardenGate AI help panel (simple chat interface)
8. Connect to Supabase Realtime: subscribe to assessments table, update garden_state visuals live
9. Verify: The garden is beautiful on iPad dimensions. Tapping a butterfly shows a call screen. Logging BP triggers the AI pipeline and the plant/sky update.

### PHASE 4: Caregiver Dashboard Frontend (Target: next 2 hours)
1. Build the DailySignal hero card (emoji + summary + timestamp)
2. Build the quick actions row (Call, Add Note, View History)
3. Build the HistoryView (timeline of past signals)
4. Build the CaregiverNotes input (POST to /api/patients/{id}/notes)
5. Connect to Supabase Realtime: subscribe to assessments, update DailySignal live
6. Verify: When a reading is logged in the garden app, the caregiver dashboard updates within 2-3 seconds.

### PHASE 5: Clinical Dashboard Frontend (Target: next 2 hours)
1. Build the sidebar PatientList with risk score badges
2. Build the PatientProfile detail view (timeline chart with Recharts, readings table)
3. Build the AlertCard component (prominent banner for high-risk patients)
4. Build the RiskTimeline chart (Recharts line chart showing risk_score over 7 days)
5. Build the caregiver notes display (read-only, chronological)
6. Connect to Supabase Realtime: subscribe to assessments WHERE risk_score > 40
7. Verify: Clicking Margaret shows her full profile. The alert banner appears when risk_score > 40. The timeline chart renders correctly.

### PHASE 6: Integration + Polish (Target: remaining hours)
1. End-to-end test: Log a reading in garden → AI processes → caregiver sees update → clinician sees alert. All within 5 seconds.
2. Polish garden animations (smooth transitions, no jank)
3. Polish responsive design on caregiver dashboard (test at 375px and 1440px)
4. Add loading states and error handling everywhere
5. Add fallback/hardcoded responses if Gemini API is slow or fails during demo
6. Deploy frontend to Vercel, backend to Railway
7. Test deployed version end-to-end
8. Final visual QA on all three interfaces

## IMPORTANT RULES

1. **Do NOT build auth**. Hardcode Margaret as the demo patient. Skip login entirely.
2. **Do NOT build onboarding**. The app starts with Margaret already enrolled.
3. **Do NOT over-engineer the AI**. The assess_risk node should use simple deterministic rules + one Gemini call. Not a complex ML model.
4. **Do NOT use localStorage or sessionStorage in any frontend code**. Use React state and Supabase.
5. **Always use TypeScript** in the frontend. No `any` types.
6. **Always use Pydantic v2** models in the backend.
7. **Garden app must feel magical**, not clinical. No health app aesthetics. Think Studio Ghibli meets wellness.
8. **Caregiver dashboard must feel warm**, not corporate. Think sending a reassuring text to a worried daughter.
9. **Clinical dashboard must feel professional** and efficient. Think clean healthcare SaaS.
10. **Every component must have a loading state** and handle the case where data is not yet available.
11. **Use Canadian spelling** in all user-facing text.
12. **Commit frequently** with clear messages. The judges may review our GitHub.

## START NOW

Begin with Phase 1. Create the complete project structure, install all dependencies, set up the Supabase clients, create the seed scripts, and get both servers running. Report back when Phase 1 is complete and working before moving to Phase 2.
