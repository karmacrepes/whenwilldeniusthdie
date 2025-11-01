# whenwilldeniutshdie.com (crowd-sourced)

A playful, Innworld‑styled, **real‑data** prediction page. Users submit a cause + probability + Innworld date; charts show **only** what users entered.

## Local dev
```bash
npm i
npm run dev
```

## Deploy (Vercel)
1. Push this repo to GitHub and import to Vercel.
2. Add **`DATABASE_URL`** in Project → Settings → Environment Variables (use Vercel → Marketplace → Neon to create/link a Postgres DB).
3. Deploy. The first API request creates the `submissions` table automatically.

## API
- `GET /api/submissions?character=Deniusth&limit=1000` → `{ submissions, aggregates }`
- `POST /api/submissions` → body `{ username, cause, probability, era, year?, month_index, month_name, day_of_month, day_of_week_index, day_of_week_name, character }`

## Innworld calendar
- 16 months/year, 32 days/month (4 weeks × 8 days); 8 day names; partial canon month names with unknowns labeled.