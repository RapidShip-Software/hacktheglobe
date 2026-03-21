# Canopy - Continuous Remote Care Platform

> Hack the Globe 2026 | Health & Humanity | Global Spark | BCG Toronto | March 21-22, 2026

**Canopy** is a continuous remote care platform that keeps elderly patients healthy at home, gives their families peace of mind, and gives healthcare systems early warning intelligence before a crisis hits.

## The Problem

Between a 75-year-old living at home and the hospital that treats them, there is a void. No monitoring, no continuity, no early intervention.

- 1 in 5 elderly patients is readmitted within 30 days
- Each readmission costs ~$16,000 (annual cost: $26B+ in the US)
- 40% of seniors lack the digital literacy for current RPM tools
- 53M unpaid family caregivers in the US, with zero visibility into their loved one's health

## The Solution

Three interconnected layers, one platform:

| Layer | For | What It Does |
|-------|-----|-------------|
| **The Garden** (Patient App) | Elderly patient (iPad) | Daily check-ins via a living garden metaphor. Zero digital literacy required. |
| **Peace of Mind Dashboard** | Family caregiver (web/mobile) | Single daily green/yellow/red signal with natural language summary. |
| **Clinical Intelligence** | GP / care coordinator | AI risk stratification with multi-signal pattern detection and actionable alerts. |

## Tech Stack

| Layer | Technology | Why |
|-------|-----------|-----|
| Frontend | Next.js 14 (App Router), Tailwind CSS, Framer Motion | React-based, fast prototyping, SSR |
| Backend API | FastAPI (Python) | Async, lightweight, native Python for LangGraph |
| Multi-Agent AI | LangGraph + Gemini 2.0 Flash | Stateful agent orchestration with fast inference |
| Database | Supabase (PostgreSQL + Auth + Realtime) | Real-time subscriptions, RLS, free tier |
| Deploy (FE) | Vercel | Zero-config Next.js deployment |
| Deploy (BE) | Railway or Render | One-click Python deploy |

## Architecture

```
[Patient iPad]          [Caregiver Phone]       [Clinician Desktop]
     |                        |                        |
     | POST /api/readings     | GET /api/summary       | GET /api/alerts
     v                        v                        v
+------------------------------------------------------------------+
|                   FastAPI Backend (Python)                        |
|                                                                  |
|   [ingest_data] -> [assess_risk] -> [communicate] -> [END]      |
|                                                                  |
|   Results written to Supabase --> Realtime broadcast             |
+------------------------------------------------------------------+
          |                        |
          v                        v
  [Supabase PostgreSQL]    [Gemini 2.0 Flash API]
```

## Project Structure

```
hacktheglobe/
├── frontend/                   # Next.js (all 3 interfaces)
│   ├── app/
│   │   ├── garden/             # Patient garden app routes
│   │   ├── caregiver/          # Caregiver dashboard routes
│   │   ├── clinical/           # Clinical dashboard routes
│   │   ├── api/                # Next.js API routes (proxy to FastAPI)
│   │   └── layout.tsx
│   ├── components/
│   │   ├── garden/             # HealthPlant, Sky, Butterfly, Gate
│   │   ├── caregiver/          # DailySignal, WeeklyDigest, Notes
│   │   ├── clinical/           # PatientList, AlertCard, RiskChart
│   │   └── shared/             # Button, Card, StatusBadge
│   ├── lib/
│   │   ├── supabase.ts         # Supabase client + Realtime helpers
│   │   └── api.ts              # FastAPI client wrapper
│   └── package.json
├── backend/                    # FastAPI + LangGraph
│   ├── app/
│   │   ├── main.py             # FastAPI app + CORS + routes
│   │   ├── routers/            # readings, patients, alerts
│   │   ├── agents/             # LangGraph graph, nodes, prompts, state
│   │   ├── services/           # supabase, gemini clients
│   │   └── models/             # Pydantic schemas
│   └── requirements.txt
├── seed/                       # Demo data scripts
│   ├── margaret.py             # Seed Margaret's patient profile
│   └── readings_7day.py        # Seed 7 days of realistic readings
├── .gitignore
├── LICENSE
└── README.md
```

## Getting Started

### Prerequisites

- Node.js 18+
- Python 3.11+
- A [Supabase](https://supabase.com) project (free tier)
- A [Google AI Studio](https://aistudio.google.com) API key (Gemini 2.0 Flash)

### Backend Setup

```bash
cd backend
python -m venv .venv
source .venv/bin/activate  # or .venv\Scripts\activate on Windows
pip install -r requirements.txt
cp .env.example .env       # Fill in your keys
uvicorn app.main:app --reload --port 8000
```

### Frontend Setup

```bash
cd frontend
npm install
cp .env.example .env.local  # Fill in your keys
npm run dev
```

### Environment Variables

**Backend** (`.env`):
```
SUPABASE_URL=https://xxxx.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
GOOGLE_API_KEY=your-gemini-key
GEMINI_MODEL=gemini-2.0-flash
CORS_ORIGINS=http://localhost:3000
```

**Frontend** (`.env.local`):
```
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_DEMO_PATIENT_ID=margaret-chen-uuid
```

> Never commit `.env` files. Copy the `.env.example` templates and fill in your own keys.

### Seed Demo Data

```bash
cd seed
python margaret.py
python readings_7day.py
```

## Multi-Agent AI Pipeline (LangGraph)

Four-node `StateGraph` processing patient health data:

1. **Ingest Data** - Normalise readings, update timeline, compute rolling baselines (pure Python, no LLM)
2. **Assess Risk** - Deterministic rules engine + Gemini narrative, produces risk score 0-100
3. **Communicate** - Single LLM call generates caregiver summary, clinical alert, and garden visual state
4. **Plan Discharge** - Conditional node, generates structured recovery plan at discharge

## SDG Alignment

- **SDG 3.4**: Reduce premature mortality from NCDs through prevention
- **SDG 3.8**: Achieve universal health coverage, extending care into homes
- **SDG 10**: Reduced inequalities, addressing digital literacy barriers for elderly

## Team

| Role | Member |
|------|--------|
| Innovation Engineer | Marco Anthony Ayuste |
| Innovation Engineer | Aahir Chakraborty-Saha |
| Innovation Analyst + Product Manager | Christie Ko |
| Business Strategist | Rojella Santos |

## License

[MIT](LICENSE) - RapidShip Software, 2026
