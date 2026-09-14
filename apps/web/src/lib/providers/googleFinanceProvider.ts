// Google Finance quote provider scraping CMP as a fallback when Yahoo is rate-limited
import * as cheerio from "cheerio";
import type { QuoteData } from "@portfolio/shared";

// Format ticker for Google Finance (e.g., HDFCBANK -> HDFCBANK:NSE)
function formatGoogleTicker(exchangeCode: string, exchange: "NSE" | "BSE"): string {
  return `${exchangeCode}:${exchange === "NSE" ? "NSE" : "BOM"}`;
}

// Extracts the price from Google Finance HTML using multiple selector strategies
function extractPrice(html: string): number | null {
  const $ = cheerio.load(html);

  // Strategy 1: standard class combination (most reliable historically)
  const candidates = [
    $(".YMlKec.fxKbKc").first().text(),
    $("[data-last-price]").first().attr("data-last-price") ?? "",
    $(".IsqQVc.NprOob").first().text(),
    $(".kf1m0").first().text(),
    // Strategy 2: find any element with ₹ followed by digits
    ...$("*")
      .filter((_i, el) => {
        const t = $(el).children().length === 0 ? $(el).text() : "";
        return /^[₹]?[\d,]+\.?\d*$/.test(t.trim()) && t.includes(",");
      })
      .map((_i, el) => $(el).text())
      .toArray(),
  ];

  for (const raw of candidates) {
    if (!raw) continue;
    const clean = String(raw).replace(/[^0-9.]+/g, "");
    const val = parseFloat(clean);
    if (!isNaN(val) && val > 0) return val;
  }

  return null;
}

export async function fetchQuotesFromGoogle(
  symbols: Array<{ exchangeCode: string; exchange: "NSE" | "BSE" }>
): Promise<Map<string, QuoteData>> {
  const results = new Map<string, QuoteData>();

  const fetchPromises = symbols.map(async ({ exchangeCode, exchange }) => {
    const ticker = formatGoogleTicker(exchangeCode, exchange);
    const url = `https://www.google.com/finance/quote/${ticker}`;

    try {
      const response = await fetch(url, {
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36",
          "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
          "Accept-Language": "en-IN,en;q=0.9",
          "Accept-Encoding": "gzip, deflate, br",
          "Cache-Control": "no-cache",
        },
        signal: AbortSignal.timeout(8000),
      });

      if (!response.ok) throw new Error(`HTTP ${response.status}`);

      const html = await response.text();
      const cmp = extractPrice(html);

      if (cmp === null) {
        // Debug: log a snippet to help diagnose selector changes
        const snippet = html.slice(0, 2000);
        console.warn(`[googleFinanceProvider] Could not parse price for ${exchangeCode}. HTML snippet:`, snippet);
        throw new Error("Price element not found — selector may have changed");
      }

      results.set(exchangeCode, {
        symbol: exchangeCode,
        cmp,
        lastUpdated: new Date().toISOString(),
      });
    } catch (error) {
      console.warn(
        `[googleFinanceProvider] Failed to fetch ${exchangeCode}:`,
        error instanceof Error ? error.message : String(error)
      );
    }
  });

  await Promise.allSettled(fetchPromises);
  return results;
}
