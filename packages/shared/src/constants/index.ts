// Shared constants used across the monorepo

export const POLL_INTERVAL_MS = 15_000;
export const QUOTE_CACHE_TTL_MS = 12_000;
export const FUNDAMENTALS_CACHE_TTL_MS = 300_000; // 5 minutes
export const MAX_FETCH_RETRIES = 3;
export const BACKOFF_BASE_DELAY_MS = 1_000;

export const SECTOR_NAMES = [
  "Financial Sector",
  "Tech Sector",
  "Consumer",
  "Power",
  "Pipe Sector",
  "Others",
] as const;

export type SectorName = (typeof SECTOR_NAMES)[number];
