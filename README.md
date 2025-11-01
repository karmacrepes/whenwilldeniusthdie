# whenwilldeniutshdie.com

A playful, spoiler‑safe RNG prophecy generator for **The Wandering Inn** readers. Not affiliated with the author. No spoilers, no ill will — just vibes and charts.

## Local dev

```bash
npm i
npm run dev
```

Then open the printed localhost URL.

## Build

```bash
npm run build
npm run preview
```

## Deploy to Vercel

1. Create a new Vercel project and import this repo.
2. Framework preset: **Vite** (if asked).
3. Build command: `vite build` (default), Output dir: `dist`.
4. After it builds, go to **Settings → Domains** and add `whenwilldeniutshdie.com`. Point your registrar’s DNS nameservers to Vercel or add the CNAME records Vercel gives you.

## Deploy to Netlify

- New site from Git → select your repo.
- Build command: `vite build` ; Publish directory: `dist`.
- Add the domain `whenwilldeniutshdie.com` in Domain settings and follow the DNS instructions.

## Shareable seeds

The app adds a `?seed=` query param. Click **Copy shareable link** to share your exact prophecy. Reload for fresh RNG.

---

*This is a fan‑made parody site. All trademarks and characters belong to their respective owners. Please read and support the original work.*