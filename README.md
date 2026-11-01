# Planora AI

Describe your event. Planora plans what happens next.

An intelligent, context-aware celebration planning workspace for weddings, birthdays, and community events. Built for PromptWars Challenge 5 with Next.js 15, TypeScript, Tailwind CSS, Zod, and Lucide.

## Core Capabilities & Innovations

- **Multi-Phase Agent Reasoning & Critique Loop**:
  - Implements a Planner-Evaluator architectural pattern (`lib/ai/critique.ts`).
  - Audits generated blueprints across 5 vectors: context feasibility, budget solvency, timeline density, vendor completeness, and executive actionability.
  - Automatically self-corrects deficits (e.g. enforcing a 6%+ contingency reserve and clamping out-of-bound milestones).
  - Emits scannable **Agent Reasoning & Critique Traces** viewable directly in the workspace.
- **Event Readiness & Health Score (0–100 Gauge)**:
  - Composite mathematical health score evaluating 4 distinct pillars (25 pts each):
    1. *Budget Health* (solvency, contingency buffer, actual expense discipline)
    2. *Timeline Velocity* (milestone completion percentage, zero overdue critical tasks)
    3. *Vendor Security* (core vendor confirmation, quote logging coverage)
    4. *Checklist Compliance* (verification checklist item completion)
  - **Smart Operational Risk Detector**: Active alerts for unconfirmed venues within 60 days, low contingency reserves, budget overruns, and overdue milestones with instant action links.
- **Interactive What-If Scenario Simulator**:
  - Dynamic sensitivity analysis testing guest count adjustments (-50% to +100%) and budget shifts (-30% to +50%).
  - Real-time recalculation of Cost per Guest, Catering Cost per Plate, and venue capacity warning thresholds.
  - One-click "Apply Scenario to Plan" button to persist the rebalanced allocations to local storage and database.
- **Calendar & Spreadsheet Export Suite**:
  - **Calendar (.ics)**: RFC 5545 compliant iCalendar export with automated 1-day reminder alarms for Apple Calendar, Google Calendar, and Outlook.
  - **Budget Spreadsheet (.csv)**: Itemized exports with allocated funds, actual expenses, variance calculations, and category priority summaries.
- **Vendor Verification & Interactive Quote Logger**:
  - Searchable vendor directory with status filters (`Needed`, `Contacted`, `Quote Received`, `Confirmed`).
  - Inline quote logger tracking estimate-versus-actual variance in real time.
- **AI Planning Copilot**:
  - Context-grounded assistant aware of live budget allocations, pending critical milestones, and vendor checklists.
  - Supports English and natural conversational Hinglish.
  - Expandable Agent Reasoning Trace showing live grounded metrics.

## Run Locally

```sh
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). No service credentials are required for the local demo. Sample pre-built events are available for weddings, birthdays, and community gatherings.

## Environment Configuration

Copy `.env.example` to `.env.local`:

```env
GEMINI_API_KEY=your_key_here
GEMINI_MODEL=gemini-3.5-flash
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
```

When no API key is provided, Planora uses its deterministic offline procedural rules engine with full reasoning traces and mathematical validation.

## Automated Verification

```sh
npm test
npm run lint
npx tsc --noEmit
npm run build
```

- **Unit & Integration Suite**: 63 automated tests verifying input schemas, budget solvency, reverse timeline clamping, offline fallbacks, storage persistence, calendar `.ics` structure, `.csv` variance calculations, readiness scoring, what-if rebalancing, and agent critique loops.
- **TypeScript**: Strict type checking with 0 compiler diagnostics.
- **Linting**: ESLint with 0 errors and 0 warnings.
- **Production Build**: Next.js 15.5 production compilation with static prerendering across all 8 routes.
