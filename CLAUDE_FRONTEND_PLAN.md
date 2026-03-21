# MASTER PROMPT ADDENDUM: FRONTEND AESTHETIC UPGRADES
## Target: Claude Opus 4.6 (Phase 1 & Themes)

You are tasked with executing the frontend development (Phases 3, 4, and 5) from the `CLAUDE_CODE_MASTER_PROMPT.md`, but with a **massive upgrade in aesthetics and motion design**. The goal is to create a "wow" factor that looks premium and wins the Hack the Globe 2026 hackathon.

**CRITICAL INSTRUCTION:** Do not break the existing constraints (Speed, No Auth, Supabase Realtime, single demo story). Integrate the following libraries to elevate the UI:
1. **Framer Motion** (Fluid layout animations, presence, page transitions)
2. **Magic UI** (Polished micro-interactions, shiny borders, text effects)
3. **Aceternity UI** (Bento grids, aurora backgrounds, complex interactive elements)

## 1. Garden App (/garden) Upgrades
- **Atmosphere**: Implement an Aceternity UI `AuroraBackground` that transitions between bright skies and dark/stormy skies smoothly based on `garden_state.sky`.
- **The Plant**: The `HealthPlant` component must not be static. Use Framer Motion to create a continuous, gentle "breathing" and swaying animation. When `plant_health` changes, the transformation (e.g., from lush to wilted) must be a smooth `spring` animation.
- **Butterflies**: Use Framer Motion for flying/hovering loops. When clicked, use Framer's `layoutId` to smoothly expand the butterfly into the Call Modal.
- **Medication Bar**: Use Magic UI `BlurFade` or a Framer slide-up. Make the "Take Now" button premium with an Aceternity UI hover effect or Magic UI `ShimmerButton`.
- **Text**: Use Magic UI's `WordPullUp` or `TextReveal` for the AI nudges to make them feel magical.

## 2. Caregiver Dashboard (/caregiver) Upgrades
- **Layout**: Use an Aceternity UI `BentoGrid` or a similar premium card layout for the dashboard to make it look like a top-tier SaaS product.
- **Daily Signal Hero Card**: Wrap the main status card in a Magic UI `ShineBorder` or `BorderBeam` to make it pop.
- **Vibe**: Use soft glassmorphism (Tailwind `backdrop-blur-md bg-white/30`) over a very subtle, warm gradient background.
- **History View**: Use Framer Motion `staggerChildren` to elegantly animate the timeline items in when scrolling or loading.

## 3. Clinical Dashboard (/clinical) Upgrades
- **Vibe**: High-tech, clean, professional. 
- **Sidebar**: Give the sidebar a very subtle Magic UI `RetroGrid` or `DotPattern` background to differentiate it.
- **Alerts**: For high-risk patients (`risk_score > 40`), use a pulsing Magic UI `AnimatedGradientText` or a subtle red `BorderBeam` to draw the clinician's eye immediately.
- **Charts & Tables**: Wrap Recharts within Aceternity UI's `HoverEffect` or sleek glass cards. Ensure tooltips have Framer Motion fade-ins.

## Execution Steps for Claude
1. **Initialize Libraries**: Install `framer-motion`, `clsx`, `tailwind-merge`, and required dependencies for Aceternity/Magic UI (check their docs if needed or use standard Tailwind utility setups).
2. **Setup Global Styles**: Define modern fonts (e.g., Outfit for Garden, Inter for Clinical) and global Tailwind animations in `tailwind.config.ts`.
3. **Build Garden**: Focus heavy on the Framer Motion plant and Aurora background. It MUST look magical on an iPad resolution.
4. **Build Caregiver**: Focus on the glassmorphic Bento grid layout and the shiny Daily Signal card.
5. **Build Clinical**: Focus on crisp data presentation and attention-grabbing, yet professional, alert animations.

*Proceed with Phase 1 frontend scaffolding using these elevated design constraints.*
