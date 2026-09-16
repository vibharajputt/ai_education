# AGENTS.md

## Project

This is a hackathon MVP: an AI-augmented education platform targeting two
audiences — School students (Class 9–12) and College students — across
**21 modules** delivered as a single web application. The 21 modules span
both tracks and cover: Adaptive Question Bank, Concept Maps, Formula
Mnemonics, Viva Practice, Past Paper Analyzer, Weak-Topic Detector,
Study Planner, Flashcard Deck, Diagram Labeler, Exam Countdown, Chapter
Summaries, Interview Q&A Prep, Resume Analyzer, Mock Interview Coach,
Career Path Explorer, College Compare, Entrance Exam Tracker, Scholarship
Finder, Aptitude Drill, Group Study Coordinator, and Progress Report
Dashboard. The team is 4 engineers with a hard 7-day deadline. The
optimization target is **breadth with zero broken surfaces**: every module
must be functional and visually complete at ship time. Maintainability and
abstraction purity are explicitly secondary to speed of module delivery.

---

## Architecture

Single **Vite + React 18 + TypeScript + Tailwind CSS** application.
No monorepo. No microservices. No database in the MVP.

```
/
├── src/
│   ├── app/          # Shell: router, global layout, theme, providers
│   ├── modules/      # One folder per module; each exports a ModuleConfig
│   ├── core/         # Content model, data loaders, AI client, shared hooks
│   └── components/   # Shared UI primitives (Button, Card, Badge, …)
├── content/          # Generated JSON consumed by the app (committed to repo)
├── tools/            # Node scripts that GENERATE content/ — run offline only
├── server/           # Minimal Express API: exactly 2 live AI routes + upload
├── public/
├── .env.example
├── .gitignore
└── AGENTS.md
```

**State**: `localStorage` only. No server-side session. No Redux.  
**Routing**: React Router v6. Each module is a lazy-loaded route under
`/school/:moduleSlug` or `/college/:moduleSlug`.  
**Theming**: Single Tailwind config. Two CSS custom-property sets (school /
college) toggled by a class on `<html>`. No separate CSS files except
`src/app/theme.css` for the two root variable blocks.

---

## The Content Model (non-negotiable)

Every piece of data in this application is expressed as exactly one of four
types, defined once in `src/core/types.ts`. **No module may define its own
top-level content type.** If a module appears to need one, stop and ask.

```ts
// src/core/types.ts  (authoritative — do not duplicate elsewhere)

type ContentKind =
  | 'question'
  | 'concept'
  | 'mnemonic'
  | 'viva'
  | 'interview-q'
  | 'tip';

interface ContentItem {
  id: string;
  kind: ContentKind;
  subject?: string;
  chapter?: string;
  difficulty?: 'easy' | 'medium' | 'hard';
  tags: string[];
  body: string;          // question text, concept body, mnemonic hook, etc.
  metadata: Record<string, unknown>;  // kind-specific fields go here
}

interface Collection {
  id: string;
  label: string;
  description: string;
  scope: string;         // e.g. "40 questions across 6 chapters" — REQUIRED
  items: ContentItem[];
  filters?: Record<string, string[]>;
}

interface Explanation {
  itemId: string;        // FK → ContentItem.id
  type: 'solution' | 'answer-framing' | 'step-breakdown';
  steps: Array<{ label: string; body: string }>;
  summary: string;
}

interface Activity {
  id: string;
  type: 'quiz' | 'viewer' | 'analyzer' | 'planner';
  moduleSlug: string;
  config: Record<string, unknown>;   // activity-specific, validated at runtime
  items: ContentItem[];
}
```

A `ModuleConfig` (exported by every module) is:

```ts
interface ModuleConfig {
  slug: string;
  title: string;
  track: 'school' | 'college' | 'both';
  description: string;
  scope: string;          // shown in module header — must be specific
  route: string;
  icon: string;           // lucide-react icon name
  component: React.LazyExoticComponent<React.FC>;
  dataFiles: string[];    // paths under content/ this module reads
}
```

