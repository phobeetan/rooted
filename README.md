# Rooted

Financial confidence platform for early-career women. Built by a 4-person team for FidHacks Westlake 2026 — 3rd Place.

## Mission
Rooted addresses the barrier for investing with a sequence of low-stakes practice environments — paper trading, a mock brokerage account, AI coaching, and community — before anything touches real money.

The homepage frames this as a growth metaphor: a scroll-driven animated tree (roots → trunk → branches → buds) that maps onto the feature journey.

##Features
- Paper Trading: practice trading with $10,000 in fake cash against a real-time-ish watchlist of women-led stocks.
- Mock Fidelity: a Fidelity-style brokerage account view built from your paper-trading history (positions, allocation by type, cash).
- AI Investment Assistant ("Bud"): a Gemini-powered chat assistant grounded in your profile, mock portfolio, the startup directory, and - forum sentiment.
- Women-Led Startup Directory: a browsable, filterable directory of startups and founders to invest in.
- Community Forum: peer Q&A with a trust-badge system (Active Member / Trusted Voice / Veteran Answerer).

## Tech Stack
- React 19
- Hand-written CSS (no framework) using CSS custom properties for a botanical sage/rose color palette
- Supabase — primary auth/data backend
- Custom dev server middleware providing:
  - GET /api/stocks — live stock quotes for the watchlist via the Marketaux API, with a deterministic fallback generator if the upstream API fails
  - POST /api/investment-chat — server-side chat endpoint (OpenAI), falls back to a rule-based reply matcher if no API key is set
  - GET /api/market-news — Marketaux news proxy
  - GET/POST /api/mock-fidelity/import — in-memory store for a mock Fidelity account payload
  - A separate client-side assistant powered by the Gemini API (src/services/assistantService.js) drives Bud in the React chat pages — a distinct AI path from the OpenAI middleware above

## Run

```bash
npm install
npm run dev
```

## Supabase

Run `supabase/schema.sql` in the Supabase SQL Editor once. Then log in and open Mock Fidelity. Portfolio changes and simulated trades automatically sync to Bud's context.

## Branches

```bash
git checkout -b feature/your-feature-name
git add .
git commit -m "Add your feature"
git push -u origin feature/your-feature-name
```

Keep feature work on separate branches and open a pull request when it is ready.
