import type { VercelRequest, VercelResponse } from '@vercel/node';
import { Pool, neonConfig } from '@neondatabase/serverless';
import ws from 'ws';
import { z } from 'zod';

neonConfig.webSocketConstructor = ws;

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

const ensureSQL = `
CREATE TABLE IF NOT EXISTS submissions (
  id BIGSERIAL PRIMARY KEY,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  character TEXT NOT NULL DEFAULT 'Deniusth',
  username TEXT NOT NULL,
  cause TEXT NOT NULL,
  probability INT NOT NULL CHECK (probability >= 0 AND probability <= 100),
  era TEXT NOT NULL DEFAULT 'AF',
  year INT CHECK (year BETWEEN 0 AND 100000),
  month_index INT NOT NULL CHECK (month_index BETWEEN 1 AND 16),
  month_name TEXT NOT NULL,
  day_of_month INT NOT NULL CHECK (day_of_month BETWEEN 1 AND 32),
  day_of_week_index INT NOT NULL CHECK (day_of_week_index BETWEEN 1 AND 8),
  day_of_week_name TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_submissions_character ON submissions(character);
CREATE INDEX IF NOT EXISTS idx_submissions_month ON submissions(month_index);
CREATE INDEX IF NOT EXISTS idx_submissions_created ON submissions(created_at DESC);
`;

const bodySchema = z.object({
  character: z.string().min(1).max(64).default('Deniusth'),
  username: z.string().min(1).max(50),
  cause: z.string().min(1).max(280),
  probability: z.number().int().min(0).max(100),
  era: z.string().min(1).max(16).default('AF'),
  year: z.number().int().min(0).max(99999).optional(),
  month_index: z.number().int().min(1).max(16),
  month_name: z.string().min(1).max(64),
  day_of_month: z.number().int().min(1).max(32),
  day_of_week_index: z.number().int().min(1).max(8),
  day_of_week_name: z.string().min(1).max(64),
});

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    const client = await pool.connect();
    try { await client.query(ensureSQL); } finally { client.release(); }
  } catch (e) {
    console.error('DB ensure error', e);
    return res.status(500).json({ error: 'Database not available' });
  }

  if (req.method === 'POST') {
    try {
      const parsed = bodySchema.parse(typeof req.body === 'string' ? JSON.parse(req.body) : req.body);
      const { character, username, cause, probability, era, year, month_index, month_name, day_of_month, day_of_week_index, day_of_week_name } = parsed;

      const { rows } = await pool.query(
        `INSERT INTO submissions (character, username, cause, probability, era, year, month_index, month_name, day_of_month, day_of_week_index, day_of_week_name)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)
         RETURNING *`,
        [character, username, cause, probability, era, year ?? null, month_index, month_name, day_of_month, day_of_week_index, day_of_week_name]
      );
      return res.status(201).json({ ok: true, submission: rows[0] });
    } catch (e: any) {
      console.error('POST error', e);
      return res.status(400).json({ error: e?.message ?? 'Invalid payload' });
    }
  }

  if (req.method === 'GET') {
    const character = (req.query.character as string) || 'Deniusth';
    const limit = Math.min(parseInt((req.query.limit as string) || '500'), 2000);
    const { rows } = await pool.query(
      `SELECT id, created_at, character, username, cause, probability, era, year, month_index, month_name, day_of_month, day_of_week_index, day_of_week_name
       FROM submissions
       WHERE character = $1
       ORDER BY created_at DESC
       LIMIT $2`,
      [character, limit]
    );

    const { rows: aggr } = await pool.query(
      `SELECT month_index, month_name, AVG(probability)::float AS avg_probability, COUNT(*)::int AS count
       FROM submissions
       WHERE character = $1
       GROUP BY month_index, month_name
       ORDER BY month_index ASC`,
      [character]
    );

    return res.status(200).json({ submissions: rows, aggregates: aggr });
  }

  res.setHeader('Allow', 'GET, POST');
  return res.status(405).json({ error: 'Method Not Allowed' });
}