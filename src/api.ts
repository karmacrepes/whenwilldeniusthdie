export type Submission = {
  id: number;
  created_at: string;
  character: string;
  username: string;
  cause: string;
  probability: number;
  era: string;
  year?: number;
  month_index: number;
  month_name: string;
  day_of_month: number;
  day_of_week_index: number;
  day_of_week_name: string;
};

export type Aggregates = {
  month_index: number;
  month_name: string;
  avg_probability: number;
  count: number;
}[];

export async function fetchData(character = 'Deniusth') {
  const url = `/api/submissions?character=${encodeURIComponent(character)}&limit=1000`;
  const res = await fetch(url, { cache: 'no-store' });
  if (!res.ok) throw new Error(`Failed to load: ${res.status}`);
  return (await res.json()) as { submissions: Submission[]; aggregates: Aggregates };
}

export async function postSubmission(payload: Omit<Submission, 'id' | 'created_at'>) {
  const res = await fetch('/api/submissions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const msg = await res.text();
    throw new Error(msg || 'Failed to submit');
  }
  return await res.json();
}