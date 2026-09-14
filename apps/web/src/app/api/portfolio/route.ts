// GET /api/portfolio — Full portfolio data endpoint integrating holdings, quotes, and fundamentals

import { NextResponse } from "next/server";
import type {
  Stock,
  HoldingEntry,
  PortfolioResponse,
  QuoteData,
  FundamentalsData,
} from "@portfolio/shared";
import { QUOTE_CACHE_TTL_MS, FUNDAMENTALS_CACHE_TTL_MS } from "@portfolio/shared";
import { fetchQuotesFromYahoo } from "@/lib/providers/yahooQuoteProvider";
import { fetchQuotesFromGoogle } from "@/lib/providers/googleFinanceProvider";
import {
  fetchFundamentalsData,
  getFallbackFundamentals,
} from "@/lib/providers/fundamentalsProvider";
import { apiCache } from "@/lib/cache";
import {
  calculateSectorSummaries,
  calculatePortfolioTotals,
} from "@/lib/calculations";

const QUOTES_CACHE_KEY = "quotes:all";
const FUNDAMENTALS_CACHE_KEY = "fundamentals:all";

// Merges a static holding entry with live quote and fundamentals data into a Stock object
function mergeStockWithLiveData(
  holding: HoldingEntry,
  quoteData: QuoteData | undefined,
  fundamentalsData: FundamentalsData | undefined
): Stock {
  const hasCMP = quoteData !== undefined;

  // For fundamentals, always fall back to hardcoded data if live fetch failed
  const fallbackFundamentals = getFallbackFundamentals(holding.exchangeCode);
  const peRatioTTM =
    fundamentalsData?.peRatioTTM ?? fallbackFundamentals.peRatioTTM;
  const latestEarnings =
    fundamentalsData?.latestEarnings ?? fallbackFundamentals.latestEarnings;

  return {
    id: holding.id,
    particulars: holding.particulars,
    exchangeCode: holding.exchangeCode,
    exchange: holding.exchange,
    purchasePrice: holding.purchasePrice,
    quantity: holding.quantity,
    sector: holding.sector,
    cmp: hasCMP ? quoteData.cmp : null,
    peRatioTTM,
    latestEarnings,
    lastUpdated: hasCMP ? quoteData.lastUpdated : null,
    fetchStatus: hasCMP ? "ok" : "error",
  };
}

export async function GET(): Promise<NextResponse> {
  try {
    // 1. Load static holdings
    const holdingsModule = await import("../../../../data/holdings.json");
    const holdings: HoldingEntry[] = holdingsModule.default;

    // 2. Fetch live CMP (with caching)
    let quotes = apiCache.get<Map<string, QuoteData>>(QUOTES_CACHE_KEY);
    if (!quotes) {
      try {
        quotes = await fetchQuotesFromYahoo(holdings);
        const missing = holdings.filter((h) => !quotes!.has(h.exchangeCode));
        if (missing.length > 0) {
          const googleQuotes = await fetchQuotesFromGoogle(missing);
          for (const [code, quoteData] of googleQuotes.entries()) {
            quotes.set(code, quoteData);
          }
        }
        apiCache.set(QUOTES_CACHE_KEY, quotes, QUOTE_CACHE_TTL_MS);
      } catch (quoteError) {
        console.error(
          "[/api/portfolio] Quote fetch failed:",
          quoteError instanceof Error ? quoteError.message : String(quoteError)
        );
        quotes = new Map();
      }
    }

    // 3. Fetch fundamentals (with caching)
    let fundamentals = apiCache.get<Map<string, FundamentalsData>>(
      FUNDAMENTALS_CACHE_KEY
    );
    if (!fundamentals) {
      try {
        fundamentals = await fetchFundamentalsData(holdings);
        apiCache.set(
          FUNDAMENTALS_CACHE_KEY,
          fundamentals,
          FUNDAMENTALS_CACHE_TTL_MS
        );
      } catch (fundError) {
        console.error(
          "[/api/portfolio] Fundamentals fetch failed:",
          fundError instanceof Error ? fundError.message : String(fundError)
        );
        fundamentals = new Map();
      }
    }

    // 4. Merge holdings with live data
    const stocks: Stock[] = holdings.map((holding) => {
      return mergeStockWithLiveData(
        holding,
        quotes!.get(holding.exchangeCode),
        fundamentals!.get(holding.exchangeCode)
      );
    });

    // 5. Compute derived metrics and sector summaries
    const sectors = calculateSectorSummaries(stocks);
    const totals = calculatePortfolioTotals(sectors);
    const hasErrors = stocks.some((stock) => stock.fetchStatus === "error");

    // 6. Build the response
    const response: PortfolioResponse = {
      sectors,
      totalInvestment: totals.totalInvestment,
      totalPresentValue: totals.totalPresentValue,
      totalGainLoss: totals.totalGainLoss,
      totalGainLossPercent: totals.totalGainLossPercent,
      lastUpdated: new Date().toISOString(),
      hasErrors,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error(
      "[/api/portfolio] Unhandled error:",
      error instanceof Error ? error.message : String(error)
    );

    return NextResponse.json(
      {
        error: "Failed to build portfolio data",
        message:
          error instanceof Error ? error.message : "Unknown error occurred",
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
