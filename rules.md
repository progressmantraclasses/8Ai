# Engineering Rules — Portfolio Dashboard

Purpose: Keep the codebase modular, readable, and maintainable.

## 1. Modularity

- One file, one responsibility. A file that fetches data, transforms it, *and* renders UI
  is three files pretending to be one — split it.
- Data fetching (`lib/providers/*`), business logic/math (`lib/calculations.ts`), and
  presentation (`components/*`) never mix in the same file.
- No file should require scrolling past ~150–200 lines to understand what it does. If it
  does, it's doing more than one job — extract.
- Shared logic used in 2+ places goes in `lib/`, not copy-pasted. Logic used in exactly one
  place stays local until it's needed elsewhere — don't pre-abstract speculatively either.

## 2. Naming

- Names describe *what the value is*, not its type or origin: `gainLossPercent`, not
  `data2` or `numVal`. `sectorTotals`, not `arr` or `temp`.
- Booleans read as questions: `isStale`, `hasError`, `isLoading` — not `flag`, `status1`.
- No abbreviations that aren't domain-standard. `qty` and `cmp` are fine (they're in the
  brief itself). `prc`, `amt`, `tmp` are not.
- Function names are verbs describing the one thing they do: `calculateGainLoss`,
  `formatCurrency`, `mergeStockWithQuote`. If you need "and" to describe a function name
  honestly, split the function.
- Match the domain vocabulary from the assignment/sheet exactly (`particulars`, `cmp`,
  `presentValue`) — don't invent synonyms that force a mental translation layer.

## 3. Functions — single responsibility

- A function does one thing and returns one kind of result. It doesn't fetch *and*
  transform *and* format in sequence — that's three functions called in sequence.
- Pure functions for anything computable from inputs alone (`calculateInvestment`,
  `calculateSectorSummary`, `formatPercent`). No hidden reads from global state, no side
  effects. These should be trivially unit-testable without mocking anything.
- Side-effecting functions (fetch, cache read/write, setInterval) are named so the side
  effect is obvious — `fetchQuotesFromYahoo`, not `getQuotes`.
- If a function has more than ~3 parameters, pass an object instead — and consider whether
  it's actually doing too much.
- Early-return for error/edge cases at the top of a function rather than nesting the happy
  path inside conditionals.

## 4. TypeScript

- No `any`. If a shape is genuinely unknown (raw API response), type it as `unknown` and
  narrow it explicitly before use.
- Every external API response gets a typed parser/mapper (`mapYahooResponseToQuote`) —
  never pass a raw fetch response into your app's types and hope the shape matches.
- Prefer `interface` for object shapes that represent domain entities (`Stock`,
  `SectorSummary`); prefer `type` for unions and derived/utility types.
- Nullable fields are explicit (`cmp: number | null`), not silently defaulted to `0` —
  a null CMP and a ₹0 stock price are different facts and the UI should treat them
  differently.

## 5. Components

- Presentational components (`StockRow`, `GainLossCell`) take props and render — they
  don't fetch, don't poll, don't know where their data came from.
- Data-fetching/polling logic lives in hooks (`usePortfolioPolling`), not inside JSX
  components.
- Color/formatting logic (gain vs. loss green/red) lives in exactly one place
  (`GainLossCell`) — not duplicated inline anywhere else the value is shown.
- Derive, don't duplicate: if `investment` can be computed from `purchasePrice * qty`,
  don't also store it as separate component state that can drift out of sync.

## 6. Error handling

- Every external call (Yahoo, fundamentals source) has an explicit failure path — no bare
  `try {} catch {}` that swallows the error silently.
- Partial failure is a first-class state: if 3 of 26 symbols fail, the other 23 still
  render. One bad quote should never blank the whole table.
- User-facing errors say what happened in plain language ("Live prices unavailable, showing
  last known values from 14:32") — not a raw stack trace or `[object Object]`.

## 7. Performance

- Batch external calls — one request for N symbols, not N requests.
- Cache upstream responses with a TTL slightly under your poll interval, so concurrent
  users don't each trigger their own upstream fetch.
- Memoize expensive derived calculations (`sectorTotals` over 26 stocks) only if you've
  actually noticed a re-render cost — don't add `useMemo` reflexively where it's not
  needed.

## 8. Comments

- Comments explain *why* a decision was made (why this library, why this fallback), not
  *what* the code does when the code already says that clearly.
- If a comment is needed to explain what a block of code does, consider whether extracting
  it into a well-named function would make the comment unnecessary.

## 9. Git hygiene

- Commits are scoped to one logical change each — "add sector subtotal calculation", not
  "changes" or "wip".
- Commit messages describe intent, not a diff summary you could get from `git diff`.

---
Following these engineering rules ensures modularity, maintainability, and reliable code quality.
