## Learner — Real‑time AI Teaching Platform

![Next.js](https://img.shields.io/badge/Next.js-15-black?style=for-the-badge&logo=next.js&logoColor=white)
![React](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)
![Clerk](https://img.shields.io/badge/Clerk-Auth-6C47FF?style=for-the-badge&logo=clerk&logoColor=white)
![Supabase](https://img.shields.io/badge/Supabase-DB-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white)

Learner is a Next.js 15 app that lets users build voice‑based "companions" (AI tutors) and run real‑time teaching sessions. It combines Clerk for auth and subscriptions, Supabase for storage, and Vapi for live voice AI.

## 🚀 Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Set up environment variables
cp .env.local.example .env.local
# Edit .env.local with your keys (see Environment variables section)

# 3. Run development server
npm run dev

# 4. Open in browser
# http://localhost:3000
```

**Note:** You'll need accounts with Clerk, Supabase, and Vapi to run the app. See detailed setup instructions below.

## 📋 Table of Contents

- [Features at a Glance](#-features-at-a-glance)
- [Technology Stack](#-technology-stack)
- [Getting Started](#getting-started-local)
- [Environment Variables](#environment-variables)
- [Data Model](#data-model-supabase)
- [Architecture](#architecture)
- [Deployment](#deployment)
- [Troubleshooting](#troubleshooting)
- [Development Tips](#development-tips)

## ⚡ Features at a Glance

- ✅ Create AI voice companions for any subject (math, science, languages, etc.)
- ✅ Real-time voice sessions with transcripts and audio controls
- ✅ Search and filter companion library by subject and topic
- ✅ Session history tracking and bookmarks
- ✅ Subscription tiers with usage limits (free: 3 companions, pro: unlimited)
- ✅ Production-ready error handling and graceful degradation
- ✅ Full authentication with Clerk (email, social, passkeys)

## 🛠 Technology Stack

### Frontend
![Next.js](https://img.shields.io/badge/Next.js-15-000000?style=flat-square&logo=next.js&logoColor=white)
![React](https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react&logoColor=black)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=flat-square&logo=typescript&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-38B2AC?style=flat-square&logo=tailwind-css&logoColor=white)

- **Next.js 15** - App Router with Server Components and Server Actions
- **React 19** - Latest React features with modern hooks
- **TypeScript** - Type-safe development
- **Tailwind CSS 4** - Utility-first styling
- **Shadcn/ui** - Accessible component primitives
- **React Hook Form + Zod** - Form validation and management

### Backend & Services
![Clerk](https://img.shields.io/badge/Clerk-6C47FF?style=flat-square&logo=clerk&logoColor=white)
![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?style=flat-square&logo=supabase&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=flat-square&logo=postgresql&logoColor=white)

- **Clerk** - Authentication and subscription management
- **Supabase** - PostgreSQL database with REST API
- **Vapi** - Real-time voice AI (WebRTC, ASR, TTS)

### Voice AI Stack (via Vapi)
![OpenAI](https://img.shields.io/badge/OpenAI-412991?style=flat-square&logo=openai&logoColor=white)

- **Deepgram Nova-3** - Speech-to-text transcription
- **ElevenLabs** - Text-to-speech synthesis
- **OpenAI GPT-4** - Conversational AI model

### Development
![ESLint](https://img.shields.io/badge/ESLint-4B32C3?style=flat-square&logo=eslint&logoColor=white)
![npm](https://img.shields.io/badge/npm-CB3837?style=flat-square&logo=npm&logoColor=white)

- **ESLint** - Code linting
- **Turbopack** - Fast development builds

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
   ```bash
   npm i
   # or
   yarn
   # or
   pnpm i
   ```

2. Configure Supabase
   - Create a new Supabase project
   - Run the SQL schema (see Data model section above)
   - Copy your project URL and anon key
   - Add to `.env.local`

3. Configure Clerk
   - Create a new Clerk application
   - Enable authentication methods (Email/Passkey/Social)
   - Copy publishable and secret keys
   - Add `http://localhost:3000` to allowed origins/redirects
   - Add to `.env.local`

   **Optional - Subscriptions:**
   - Go to Clerk Dashboard → Subscriptions
   - Create pricing plans with entitlements:
     - Plan: `pro` (unlimited companions)
     - Feature: `3_companion_limit`
     - Feature: `10_companion_limit`
   - Configure checkout URLs
   - Note: The app works without this; defaults to 3 companion limit

4. Configure Vapi
   - Create a Vapi account
   - Generate a web token
   - Add `NEXT_PUBLIC_VAPI_WEB_TOKEN` to `.env.local`

5. Create `.env.local` file (see Environment variables section)

6. Run the app
   ```bash
   npm run dev
   ```
   - Open `http://localhost:3000`

## Deployment

### Build for production
```bash
npm run build
npm start
```

### Deploy to Vercel (recommended)
1. Push your code to GitHub
2. Import project in Vercel
3. Add environment variables from `.env.local`
4. Deploy

### Important production notes
- The app includes error boundaries for graceful degradation
- Subscription features are optional; app defaults to free tier limits
- Ensure all environment variables are set in production
- TypeScript/ESLint errors are ignored during build (see `next.config.ts`)

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

## Troubleshooting

### Production Error: `Cannot read properties of undefined (reading 'checkoutUrls')`

**Cause:** Clerk's `PricingTable` component requires subscription plans to be configured in the Clerk Dashboard.

**Solution:** The app includes fallback handling for this:
- `app/subscription/page.tsx` shows a fallback UI when subscriptions aren't configured
- `app/subscription/error.tsx` catches and handles subscription errors gracefully
- `lib/actions/companion.actions.ts` defaults to 3 companion limit if subscription checks fail

**To fully enable subscriptions:**
1. Go to Clerk Dashboard → Subscriptions
2. Create pricing plans with the entitlements listed above
3. Configure checkout URLs
4. Redeploy your app

### Server Components Render Errors

**Cause:** Missing environment variables or service configuration issues.

**Solution:**
- Verify all environment variables are set in production
- Check Clerk, Supabase, and Vapi are properly configured
- Review error boundaries in `app/subscription/error.tsx`
- Enable detailed error logging by checking production logs

### Companion Creation Fails

**Cause:** Database permissions or missing Supabase configuration.

**Solution:**
1. Verify Supabase tables exist (run SQL schema)
2. Check RLS policies allow authenticated users to insert
3. Ensure `NEXT_PUBLIC_SUPABASE_ANON_KEY` is set
4. Check server logs for specific error messages

### Voice Session Not Working

**Cause:** Missing or invalid Vapi configuration.

**Solution:**
- Verify `NEXT_PUBLIC_VAPI_WEB_TOKEN` is valid
- Check browser microphone permissions
- Ensure Vapi account has sufficient credits
- Review browser console for WebRTC errors

### Build Errors

**Cause:** TypeScript or ESLint validation failures.

**Current behavior:** Build errors are ignored (see `next.config.ts`)

**To enable strict checking:**
```typescript
// next.config.ts
const nextConfig: NextConfig = {
    typescript: {
        ignoreBuildErrors: false  // Enable type checking
    },
    eslint: {
        ignoreDuringBuilds: false  // Enable linting
    },
    // ... rest of config
};
```

## Roadmap ideas

- Telemetry and quality metrics for sessions
- Rich lesson plans and attachments
- Multi‑party sessions and classroom mode
- Mobile PWA and offline transcript viewing

## 📝 Recent Changes

### v1.1.0 - Production Error Fixes
- ✅ Added fallback handling for Clerk subscription configuration
- ✅ Implemented error boundaries for subscription page
- ✅ Set default companion limit (3) when subscriptions aren't configured
- ✅ Added comprehensive troubleshooting documentation
- ✅ Improved error handling in `newCompanionPermissions`

## 📄 License

This project is for educational purposes. See individual service providers (Clerk, Supabase, Vapi) for their respective terms of service.

## 🙏 Acknowledgements

- **Clerk** - Authentication and subscription infrastructure
- **Supabase** - Database and developer experience
- **Vapi** - Real-time voice AI platform
- **Next.js & Vercel** - Web framework and deployment
- **Tailwind CSS** - Styling system

## 🤝 Contributing

Contributions are welcome! Please feel free to submit issues or pull requests.

### Development Guidelines
1. Keep database access in Server Actions
2. Use TypeScript for type safety
3. Follow existing code structure and patterns
4. Test locally before submitting PRs
5. Update documentation for new features

## 📧 Support

For issues or questions:
- Open an issue on GitHub
- Check the [Troubleshooting](#troubleshooting) section
- Review service provider documentation (Clerk, Supabase, Vapi)
