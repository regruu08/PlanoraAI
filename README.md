# Planora AI

Describe your event. Planora plans what happens next.

An event planning workspace for weddings, birthdays, and community celebrations. Built for PromptWars Challenge 5 with Next.js, TypeScript, Tailwind CSS, Zod, and Lucide.

## Current experience

- Responsive landing page, dashboard, event creation, and authentication screens.
- Event workspaces with budgets, timeline tasks, vendors and checklists, personalized ideas, and a planning copilot.
- Searchable event cards and next actions derived from pending tasks.
- Editable actual spending, task completion, vendor status, checklists, and saved ideas.
- Demo planning without external credentials, with browser-local persistence.
- Plan refresh preserves existing financial records, task progress, vendor progress, and saved ideas.
- Keyboard focus indicators, labeled inputs, mobile navigation, error/empty states, and reduced-motion support.

## Run locally

```sh
npm install
npm run dev
```

Open http://localhost:3000. No service credentials are needed for the demo. Use the sample buttons in the event creation form or explore the prepared demo events.

## Environment

Copy `.env.example` to `.env.local`. Keep real credentials out of version control. Gemini requests are made in server route handlers. Public Supabase credentials are the only service values intended for the browser.

The current Supabase/Gemini paths are scaffolding, not a production-complete integration. The demo stores data per browser, not per authenticated account. Do not connect a public production database before completing ownership enforcement, secure RLS, database reads/deletes, session protection, and sync/error handling. The Gemini SDK/model configuration also needs updating before enabling live AI.

## Verification

```sh
npm test
npm run lint
npx tsc --noEmit --incremental false
npm run build
```

The test runner loads the real application modules without emitting files or using service credentials. It covers input validation, budgets for all three event types, short-notice timelines, invalid blueprint output, task ordering, local persistence, safe plan refresh, deletion, generation requests, and copilot requests.

Browser checks cover desktop/mobile layouts, sample autofill and event creation, task completion, persisted spending, vendor status/checklists, saved ideas, and contextual demo chat. Live provider failures, real authentication, RLS enforcement, and production deployment need separate verification once the integrations are finished.

## Architecture

Next.js UI → route handlers → server planning functions → validated blueprint → browser storage → event workspace.

Budget arithmetic, task ordering, validation, and date comparisons run in normal application code. When no Gemini key is present, the app uses a deterministic event-specific demo planner; it is not a live AI response. Supabase helpers and SQL are included for later integration.

## Production builds during development

`PLANORA_BUILD_DIR` can select a separate generated directory, for example `.next-production`, while a development preview uses another directory. With no override, Next.js uses `.next` normally.

## Future work

Finish secure authentication and database ownership/persistence, migrate the Gemini client/model, add provider timeouts and explicit fallback reporting, then verify the deployed end-to-end flow with real accounts.
