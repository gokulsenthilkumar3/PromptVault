# PromptVault — Product Requirements Document (PRD)

## 1. Overview

**Product Name:** PromptVault  
**Tagline:** Git for your prompts.  
**Type:** Full-Stack SaaS Web Application  
**Stack:** Next.js 14 · TypeScript · NestJS · Supabase · OpenAI/Anthropic/Gemini SDK  
**Target Users:** AI engineers, prompt engineers, indie hackers, enterprise AI teams  

---

## 2. Problem Statement

As LLM usage explodes, teams and solo developers write hundreds of prompts with zero version control. A prompt that worked last week breaks today — and there's no history, no diff, no rollback. PromptVault solves this by treating prompts as first-class versioned artifacts, just like source code.

---

## 3. Goals & Success Metrics

| Goal | Metric | Target |
|------|--------|--------|
| Developer adoption | GitHub stars | 500 in 3 months |
| Retention | WAU / MAU ratio | > 40% |
| Revenue | MRR | ₹50,000 / $600 in 6 months |
| Reliability | Uptime | 99.9% |

---

## 4. Features

### 4.1 Core (MVP)
- [ ] Prompt editor with syntax highlighting (Markdown + variables)
- [ ] Version history (commit message + timestamp per save)
- [ ] Diff viewer (side-by-side prompt diff between versions)
- [ ] Branching (fork a prompt into a new variant)
- [ ] Tag & label system (v1.0, production, experiment)
- [ ] Multi-provider test runner (OpenAI, Anthropic, Gemini)
- [ ] Response comparison table (run same prompt across providers)
- [ ] Supabase Auth (GitHub OAuth + email)

### 4.2 Growth (Post-MVP)
- [ ] Team workspaces with roles (Admin, Editor, Viewer)
- [ ] A/B test mode — split traffic between prompt variants
- [ ] Prompt performance analytics (latency, token cost, quality score)
- [ ] API access for CI/CD integration
- [ ] CLI: `promptvault push` / `promptvault pull`
- [ ] VS Code extension

---

## 5. Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        CLIENT LAYER                         │
│   Next.js 14 App Router · TypeScript · Tailwind CSS         │
│   CodeMirror Editor · React Query · Zustand State           │
└─────────────────────┬───────────────────────────────────────┘
                      │ HTTPS / REST / WebSocket
┌─────────────────────▼───────────────────────────────────────┐
│                        API LAYER                            │
│   NestJS · TypeScript · Guards · DTOs · Swagger Docs        │
│   Modules: Auth | Prompts | Versions | Runs | Teams         │
└────────┬────────────────────────┬───────────────────────────┘
         │                        │
┌────────▼──────────┐   ┌─────────▼─────────────────────────┐
│   Supabase DB     │   │     LLM Adapter Layer             │
│   PostgreSQL      │   │   ┌──────────┐ ┌───────────────┐  │
│   Tables:         │   │   │ OpenAI   │ │  Anthropic    │  │
│   - users         │   │   │ SDK      │ │  Claude SDK   │  │
│   - prompts       │   │   └──────────┘ └───────────────┘  │
│   - versions      │   │   ┌──────────────────────────────┐ │
│   - runs          │   │   │       Gemini SDK             │ │
│   - teams         │   │   └──────────────────────────────┘ │
│   - team_members  │   └───────────────────────────────────┘
└───────────────────┘
         │
┌────────▼──────────────────────────────────────────────────┐
│                 Supabase Services                          │
│   Auth (GitHub OAuth) · Storage · Realtime · Edge Fns      │
└────────────────────────────────────────────────────────────┘
```

---

## 6. Database Schema

```sql
-- Users (managed by Supabase Auth)
users (id uuid PK, email, created_at)

-- Prompts
prompts (
  id uuid PK,
  user_id uuid FK → users,
  name varchar(255),
  description text,
  tags text[],
  provider varchar(50),  -- openai | anthropic | gemini
  model varchar(100),
  created_at timestamptz,
  updated_at timestamptz
)

-- Versions (immutable snapshots)
versions (
  id uuid PK,
  prompt_id uuid FK → prompts,
  content text NOT NULL,
  system_message text,
  variables jsonb,        -- {"name": "string", "tone": "formal"}
  commit_message varchar(255),
  version_number integer,
  parent_version_id uuid FK → versions,
  created_at timestamptz
)

-- Test Runs
runs (
  id uuid PK,
  version_id uuid FK → versions,
  provider varchar(50),
  model varchar(100),
  input_variables jsonb,
  response text,
  tokens_used integer,
  latency_ms integer,
  cost_usd numeric(10,6),
  created_at timestamptz
)

-- Teams
teams (id uuid PK, name, owner_id uuid FK → users, created_at)
team_members (team_id, user_id, role varchar(20))  -- admin | editor | viewer
```

---

## 7. API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/auth/login` | GitHub OAuth login |
| GET | `/prompts` | List all prompts for user |
| POST | `/prompts` | Create new prompt |
| GET | `/prompts/:id/versions` | List version history |
| POST | `/prompts/:id/versions` | Save new version (commit) |
| GET | `/versions/:id/diff/:compareId` | Get diff between two versions |
| POST | `/runs` | Execute prompt against LLM |
| GET | `/runs?versionId=:id` | Get all runs for a version |
| POST | `/prompts/:id/branch` | Fork prompt into new branch |

---

## 8. UI Screens

1. **Dashboard** — All prompts grid with last modified, provider badge, tag filters
2. **Prompt Editor** — Split view: editor (left) + live test output (right)
3. **Version History** — Git-log style timeline with commit messages
4. **Diff Viewer** — Side-by-side old vs new prompt with highlighted changes
5. **Run Comparison** — Table: same prompt × multiple providers × responses
6. **Team Settings** — Invite members, assign roles, manage workspace

---

## 9. Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | Next.js 14, TypeScript, Tailwind CSS, shadcn/ui |
| Editor | CodeMirror 6 |
| State | Zustand + React Query (TanStack) |
| Backend | NestJS, TypeScript |
| Database | Supabase (PostgreSQL) |
| Auth | Supabase Auth (GitHub OAuth) |
| LLM SDKs | openai, @anthropic-ai/sdk, @google/generative-ai |
| Deployment | Vercel (frontend) · Render (backend) |
| CI/CD | GitHub Actions |

---

## 10. Monetization

| Tier | Price | Limits |
|------|-------|--------|
| Free | $0 | 50 prompts, 100 runs/mo, 1 user |
| Pro | $12/mo | Unlimited prompts, 2000 runs/mo, 3 users |
| Team | $29/mo | Unlimited everything, 10 users, A/B testing, API access |
| Enterprise | Custom | SSO, SLA, on-prem, dedicated support |

---

## 11. Milestones

| Week | Deliverable |
|------|-------------|
| 1–2 | Auth + DB schema + basic CRUD |
| 3–4 | Version history + diff viewer |
| 5–6 | LLM test runner (OpenAI first) |
| 7–8 | Multi-provider support + run comparison |
| 9–10 | Team workspaces + roles |
| 11–12 | Polish, pricing page, launch on Product Hunt |
