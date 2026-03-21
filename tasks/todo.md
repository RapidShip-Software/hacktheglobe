# Frontend Aesthetic Upgrade Plan (Phase 1+ Themes)

## Goal
Upgrade the Hack the Globe 2026 Canopy platform's frontend to be significantly more aesthetic, dynamic, and premium using modern React UI libraries (Magic UI, Aceternity UI, Framer Motion) while adhering to the 22-hour hackathon constraints.

## Tech Stack Additions
- **Magic UI**: For polished, motion-rich components (animated text, shiny borders, bento grids).
- **Aceternity UI**: For advanced visual flair (aurora backgrounds, complex text reveals).
- **Framer Motion**: For fluid animations (plant swaying, page transitions).
- **Lucide React**: (Already in stack) for icons.
- **Tailwind CSS**: (Already in stack) for styling.

## Interface Upgrades

### 1. Garden App (Patient-Facing iPad Web App)
- **Vibe**: Studio Ghibli meets wellness. Magical, serene, zero digital literacy needed.
- **Background**: Use Aceternity UI `AuroraBackground` or a custom Framer Motion smooth animated SVG gradient that shifts based on the "sky state" (clear, cloudy, stormy).
- **Health Plant (Center)**: Use Framer Motion for a smooth SVG morphing/swaying effect. The plant breathes and sways gently, changing color/droopiness based on `plant_health` (0-1).
- **Interactions**: Use Magic UI floating/animated elements. Tapping butterflies triggers a smooth Framer Motion `LayoutGroup` expansion for the call modal.
- **Typography**: Large, soft sans-serif (e.g., Outfit font). Use Magic UI `BlurFade` or `WordPullUp` to introduce text softly.

### 2. Caregiver Dashboard (Family-Facing Responsive Web App)
- **Vibe**: Warm, reassuring, clean. Glassmorphism hints.
- **Hero Card (Daily Signal)**: Wrap it in a Magic UI `ShineBorder` or `BorderBeam` to give it a premium, focused feel without being alarming.
- **Layout**: Use Aceternity UI `BentoGrid` for the quick actions and history sections.
- **History Timeline**: Implement a scroll-triggered Framer Motion reveal for past signals.
- **Typography**: Inter font with smooth weights.

### 3. Clinical Dashboard (Clinician-Facing Desktop Web App)
- **Vibe**: Professional, efficient, high-tech healthcare SaaS.
- **Data Viz**: Integrate Recharts with Aceternity UI `HoverEffect` to make charts interactive and sleek.
- **Alert Banner**: When `risk_score > 40`, use a Magic UI `AnimatedGradientText` or a pulsing border to draw attention without being overwhelming.
- **Patient List**: Use Magic UI `FlickeringGrid` subtle background for the sidebar to give a "tech" feel.

## Prompt for Claude Opus 4.6
A detailed prompt has been generated in `CLAUDE_FRONTEND_PLAN.md` which specifies exactly how Claude Opus 4.6 should execute these upgrades while staying true to the `CLAUDE_CODE_MASTER_PROMPT.md` constraints.
