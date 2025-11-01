export type InnDay = { index: number; name: string };
export type InnMonth = { index: number; name: string; season: string | null; known: boolean };

export const DAY_NAMES: InnDay[] = [
  { index: 1, name: "Beithday" },
  { index: 2, name: "Saelsmorn" },
  { index: 3, name: "— (3rd day, unknown)" },
  { index: 4, name: "Nendas / Liriean" },
  { index: 5, name: "Tirenv" },
  { index: 6, name: "Lundas / Helday" },
  { index: 7, name: "Laudas / Gnorna" },
  { index: 8, name: "Zenze" },
];

export const MONTHS: InnMonth[] = [
  { index: 1,  name: "Caelhic (Spring 1)", season: "Spring", known: true },
  { index: 2,  name: "— (Spring 2, unknown)", season: "Spring", known: false },
  { index: 3,  name: "— (Spring 3, unknown)", season: "Spring", known: false },
  { index: 4,  name: "Rerrk (Spring 4)", season: "Spring", known: true },
  { index: 5,  name: "— (Summer 1, unknown)", season: "Summer", known: false },
  { index: 6,  name: "— (Summer 2, unknown)", season: "Summer", known: false },
  { index: 7,  name: "Solla? (Summer 3, ambiguous)", season: "Summer", known: false },
  { index: 8,  name: "Weris? (Summer 4, ambiguous)", season: "Summer", known: false },
  { index: 9,  name: "Evium (Autumn 1)", season: "Autumn", known: true },
  { index: 10, name: "— (Autumn 2, unknown)", season: "Autumn", known: false },
  { index: 11, name: "— (Autumn 3, unknown)", season: "Autumn", known: false },
  { index: 12, name: "— (Autumn 4, unknown)", season: "Autumn", known: false },
  { index: 13, name: "Liuwhe (Winter 1)", season: "Winter", known: true },
  { index: 14, name: "Mouring (Winter 2)", season: "Winter", known: true },
  { index: 15, name: "Elfebelfast (Winter 3)", season: "Winter", known: true },
  { index: 16, name: "— (Winter 4, unknown)", season: "Winter", known: false },
];

export const DAYS_PER_WEEK = 8;
export const WEEKS_PER_MONTH = 4;
export const DAYS_PER_MONTH = DAYS_PER_WEEK * WEEKS_PER_MONTH;

export function monthLabel(index: number) {
  const m = MONTHS.find(m => m.index === index);
  return m ? m.name : `Month ${index}`;
}
export function dayLabel(index: number) {
  const d = DAY_NAMES.find(d => d.index === index);
  return d ? d.name : `Day ${index}`;
}