---

## The Five AI Templates (non-negotiable)

All AI calls — both offline (tools/) and live (server/) — use one of exactly
five prompt templates. Templates live in `tools/prompts/`. No module and no
server route writes its own prompt string inline.

| Template            | Used for                                                    |
|---------------------|-------------------------------------------------------------|
| `explain`           | Step-by-step solution / concept walkthrough                 |
| `generate_set`      | Batch creation of ContentItems (questions, mnemonics, etc.) |
| `analyze_artifact`  | Resume, answer sheet, or diagram critique                   |
| `plan`              | Study schedule, career path, weekly plan                    |
| `profile_summary`   | Aggregated weak-topic / progress narrative                  |

Template files are `.md` with `{{mustache}}` placeholders. The AI client
(`src/core/aiClient.ts`) fills placeholders; it never constructs prompts
from scratch.

---

## Pre-computation Rule

**All AI-generated content is produced offline by scripts in `tools/` and
committed as JSON under `content/`.** The app reads this static JSON through
`src/core/loaders`; it never calls an AI API directly from a component.

**EXACTLY TWO live AI paths exist:**

1. **Per-solution assistant** — `POST /api/explain` — user taps "Explain
   this" on a ContentItem; server calls AI with the `explain` template and
   streams the response.
2. **Resume analyzer** — `POST /api/analyze-resume` — user uploads a PDF;
   server extracts text, calls AI with the `analyze_artifact` template,
   returns structured feedback.

Any other live AI call is a **bug**. If you believe a feature requires a
third live path, stop and ask.

---

## Non-negotiable Rules

- **TypeScript strict mode.** `"strict": true` in `tsconfig.json`. `any` is
  allowed only with an inline comment explaining why.
- **Responsive.** Every module must render correctly and be fully usable at
  viewport widths: **360 px, 768 px, and 1440 px**. Test before marking done.
- **Three states required.** Every module must implement a **loading state**,
  an **empty state**, and an **error state**. Use the shared
  `<StateShell>` component from `src/components/`.
- **No dead UI.** Every button, link, and interactive element must be
  functional at the time it is committed. No "coming soon" text. No
  placeholder handlers. If a feature is not ready, remove it from the render.
- **Explicit scope.** Every module's header must display its scope string
  (from `ModuleConfig.scope`) so users know what they are looking at, e.g.
  *"120 MCQs across Physics, Chemistry, Math — Class 11"*.
- **No secrets in client code.** API keys, model identifiers, and
  environment variables live only in `server/.env`. The Vite app may only
  read `VITE_API_BASE_URL`.

---

## Conventions

- **Named exports only.** No default exports from modules or components.
- **Functional components only.** No class components.
- **Tailwind only** for styling. The only permitted CSS file is
  `src/app/theme.css`.
- **Data access via loaders.** Components never `import`/`fetch` content JSON
  directly. All data goes through `src/core/loaders`, which return typed
  objects and handle caching.
- **One folder per module.** `src/modules/<slug>/` contains `index.tsx`
  (the component), `config.ts` (the `ModuleConfig`), and any module-local
  sub-components. Nothing else.
- **Barrel files.** Each top-level `src/` folder has an `index.ts` that
  re-exports its public surface. Consumers import from the barrel, not from
  deep paths.

---

## Interaction Rules (for AI agents and team members)

- **Stop on ambiguity.** If a requirement is unclear, ask before writing code.
  Do not make assumptions about content, UX, or data shape.
- **Report, don't fix.** If you notice a bug outside the current task scope,
  report it in a comment or ticket and continue your current task.
- **Sub-tasks ≤ 1 hour.** When planning work, break tasks so that each
  sub-task can be completed in one hour or less. If a sub-task looks larger,
  split it further before starting.
- **Module-done checklist.** A module is not done until: (a) it renders all
  three states, (b) it passes the three viewport checks, (c) its scope string
  is visible, (d) every button works, (e) it reads data only through loaders.
