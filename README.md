

## v2
- Innworld‑styled sepia theme with Playfair Display + Lora
- Spoiler toggle (default ON)
- New New‑Lands‑era joke causes


## v3
- Crowd-sourced submissions stored in Postgres (Neon) via Vercel Functions
- Real-only graph: average probability by Innworld month (no mock data)
- Innworld calendar drop-downs: 8-day week & 16-month year

### Setup DB
1) Provision a Postgres DB (Neon recommended) and copy the connection string into a Vercel env var named `DATABASE_URL`.
2) Redeploy. The API will auto-create the `submissions` table on first request.

### API
- `GET /api/submissions?character=Deniusth&limit=1000` returns `submissions` and `aggregates`.
- `POST /api/submissions` with JSON body `{ username, cause, probability, era, year?, month_index, month_name, day_of_month, day_of_week_index, day_of_week_name }`.
