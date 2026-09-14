// Core domain types. Stock holds raw data; DerivedStockMetrics is computed on-the-fly.

/** Exchange a stock is listed on */
export type Exchange = "NSE" | "BSE";

/** Fetch status for a single stock's live data */
export type FetchStatus = "ok" | "stale" | "error";

// Raw stock holding: static or fetched data. No computed fields.
export interface Stock {
  /** Stable unique identifier (not an array index) */
  id: string;
  /** Stock name as it appears in the portfolio sheet */
  particulars: string;
  /** NSE symbol (e.g. "HDFCBANK") or numeric BSE code */
  exchangeCode: string;
  /** Which exchange this stock is listed on */
  exchange: Exchange;
  /** Price per share at purchase time (₹) */
  purchasePrice: number;
  /** Number of shares held */
  quantity: number;
  /** Sector classification */
  sector: string;

  // --- Fetched live fields ---

  /** Current Market Price — fetched from Yahoo Finance */
  cmp: number | null;
  /** Price-to-Earnings ratio (trailing twelve months) */
  peRatioTTM: number | null;
  /** Most recent earnings per share */
  latestEarnings: number | null;

  // --- Fetch metadata ---

  /** ISO timestamp of last successful data fetch */
  lastUpdated: string | null;
  /** Current status of the live data fetch for this stock */
  fetchStatus: FetchStatus;
}

// Derived metrics computed from Stock fields + portfolio total
export interface DerivedStockMetrics {
  /** purchasePrice × quantity */
  investment: number;
  /** cmp × quantity (null if cmp is null) */
  presentValue: number | null;
  /** presentValue − investment (null if cmp is null) */
  gainLoss: number | null;
  /** gainLoss / investment as a decimal (null if cmp is null) */
  gainLossPercent: number | null;
  /** investment / totalPortfolioInvestment as a decimal */
  portfolioWeight: number;
}

// A stock row combining raw data with derived metrics
export interface StockWithMetrics extends Stock {
  derived: DerivedStockMetrics;
}

// Sector-level summary with aggregated totals and constituent stocks
export interface SectorSummary {
  sector: string;
  totalInvestment: number;
  totalPresentValue: number | null;
  totalGainLoss: number | null;
  totalGainLossPercent: number | null;
  stocks: StockWithMetrics[];
}

// Full portfolio response from /api/portfolio endpoint
export interface PortfolioResponse {
  sectors: SectorSummary[];
  totalInvestment: number;
  totalPresentValue: number | null;
  totalGainLoss: number | null;
  totalGainLossPercent: number | null;
  lastUpdated: string;
  hasErrors: boolean;
}

// Quote data returned by the quote provider
export interface QuoteData {
  symbol: string;
  cmp: number;
  lastUpdated: string;
}

// Fundamentals data returned by the fundamentals provider
export interface FundamentalsData {
  symbol: string;
  peRatioTTM: number | null;
  latestEarnings: number | null;
}

// Static holding entry as stored in holdings.json
export interface HoldingEntry {
  id: string;
  particulars: string;
  exchangeCode: string;
  exchange: Exchange;
  purchasePrice: number;
  quantity: number;
  sector: string;
}
