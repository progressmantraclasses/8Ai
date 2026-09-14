// GET /api/quotes — Batch CMP fetch endpoint using Yahoo Finance with Google fallback

import { NextResponse } from "next/server";
import { QUOTE_CACHE_TTL_MS } from "@portfolio/shared";
import { fetchQuotesFromYahoo } from "@/lib/providers/yahooQuoteProvider";
import { fetchQuotesFromGoogle } from "@/lib/providers/googleFinanceProvider";
import { apiCache } from "@/lib/cache";
import type { QuoteData } from "@portfolio/shared";

const CACHE_KEY = "quotes:all";

export async function GET(): Promise<NextResponse> {
  try {
    // Check cache first — avoid unnecessary upstream calls
    const cached = apiCache.get<Map<string, QuoteData>>(CACHE_KEY);
    if (cached) {
      const responseData = Object.fromEntries(cached);
      return NextResponse.json({
        data: responseData,
        source: "cache",
        timestamp: new Date().toISOString(),
      });
    }

    // Load holdings to know which symbols to fetch
    const holdingsModule = await import("../../../../data/holdings.json");
    const holdings = holdingsModule.default as Array<{
      exchangeCode: string;
      exchange: "NSE" | "BSE";
    }>;

    // Batch fetch from Yahoo Finance
    const quotes = await fetchQuotesFromYahoo(holdings);

    // Find which ones failed or were rate-limited by Yahoo
    const missingSymbols = holdings.filter(
      (h) => !quotes.has(h.exchangeCode)
    );

    // Fallback to Google Finance for missing ones
    if (missingSymbols.length > 0) {
      console.log(`[api/quotes] Yahoo missed ${missingSymbols.length} symbols. Falling back to Google Finance...`);
      const googleQuotes = await fetchQuotesFromGoogle(missingSymbols);
      
      // Merge results
      for (const [code, quoteData] of googleQuotes.entries()) {
        quotes.set(code, quoteData);
      }
    }

    // Cache the merged results
    apiCache.set(CACHE_KEY, quotes, QUOTE_CACHE_TTL_MS);

    const responseData = Object.fromEntries(quotes);
    return NextResponse.json({
      data: responseData,
      source: "live",
      timestamp: new Date().toISOString(),
      count: quotes.size,
    });
  } catch (error) {
    console.error(
      "[/api/quotes] Unhandled error:",
      error instanceof Error ? error.message : String(error)
    );

    return NextResponse.json(
      {
        error: "Failed to fetch stock quotes",
        message:
          error instanceof Error ? error.message : "Unknown error occurred",
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
