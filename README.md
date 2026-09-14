# Portfolio Dashboard

A dynamic portfolio dashboard built with **Next.js 15**, **TypeScript**, and **Tailwind CSS** that tracks 26 stock holdings across 6 sectors with real-time CMP updates, derived financial metrics, and sector-level analytics.

Built as a **Yarn monorepo** for the Octa Byte AI Full Stack Intern case study.

---

## 🚀 Live Demo & Walkthrough

- 🌐 **Live Application:** [8-ai-web.vercel.app/dashboard](https://8-ai-web.vercel.app/dashboard)
- 📹 **Video Walkthrough (Loom):** [Watch Demo on Loom](https://www.loom.com/share/c824c051aa7645769d4b6ee161410b0a)

---

## Table of Contents

- [Live Demo & Walkthrough](#-live-demo--walkthrough)
- [Overview](#overview)
- [Architecture](#architecture)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [Running the Application](#running-the-application)
- [Testing](#testing)
- [Data Sources & API Strategy](#data-sources--api-strategy)
- [Technical Challenges & Solutions](#technical-challenges--solutions)
- [Key Design Decisions](#key-design-decisions)
- [Evaluation Criteria Mapping](#evaluation-criteria-mapping)

---

## Overview

This dashboard displays portfolio holdings in a tabular format with:

- **Real-time CMP** fetched from Yahoo Finance (refreshes every ~15 seconds)
- **P/E Ratio & Latest Earnings** from Yahoo Finance summary data with Excel fallback
- **Derived metrics** computed on-the-fly: Investment, Present Value, Gain/Loss (₹ and %), Portfolio Weight
- **Sector grouping** with collapsible sections and sector-level subtotals
- **Visual indicators**: green for gains, red for losses, live pulse for active data
- **Sector allocation chart** using Recharts (donut chart + breakdown list)
- **Error handling**: partial failure support (23/26 stocks render if 3 fail), clear user-facing messages

### Portfolio Composition

| Sector            | Stocks | Total Investment |
|-------------------|--------|------------------|
| Financial Sector  | 5      | ₹3,28,450        |
| Tech Sector       | 6      | ₹3,37,820        |
| Consumer          | 3      | ₹2,63,565        |
| Power             | 4      | ₹1,58,860        |
| Pipe Sector       | 3      | ₹1,98,656        |
| Others            | 5      | ₹2,55,709        |
| **Total**         | **26** | **₹15,43,060**   |

---

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        Client (Browser)                      │
│                                                              │
│   Dashboard Page                                             │
│   ├── usePortfolioPolling() ─── fetches /api/portfolio ──┐   │
│   ├── Header (refresh controls, live indicator)          │   │
│   ├── PortfolioSummaryCards (total metrics)              │   │
│   ├── SectorChart (recharts donut)                       │   │
│   └── PortfolioTable                                     │   │
│       └── SectorGroup[]                                  │   │
│           └── StockRow[] + GainLossCell                  │   │
│                                                          │   │
└──────────────────────────────────────────────────────────┼───┘
                                                           │
                        ┌──────────────────────────────────┘
                        │  HTTP GET (every 15s)
                        ▼
┌─────────────────────────────────────────────────────────────┐
│                    Server (Next.js API Routes)               │
│                                                              │
│   /api/portfolio                                             │
│   ├── Loads holdings.json (static data)                     │
│   ├── Fetches CMP via /api/quotes → yahooQuoteProvider      │
│   ├── Fetches P/E via /api/fundamentals → fundamentalsProvider│
│   ├── Merges holdings + live data into Stock[]              │
│   ├── Runs calculations.ts (derived metrics, sector totals) │
│   └── Returns PortfolioResponse                             │
│                                                              │
│   TTL Cache (lib/cache.ts)                                   │
│   └── Prevents redundant upstream calls within cache window  │
│                                                              │
└─────────────────────────────────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────────┐
│                    External Data Sources                      │
│                                                              │
│   Yahoo Finance (yahoo-finance2 library)                     │
│   ├── CMP: regularMarketPrice                               │
│   └── Fundamentals: trailingPE, epsTrailingTwelveMonths     │
│                                                              │
│   Fallback: Static Excel data (hardcoded in provider)        │
│   └── P/E + Earnings from original portfolio sheet           │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

---

## Tech Stack

| Category          | Technology                                                    |
|-------------------|---------------------------------------------------------------|
| **Framework**     | Next.js 15 (App Router)                                       |
| **Language**      | TypeScript (strict mode)                                      |
| **Styling**       | Tailwind CSS 3.4                                              |
| **Charts**        | Recharts 2.15                                                 |
| **Data Fetching** | yahoo-finance2 (Yahoo Finance wrapper)                        |
| **Monorepo**      | Yarn Workspaces                                               |
| **Testing**       | Jest + ts-jest                                                |
| **Fonts**         | Inter + JetBrains Mono (Google Fonts)                         |

---

## Project Structure

```
portfolio-dashboard/
├── package.json              # Root workspace config (Yarn workspaces)
├── tsconfig.json             # Shared base TypeScript config
├── .gitignore
├── .env.example
├── README.md
│
├── packages/
│   └── shared/               # Shared types & constants
│       ├── package.json
│       ├── tsconfig.json
│       └── src/
│           ├── types/
│           │   └── portfolio.ts     # Stock, DerivedStockMetrics, SectorSummary
│           ├── constants/
│           │   └── index.ts         # POLL_INTERVAL_MS, CACHE_TTLs, SECTOR_NAMES
│           └── index.ts             # Barrel export
│
└── apps/
    └── web/                         # Next.js application
        ├── package.json
        ├── tsconfig.json
        ├── tailwind.config.ts
        ├── next.config.ts
        ├── jest.config.js
        │
        ├── data/
        │   └── holdings.json        # 26 stocks, 6 sectors (static data)
        │
        ├── src/
        │   ├── app/
        │   │   ├── layout.tsx       # Root layout (fonts, metadata)
        │   │   ├── globals.css      # Tailwind + custom dark theme
        │   │   ├── page.tsx         # Redirect → /dashboard
        │   │   ├── dashboard/
        │   │   │   └── page.tsx     # Main dashboard page
        │   │   └── api/
        │   │       ├── quotes/route.ts       # CMP batch fetch
        │   │       ├── fundamentals/route.ts # P/E + earnings batch fetch
        │   │       └── portfolio/route.ts    # Full merged portfolio data
        │   │
        │   ├── components/
        │   │   ├── PortfolioTable/
        │   │   │   ├── PortfolioTable.tsx    # Table container
        │   │   │   ├── SectorGroup.tsx       # Sector block + subtotals
        │   │   │   ├── StockRow.tsx          # Single stock row
        │   │   │   └── GainLossCell.tsx      # Color logic (green/red)
        │   │   ├── PortfolioSummaryCards.tsx  # Top-level metric cards
        │   │   ├── SectorChart.tsx           # Recharts sector donut
        │   │   ├── ErrorBanner.tsx           # Error messaging
        │   │   ├── Header.tsx                # Title + refresh controls
        │   │   └── LoadingSpinner.tsx         # Skeleton loading state
        │   │
        │   ├── hooks/
        │   │   └── usePortfolioPolling.ts    # 15s interval polling hook
        │   │
        │   └── lib/
        │       ├── calculations.ts          # Pure math functions
        │       ├── formatters.ts            # Currency/percent formatting
        │       ├── cache.ts                 # In-memory TTL cache
        │       └── providers/
        │           ├── yahooQuoteProvider.ts    # Yahoo Finance CMP fetcher
        │           └── fundamentalsProvider.ts  # P/E + earnings fetcher
        │
        └── __tests__/
            └── calculations.test.ts         # Unit tests
```

---

## Getting Started

### Prerequisites

- **Node.js** ≥ 18.0
- **Yarn** ≥ 1.22 (classic)

### Installation

```bash
# Clone the repository
git clone <repo-url>
cd 8AI

# Install all dependencies (root + all workspaces)
yarn install
```

### Environment Setup

```bash
# Copy the example env file
cp .env.example apps/web/.env.local

# Edit .env.local with your settings (optional — defaults work fine)
```

---

## Environment Variables

| Variable                        | Default   | Description                                      |
|---------------------------------|-----------|--------------------------------------------------|
| `NEXT_PUBLIC_POLL_INTERVAL_MS`  | `15000`   | Client-side polling interval (milliseconds)      |
| `ALPHA_VANTAGE_API_KEY`         | —         | Optional: Alpha Vantage API key for fundamentals |
| `FMP_API_KEY`                   | —         | Optional: Financial Modeling Prep API key         |

> **Note:** The dashboard works without any API keys. CMP is fetched from Yahoo Finance (no key required), and fundamentals fall back to the hardcoded Excel data.

---

## Running the Application

```bash
# Development server (from project root)
yarn dev

# The dashboard will be available at:
# http://localhost:3000  →  redirects to /dashboard
```

### Other Commands

```bash
# Build for production
yarn build

# Start production server
yarn start

# Run linter
yarn lint

# Run tests
yarn test
```

---

## Testing

```bash
# Run all tests
yarn test

# Run tests in watch mode
cd apps/web && npx jest --watch
```

### What's Tested

The test suite covers all pure calculation functions in `lib/calculations.ts`:

- `calculateInvestment` — purchasePrice × quantity
- `calculatePresentValue` — cmp × quantity (null when CMP unavailable)
- `calculateGainLoss` — presentValue − investment
- `calculateGainLossPercent` — gainLoss / investment as decimal
- `calculatePortfolioWeight` — investment / totalPortfolioInvestment
- `calculateDerivedMetrics` — bundles all the above for a single stock
- `calculateTotalInvestment` — sum across all stocks
- `calculateSectorSummaries` — groups by sector, computes subtotals
- `calculatePortfolioTotals` — grand totals across all sectors

Edge cases tested:
- Null CMP (unavailable data ≠ zero)
- Zero investment (division guard)
- Mixed sectors with partial CMP availability
- Real values from the portfolio sheet (HDFC Bank: ₹1,490 × 50 = ₹74,500)

---

## Data Sources & API Strategy

### CMP — Current Market Price

**Source:** Yahoo Finance via the `yahoo-finance2` npm library

Yahoo Finance has no official public API. The `yahoo-finance2` library wraps Yahoo's undocumented internal JSON endpoints, which are more stable than HTML scraping but still unofficial.

**Why this approach:**
- Hand-rolling an HTML scraper breaks on every markup change
- `yahoo-finance2` is widely maintained and handles response parsing
- Batch fetching: one request for all 26 symbols instead of 26 individual requests

**Risk mitigation:**
- **TTL cache** (`lib/cache.ts`): 12s TTL so a 15s UI poll doesn't equal 15s of upstream calls
- **Per-stock fetchStatus**: if Yahoo fails for 3 symbols, the other 23 still render
- **Fallback**: stocks without CMP show "—" instead of silently displaying zero

### P/E Ratio & Latest Earnings

**Source:** Yahoo Finance `quoteSummary` endpoint (primary) + hardcoded Excel data (fallback)

**Why not Google Finance:**
Google Finance has no API and its markup is heavily obfuscated (JS-rendered, class names are random hashes). Building a scraper that demos once and breaks on the next Google deployment is a weaker engineering choice than using a reliable data source and explaining why.

**Data Choice Rationale:** Evaluated Google Finance scraping and avoided it due to brittle markup; used Yahoo Finance summary with static fallback instead.

### Rate Limiting Strategy

1. **Server-side TTL cache**: prevents concurrent users from each triggering their own upstream fetch
2. **Batch requests**: one API call for all 26 symbols, not 26 individual calls
3. **Individual fallback**: if the batch fails, tries each symbol individually (handles cases where one bad symbol poisons the batch)
4. **Separate cache TTLs**: CMP cache (12s) refreshes frequently; fundamentals cache (5 min) refreshes rarely since P/E changes quarterly

---

## Technical Challenges & Solutions

### 1. Unofficial API Dependencies

**Challenge:** Both Yahoo and Google Finance lack official APIs, making data fetching unreliable.

**Solution:**
- Used `yahoo-finance2`, a maintained wrapper around Yahoo's internal endpoints
- Added fallback data from the portfolio Excel sheet for fundamentals
- Every stock has a `fetchStatus` field (`"ok"` | `"stale"` | `"error"`) so the UI can communicate data freshness honestly

### 2. Partial Failure Handling

**Challenge:** If 3 of 26 stocks fail to fetch, should the entire dashboard break?

**Solution:** No. Partial failure is a first-class state:
- Each stock independently tracks its own `fetchStatus`
- The UI renders available data and shows a subtle banner for failed stocks
- Sector subtotals fall back to investment value for stocks without CMP
- The error banner says "Some stock prices could not be fetched" — not a stack trace

### 3. Derived Values vs. Stored Values

**Challenge:** If CMP changes, investment/gainLoss/portfolioWeight all need to update atomically.

**Solution:** Derived values are **never stored** — they're computed on every render from source data:
- `investment = purchasePrice × quantity` (always fresh)
- `presentValue = cmp × quantity` (updates when CMP refreshes)
- `gainLoss = presentValue - investment` (always consistent)
- `portfolioWeight = investment / totalInvestment` (always consistent)

This eliminates an entire class of bugs where stored derived values drift out of sync with source data.

### 4. Security

**Challenge:** API keys and scraping logic should not be exposed to the client browser.

**Solution:** All external data fetching happens in Next.js API routes (`/api/quotes`, `/api/fundamentals`, `/api/portfolio`). The browser only calls `/api/portfolio` — it never touches Yahoo Finance directly.

### 5. Performance

**Challenge:** 26 stocks × 15-second refresh = potential for excessive API calls.

**Solution:**
- **Server-side TTL cache**: same upstream response serves multiple concurrent requests
- **Batch fetching**: one API call for all symbols
- **Separate refresh rates**: CMP refreshes every 15s, fundamentals every 5 min
- **Background refresh indicator**: the UI shows a subtle pulse during refresh, not a full reload

---

## Key Design Decisions

| Decision | Rationale |
|----------|-----------|
| **Yarn monorepo** | Shared types between packages prevent interface drift. Single `yarn install` for everything. |
| **Derived metrics computed, not stored** | Eliminates sync bugs. If CMP changes, all dependent values update atomically. |
| **Server-side data fetching** | Keeps API keys and scraping logic off the client. Security requirement from the brief. |
| **TTL cache with separate TTLs** | CMP changes intraday (12s cache), P/E changes quarterly (5 min cache). |
| **Hardcoded fundamentals fallback** | Better to show reference data with a label than empty columns. |
| **GainLossCell as single color source** | Color logic in one component, not scattered inline across the app. |
| **Per-stock fetchStatus** | Honest about data quality. "Last known price, updated 2 min ago" beats silently showing stale data. |
| **setInterval over WebSockets** | Simpler for 26 stocks with 15s updates. WebSockets would make sense at higher frequencies or stock counts. |

---

## Evaluation Criteria Mapping

| Criteria | How This Project Addresses It |
|----------|-------------------------------|
| **Functionality** | All required columns, dynamic updates, sector grouping with subtotals, color-coded gain/loss |
| **Code Quality** | Single responsibility per file, pure functions, typed interfaces, meaningful names, comprehensive comments |
| **Performance** | Batch API calls, TTL caching, separate cache TTLs, skeleton loading state |
| **Error Handling** | Partial failure support, user-facing error messages, per-stock status indicators |
| **API Strategy** | yahoo-finance2 for CMP, fallback fundamentals, rate limit mitigation via caching |
| **User Interface** | Dark theme, sector allocation chart, collapsible sectors, responsive layout, micro-animations |
| **Problem Solving** | Google Finance evaluated and rejected with documented reasoning, fallback strategy implemented |

---

## License

This project was built as a case study for Octa Byte AI Pvt Ltd.
