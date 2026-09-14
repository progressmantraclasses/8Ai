// GET /api/fundamentals — batch P/E ratio and earnings fetch endpoint with caching

import { NextResponse } from "next/server";
import { FUNDAMENTALS_CACHE_TTL_MS } from "@portfolio/shared";
import { fetchFundamentalsData } from "@/lib/providers/fundamentalsProvider";
import { apiCache } from "@/lib/cache";
import type { FundamentalsData } from "@portfolio/shared";

const CACHE_KEY = "fundamentals:all";

export async function GET(): Promise<NextResponse> {
  try {
    // Check cache — fundamentals change infrequently so cached data is preferred
    const cached = apiCache.get<Map<string, FundamentalsData>>(CACHE_KEY);
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

    const fundamentals = await fetchFundamentalsData(holdings);

    // Cache with a longer TTL — fundamentals are updated quarterly
    apiCache.set(CACHE_KEY, fundamentals, FUNDAMENTALS_CACHE_TTL_MS);

    const responseData = Object.fromEntries(fundamentals);
    return NextResponse.json({
      data: responseData,
      source: "live",
      timestamp: new Date().toISOString(),
      count: fundamentals.size,
    });
  } catch (error) {
    console.error(
      "[/api/fundamentals] Unhandled error:",
      error instanceof Error ? error.message : String(error)
    );

    return NextResponse.json(
      {
        error: "Failed to fetch fundamentals data",
        message:
          error instanceof Error ? error.message : "Unknown error occurred",
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
