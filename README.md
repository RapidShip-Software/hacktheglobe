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

Three interconnected layers, one platform, each with its own immersive 3D island experience:

| Layer | For | What It Does |
|-------|-----|-------------|
| **The Garden** (Patient App) | Elderly patient (iPad) | Daily check-ins via a living garden metaphor. Health-reactive 3D scene with flowers, animals, and weather. Tap the flower to talk to an AI assistant with voice. Zero digital literacy required. |
| **The Nest** (Family Dashboard) | Family caregiver (web/mobile) | Single daily green/yellow/red signal with natural language summary. 3D island with a nest in a tree, cat, lighthouse, and nature. |
| **The Clinic** (Healthcare Intelligence) | GP / care coordinator | AI risk stratification, patient timelines, real-time monitoring, and discharge planning. Cozy 3D clinic interior with glassmorphism dashboard. |

### Live Demo

**[hacktheglobe.vercel.app](https://hacktheglobe.vercel.app)**

Demo accounts (login page):
- **Margaret Santos** (Patient): `margaret@canopy.care` / `garden123`
- **Sarah Santos** (Family): `sarah@canopy.care` / `nest123`

## Tech Stack

| Layer | Technology | Why |
|-------|-----------|-----|
| Frontend | Next.js 15 (App Router), Tailwind CSS, Framer Motion, Three.js | React-based, fast prototyping, SSR, immersive 3D |
| Backend API | FastAPI (Python) | Async, lightweight, native Python for LangGraph |
| AI Chat | Groq (Llama 3.3 70B) + Web Speech API (TTS/STT) | Fast chatbot with voice input/output for elderly users |
| Multi-Agent AI | LangGraph + Gemini 2.0 Flash | Stateful agent orchestration with fast inference |
| Database | Supabase (PostgreSQL + Auth + Realtime) | Real-time subscriptions, RLS, free tier |
| Deploy (FE) | Vercel | Zero-config Next.js deployment |
| Deploy (BE) | Railway | One-click Python deploy |

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
│   │   ├── login/              # Login page with demo accounts
│   │   ├── garden/             # Patient garden app
│   │   ├── caregiver/          # Family dashboard (The Nest)
│   │   ├── clinical/           # Clinic dashboard
│   │   ├── api/chat/           # Groq chatbot API route
│   │   └── layout.tsx
│   ├── components/
│   │   ├── garden/             # GardenScene3D, Butterfly, GardenGate (AI chat)
│   │   ├── nest/               # NestScene3D (tree, nest, cat, lighthouse)
│   │   ├── landing/            # LandingScene3D (3-island scene, ships, fish, planes)
│   │   ├── caregiver/          # DailySignal, HistoryView, Notes
│   │   ├── clinical/           # ClinicalScene3D, PatientList, AlertCard, RiskTimeline
│   │   └── shared/             # BlurFade, ErrorBoundary, TimeToggle
│   ├── middleware.ts           # Auth redirect (cookie-based session)
│   ├── lib/
│   │   ├── supabase.ts         # Supabase client + Realtime helpers
│   │   └── api.ts              # FastAPI client wrapper
│   └── package.json
├── backend/                    # FastAPI + LangGraph
│   ├── app/
│   │   ├── main.py             # FastAPI app + CORS + routes
│   │   ├── routers/            # readings, patients, alerts, chat
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
NEXT_PUBLIC_DEMO_PATIENT_ID=margaret-santos-uuid
```

> Never commit `.env` files. Copy the `.env.example` templates and fill in your own keys.

### Seed Demo Data

```bash
cd seed
python margaret.py
python readings_7day.py
```

## 3D Visual Experience

All interfaces feature immersive Three.js 3D scenes with cel-shaded (black outline) art style:

- **Login Page** - Full 3D scene with orbiting islands behind a glassmorphism login card
- **Landing Page** - Three islands on a cel-shaded ocean: garden (flowers, animals, deer, rabbits), nest (tree with nest, cat, matcha cup, lighthouse), and clinic (hospital with chimney smoke, fountain, people). Sailing ships, underwater fish, and airplanes. Sun with rays orbits the scene. Day/sunset/night mode toggle.
- **The Garden** - Health-reactive scene. Sky changes with health (clear/cloudy/stormy). Central flower opens AI chat with voice (TTS/STT). Bloom breakdown shows what tasks help the flower grow. Health simulation slider for demo.
- **The Nest** - Island with a large tree, nest with eggs on a branch, grey cat with swaying tail, matcha cup with steam, perched birds, lighthouse. Camera slowly orbits.
- **The Clinic** - Cozy interior (wood floor, cream walls, glowing windows with light shafts, reception desk, waiting chairs, pendant lamps, potted plants). Glassmorphism dashboard overlay.
- **Fly-To Transitions** - All cards trigger cinematic camera fly-to animations toward their island. Back buttons on each page trigger reverse fly-back to orbit. Day/sunset/night mode on all pages.

## Key Features

- **Voice-First AI Chat** - Tap the flower in the garden to talk. Speech-to-text input, text-to-speech output with warm female voice (Microsoft Jenny/Samantha). 300+ fallback responses covering 80+ intent categories.
- **Real-Time Monitoring** - Supabase Realtime broadcasts assessment updates. Caregiver and clinical dashboards update live.
- **Health Simulation** - Interactive slider in the garden page for demo: drag to see the plant wilt/grow/bloom in real time.
- **Discharge Planning** - AI-generated structured recovery plans with medications, follow-ups, red flags, and community services.
- **Accessible Design** - Solid high-contrast backgrounds, opaque typography, large touch targets. Designed for elderly users with reduced contrast sensitivity.

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
