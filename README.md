## Learner — Real‑time AI Teaching Platform

Learner is a Next.js 15 app that lets users build voice‑based “companions” (AI tutors) and run real‑time teaching sessions. It combines Clerk for auth and subscriptions, Supabase for storage, and Vapi for live voice AI.

### Why this setup

- **Next.js App Router**: Server Actions for secure DB access, file‑based routing, and modern React 19 features.
- **Clerk**: Passwordless auth, user management, and subscription UI via `PricingTable` plus entitlement checks to gate features.
- **Supabase**: Postgres + REST/Realtime with a simple JS client; minimal backend to ship fast.
- **Vapi**: Production‑ready real‑time voice stack (WebRTC, ASR/TTS) with a single web token.
- **Tailwind CSS 4 + headless UI**: Rapid, accessible UI with lightweight design system components.

## Features

- Create a Companion (name, subject, topic, voice, style, duration)
- Run a real‑time voice session with transcripts and mic control
- Search and filter the Companion library
- Session history and bookmarks
- Subscription gating (limits and “pro” plan) using Clerk

## Architecture

### High level

- `app/` (App Router): routes for home, auth, library, builder, subscription, sessions
- `components/`: UI widgets (cards, lists, form, voice session UI) and primitives under `components/ui`
- `lib/`: integrations
  - `lib/actions/companion.actions.ts`: Server Actions that talk to Supabase (CRUD & queries)
  - `lib/supabase.ts`: Safe client factory from env
  - `lib/utils.ts`: UI utils, URL helpers, and `configureAssistant` for Vapi
  - `lib/vapi.sdk.ts`: Vapi web client bootstrapped from env
- `constants/`: subjects, colors, voices, demo content
- `types/`: shared TypeScript types (including Vapi message types)

### Key routes

- `app/companions/page.tsx`: Companion Library with search and subject filter
- `app/companions/new/page.tsx`: Builder; requires auth and permission check
- `app/companions/[id]/page.tsx`: Session page; loads a companion and mounts the voice UI
- `app/sign-in/[[...sign-in]]/page.tsx`: Auth UI via Clerk
- `app/subscription/page.tsx`: Subscription/upsell via Clerk `PricingTable`

### Data flow

1. UI (client) submits forms and triggers actions
2. Server Actions in `lib/actions` perform DB reads/writes (Supabase) securely on the server
3. Vapi client runs live sessions in the browser; server is not involved in audio transport
4. Side‑effects (e.g., session history) are written via Server Actions

## Data model (Supabase)

This app uses these tables (columns used by the code):

```sql
-- companions
id uuid primary key default gen_random_uuid(),
name text not null,
subject text not null,
topic text not null,
voice text not null,
style text not null,
duration int not null,
author text not null,         -- Clerk user ID
created_at timestamptz default now()

-- session_history
id uuid primary key default gen_random_uuid(),
user_id text not null,        -- Clerk user ID
companion_id uuid not null references companions(id),
created_at timestamptz default now()

-- bookmarks
id uuid primary key default gen_random_uuid(),
user_id text not null,        -- Clerk user ID
companion_id uuid not null references companions(id),
created_at timestamptz default now()
```

Indexes recommended for performance:

- `companions(subject)` and trigram/ILIKE on `topic`/`name`
- `session_history(user_id, created_at desc)`
- `bookmarks(user_id, companion_id)` unique

## Voice AI (Vapi)

The voice session is controlled in `components/companionComponent.tsx` using the `vapi` client from `lib/vapi.sdk.ts`. The assistant runtime is produced by `configureAssistant(voice, style)` in `lib/utils.ts` and includes:

- Transcription: Deepgram `nova-3`
- TTS: ElevenLabs with pre‑selected voices
- LLM: OpenAI `gpt-4` with a focused system prompt

Rationale: centralizing the assistant config keeps the UI simple while allowing easy swaps of voice/model providers via Vapi.

## Auth, subscriptions, and gating (Clerk)

- Global `ClerkProvider` in `app/layout.tsx`; routes protected via `middleware.ts`
- `newCompanionPermissions()` checks plan/feature entitlements through `auth().has(...)`
- `app/subscription/page.tsx` renders `PricingTable` for upgrade paths

Why: using Clerk keeps auth and billing UX cohesive and minimizes custom code for entitlements.

## Environment variables

Create a `.env.local` with:

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL="..."
NEXT_PUBLIC_SUPABASE_ANON_KEY="..."

# Clerk
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="..."
CLERK_SECRET_KEY="..."
# Optional if customizing routes
NEXT_PUBLIC_CLERK_SIGN_IN_URL="/sign-in"

# Vapi Web SDK
NEXT_PUBLIC_VAPI_WEB_TOKEN="..."
```

Notes:

- Vapi server credentials (LLM/ASR/TTS) are managed in Vapi; the web token is enough for the client.
- Supabase anon key is client‑safe; all writes still go through Server Actions.

## Scripts

- `dev`: Next dev with Turbopack
- `build`: Next build
- `start`: Production server
- `lint`: Next lint

## Getting started (local)

1. Clone repo and install deps
   - `npm i` or `yarn` or `pnpm i`
2. Configure Supabase
   - Create project, run the SQL schema above, copy URL and anon key
3. Configure Clerk
   - Create app, enable Email/Passkey/Social as desired, copy publishable and secret keys
   - Ensure `http://localhost:3000` is an allowed origin/redirect
4. Configure Vapi
   - Create a web token and add `NEXT_PUBLIC_VAPI_WEB_TOKEN`
5. Create `.env.local` using the variables above
6. Run the app
   - `npm run dev` → open `http://localhost:3000`

## Notable implementation details

- Server Actions in `lib/actions` keep DB credentials server‑side and reduce API boilerplate
- `next.config.ts` disables TypeScript/ESLint errors during builds to ease iteration; enable in prod
- `images.remotePatterns` allows Clerk hosted avatars (`img.clerk.com`)
- Mic permissions are gracefully handled with a modal in the session UI

## Folder structure

```
app/
  companions/            # Library, builder, session pages
  sign-in/               # Auth route (Clerk)
  subscription/          # PricingTable and upsell
  layout.tsx             # Global layout with ClerkProvider & Navbar
components/
  companionComponent.tsx # Voice session UI + Vapi client wiring
  companionForm.tsx      # Builder form (zod + react-hook-form)
  companionList.tsx      # Tabular list with icons and duration
  ui/                    # Button, Input, Select, Form, etc.
lib/
  actions/               # Server Actions (Supabase CRUD/queries)
  supabase.ts            # Supabase client factory
  utils.ts               # UI utils + Vapi assistant config
  vapi.sdk.ts            # Vapi Web SDK init
constants/               # Subjects, colors, voices, demo data
types/                   # Shared types (incl. Vapi message types)
```

## Development tips

- Keep DB access inside Server Actions
- Co‑locate UI state in client components; pass primitives into actions
- Use `configureAssistant` as the single place to tune voice, model, and prompt
- Entitlement names (`pro`, `3_companion_limit`, `10_companion_limit`) must match your Clerk setup

## Roadmap ideas

- Telemetry and quality metrics for sessions
- Rich lesson plans and attachments
- Multi‑party sessions and classroom mode
- Mobile PWA and offline transcript viewing

## Acknowledgements

- Clerk for auth and subscriptions
- Supabase for the database and developer experience
- Vapi for real‑time voice infrastructure
- Next.js/Tailwind for the web stack
