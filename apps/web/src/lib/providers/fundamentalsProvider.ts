// Fundamentals data provider using Yahoo Finance with static Excel fallback

import type { FundamentalsData } from "@portfolio/shared";

const FALLBACK_FUNDAMENTALS: Record<
  string,
  { peRatioTTM: number | null; latestEarnings: number | null }
> = {
  HDFCBANK: { peRatioTTM: 18.69, latestEarnings: 91.02 },
  BAJFINANCE: { peRatioTTM: 32.63, latestEarnings: 257.8 },
  "532174": { peRatioTTM: 17.68, latestEarnings: 68.72 },
  "544252": { peRatioTTM: 85.72, latestEarnings: 2.53 },
  "511577": { peRatioTTM: null, latestEarnings: null },
  AFFLE: { peRatioTTM: 55.53, latestEarnings: 26.11 },
  LTIM: { peRatioTTM: 34.69, latestEarnings: 145.92 },
  "542651": { peRatioTTM: 46.57, latestEarnings: 27.77 },
  "544028": { peRatioTTM: 41.68, latestEarnings: 15.88 },
  "544107": { peRatioTTM: 26.3, latestEarnings: 5.8 },
  "532790": { peRatioTTM: 11.64, latestEarnings: 39.48 },
  DMART: { peRatioTTM: 82.63, latestEarnings: 41.75 },
  "532540": { peRatioTTM: 26.56, latestEarnings: 134.77 },
  "500331": { peRatioTTM: 71.13, latestEarnings: 38.36 },
  "500400": { peRatioTTM: 29.36, latestEarnings: 11.94 },
  "542323": { peRatioTTM: 29.26, latestEarnings: 13.75 },
  "532667": { peRatioTTM: 61.25, latestEarnings: 0.84 },
  "542851": { peRatioTTM: 39.51, latestEarnings: 5.57 },
  "543517": { peRatioTTM: 17.98, latestEarnings: 19.78 },
  ASTRAL: { peRatioTTM: 67.13, latestEarnings: 19.59 },
  "542652": { peRatioTTM: 40.91, latestEarnings: 121.97 },
  "543318": { peRatioTTM: 50.37, latestEarnings: 24.52 },
  "506401": { peRatioTTM: 41.86, latestEarnings: 37.26 },
  "541557": { peRatioTTM: 41.86, latestEarnings: 37.26 },
  "533282": { peRatioTTM: 41.86, latestEarnings: 37.26 },
  "540719": { peRatioTTM: null, latestEarnings: -5.82 },
};

import { toYahooSymbol } from "./yahooQuoteProvider";

export async function fetchFundamentalsData(
  symbols: Array<{ exchangeCode: string; exchange: "NSE" | "BSE" }>
): Promise<Map<string, FundamentalsData>> {
  const results = new Map<string, FundamentalsData>();

  let yahooFinance: any = null;
  try {
    const YahooFinance = await import("yahoo-finance2").then((mod) => mod.default);
    yahooFinance = new (YahooFinance as any)({ suppressNotices: ["yahooSurvey"] });
  } catch (importError) {
    console.warn(
      "[fundamentalsProvider] Could not import yahoo-finance2, using fallback data:",
      importError instanceof Error ? importError.message : String(importError)
    );
  }

  for (const { exchangeCode, exchange } of symbols) {
    // Attempt live fundamentals fetch for valid symbols
    const canTryLiveFetch = yahooFinance !== null;

    if (canTryLiveFetch) {
      try {
        const yahooSymbol = toYahooSymbol(exchangeCode, exchange);
        const result = await yahooFinance.quoteSummary(yahooSymbol, {
          modules: ["defaultKeyStatistics"],
        });

        const trailingPE = result?.defaultKeyStatistics?.trailingPE ?? null;
        const earningsPerShare = result?.defaultKeyStatistics?.trailingEps ?? null;

        if (trailingPE !== null || earningsPerShare !== null) {
          results.set(exchangeCode, {
            symbol: exchangeCode,
            peRatioTTM: typeof trailingPE === "number" && !isNaN(trailingPE) ? trailingPE : null,
            latestEarnings: typeof earningsPerShare === "number" && !isNaN(earningsPerShare) ? earningsPerShare : null,
          });
          continue;
        }
      } catch (fetchError) {
        // Live fetch failed — fall through to static fallback silently
      }
    }

    const fallback = FALLBACK_FUNDAMENTALS[exchangeCode];
    results.set(exchangeCode, {
      symbol: exchangeCode,
      peRatioTTM: fallback?.peRatioTTM ?? null,
      latestEarnings: fallback?.latestEarnings ?? null,
    });
  }

  return results;
}

export function getFallbackFundamentals(exchangeCode: string): FundamentalsData {
  const fallback = FALLBACK_FUNDAMENTALS[exchangeCode];
  return {
    symbol: exchangeCode,
    peRatioTTM: fallback?.peRatioTTM ?? null,
    latestEarnings: fallback?.latestEarnings ?? null,
  };
}
