// Yahoo Finance quote provider using yahoo-finance2 v4
import type { QuoteData } from "@portfolio/shared";

// Map internal exchange codes and BSE scrip codes to valid Yahoo Finance tickers
export const YAHOO_TICKER_MAP: Record<string, string> = {
  HDFCBANK: "HDFCBANK.NS",
  BAJFINANCE: "BAJFINANCE.NS",
  "532174": "ICICIBANK.NS",
  "544252": "BAJAJHFL.NS",
  "511577": "511577.BO",
  AFFLE: "AFFLE.NS",
  LTIM: "LTM.NS",
  "542651": "KPITTECH.NS",
  "544028": "TATATECH.NS",
  "544107": "BLSE.NS",
  "532790": "TANLA.NS",
  DMART: "DMART.NS",
  "532540": "TATACONSUM.NS",
  "500331": "PIDILITIND.NS",
  "500400": "TATAPOWER.NS",
  "542323": "KPIGREEN.NS",
  "532667": "SUZLON.NS",
  "542851": "GENSOL.NS",
  "543517": "HARIOMPIPE.NS",
  ASTRAL: "ASTRAL.NS",
  "542652": "POLYCAB.NS",
  "543318": "CLEAN.NS",
  "506401": "DEEPAKNTR.NS",
  "541557": "FINEORG.NS",
  "533282": "GRAVITA.NS",
  "540719": "SBILIFE.NS",
};

// Map internal exchange codes to Yahoo Finance ticker symbols
export function toYahooSymbol(exchangeCode: string, exchange: "NSE" | "BSE"): string {
  if (YAHOO_TICKER_MAP[exchangeCode]) {
    return YAHOO_TICKER_MAP[exchangeCode];
  }
  return exchange === "NSE" ? `${exchangeCode}.NS` : `${exchangeCode}.BO`;
}

// Fetches CMP for a batch of symbols from Yahoo Finance (v4 class-based API)
export async function fetchQuotesFromYahoo(
  symbols: Array<{ exchangeCode: string; exchange: "NSE" | "BSE" }>
): Promise<Map<string, QuoteData>> {
  const results = new Map<string, QuoteData>();

  // v4: default export is a class, must be instantiated
  const YahooFinance = await import("yahoo-finance2").then((mod) => mod.default);
  const yahooFinance = new (YahooFinance as any)({ suppressNotices: ["yahooSurvey"] });

  const yahooSymbols: string[] = [];
  const symbolToCode = new Map<string, string>();

  for (const { exchangeCode, exchange } of symbols) {
    const yahooSymbol = toYahooSymbol(exchangeCode, exchange);
    yahooSymbols.push(yahooSymbol);
    symbolToCode.set(yahooSymbol, exchangeCode);
  }

  try {
    // Batch fetch all symbols in one request
    const quotes = await yahooFinance.quote(yahooSymbols);
    const quoteArray = Array.isArray(quotes) ? quotes : [quotes];

    for (const quote of quoteArray) {
      if (!quote?.symbol) continue;
      const exchangeCode = symbolToCode.get(quote.symbol);
      if (!exchangeCode) continue;
      const cmp = quote.regularMarketPrice;
      if (typeof cmp !== "number" || isNaN(cmp)) continue;
      results.set(exchangeCode, { symbol: exchangeCode, cmp, lastUpdated: new Date().toISOString() });
    }
  } catch (error) {
    console.error(
      "[yahooQuoteProvider] Batch fetch failed:",
      error instanceof Error ? error.message : String(error)
    );

    // Per-symbol fallback if batch fails
    for (const { exchangeCode, exchange } of symbols) {
      if (results.has(exchangeCode)) continue;
      try {
        const yahooSymbol = toYahooSymbol(exchangeCode, exchange);
        const quote = await yahooFinance.quote(yahooSymbol);
        if (quote && typeof quote.regularMarketPrice === "number") {
          results.set(exchangeCode, {
            symbol: exchangeCode,
            cmp: quote.regularMarketPrice,
            lastUpdated: new Date().toISOString(),
          });
        }
      } catch (err) {
        console.warn(
          `[yahooQuoteProvider] Failed to fetch ${exchangeCode}:`,
          err instanceof Error ? err.message : String(err)
        );
      }
    }
  }

  return results;
}
