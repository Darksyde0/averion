# Averion - AI-Powered Cybersecurity Awareness Training

Live at: https://averiontech.vercel.app

## Overview

Averion is a multi-tenant cybersecurity awareness training platform built with React, Supabase, and OpenAI GPT-4o. It allows organisations to create phishing simulations, build training modules, and track employee security awareness over time.

## Tech Stack

- **Frontend:** React 18, Vite, Tailwind CSS, React Router v6, Recharts
- **Backend:** Supabase (PostgreSQL, Auth, Realtime, Storage)
- **AI:** OpenAI GPT-4o via Supabase Edge Functions (Deno)
- **Deployment:** Vercel (frontend), Supabase CLI (Edge Functions)

## Prerequisites

Before running locally you need:

- Node.js v18 or higher
- npm v9 or higher
- A Supabase account and project
- An OpenAI API key

## Environment Variables

Create a `.env` file in the root of the project with the following:

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

Both values are found in your Supabase project dashboard under **Settings → API**.

## Installation

```bash
# Clone the repository
git clone https://github.com/Darksyde0/averion.git

# Navigate into the project
cd averion

# Install dependencies
npm install

# Start the development server
npm run dev
```

The app will run at `http://localhost:5173`

## Database Setup

1. Go to your Supabase project dashboard
2. Open the SQL Editor
3. Run the following to create the required tables and enable Row Level Security:

```sql
-- Enable RLS on all tables after creation
alter table users enable row level security;
alter table modules enable row level security;
alter table lessons enable row level security;
alter table lesson_sections enable row level security;
alter table quiz_questions enable row level security;
alter table simulations enable row level security;
alter table simulation_results enable row level security;
alter table module_progress enable row level security;
alter table achievements enable row level security;

-- simulation_results foreign key (preserves scores when simulation is deleted)
alter table simulation_results
add constraint simulation_results_simulation_id_fkey
foreign key (simulation_id)
references simulations(id)
on delete set null;
```

## Edge Function Setup

The AI generation feature requires the Supabase Edge Function to be deployed:

```bash
# Install Supabase CLI if not already installed
npm install -g supabase

# Login to Supabase
supabase login

# Deploy the Edge Function
npx supabase functions deploy generate-simulations --project-ref your_project_ref
```

Add the OpenAI API key as a secret in your Supabase project:

```bash
supabase secrets set OPENAI_API_KEY=your_openai_api_key
```

## Running in Production

The project auto-deploys to Vercel on every push to the `main` branch. To set up your own Vercel deployment:

1. Connect the GitHub repository to Vercel
2. Add `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` under **Settings → Environment Variables** in the Vercel dashboard
3. Add a `vercel.json` file to the root with SPA rewrite rules:

```json
{
  "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }]
}
```

## Project Structure



## Key Features

- **Admin Dashboard** - real-time stats, performance charts, leaderboard, at-risk users
- **ARIA AI Assistant** -conversational AI that generates security simulations via GPT-4o
- **Simulation Engine** - one-attempt phishing simulations with scoring
- **Training Modules** - lessons, sections, and quizzes with progress tracking
- **Multi-Tenancy** - full data isolation per organisation via Row Level Security
- **Realtime Notifications** - live alerts for completions and at-risk events

## Security

- All 9 database tables have Row Level Security enabled
- JWT authentication on every request
- Prompt injection protection on all AI inputs
- Rate limiting on the Edge Function (10 requests per minute per user)
- Environment variables never committed to the repository

## Academic Context

Built as part of the CBL (Challenge-Based Learning) module for the MSc in Communication and Web Technologies at the University of Aveiro, 2025–2026.