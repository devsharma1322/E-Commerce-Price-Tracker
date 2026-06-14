# PriceHawk — Amazon Price Tracker

An automated Amazon price tracking app that monitors products and sends email alerts when prices drop, items restock, or big discounts appear.

🔗 **Live:** [https://price-hawk-mu.vercel.app](https://price-hawk-mu.vercel.app)

Built with Next.js, MongoDB, Cheerio, and Nodemailer.

## Documentation

- **[ABOUT.md](./ABOUT.md)** — What the app does, who it's for, and how it works in plain language.
- **[SETUP.md](./SETUP.md)** — Full setup instructions: environment variables, running locally, scheduling cron jobs, and deploying live.

## Quick Start

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) — paste any Amazon product URL to start tracking.

## Testing

```bash
# Run all tests
npm test

# Unit tests only (utils, price extraction, notifications)
npm test -- utils

# Integration tests only (live Amazon scrape)
npm test -- scraper.integration
```

**25 unit tests** covering price extraction, currency parsing, price history calculations, email notification triggers, and number formatting.

**3 integration tests** verifying the scraper works against a real Amazon India product.

## Tech Stack

- **Next.js 16** — App router, server actions, API routes
- **MongoDB + Mongoose** — Product storage & price history
- **Cheerio + Axios** — Lightweight HTML scraping
- **Nodemailer** — Email alerts via Gmail
- **Tailwind CSS** — Styling
- **Jest + ts-jest** — Unit & integration testing

## Production Features

- 🔄 **Rate limiting** — Sequential scraping with 2s delay between products
- 🔁 **Retry logic** — 3 attempts with exponential backoff per product
- 📊 **Structured logging** — Timestamped logs with per-product metrics
- 📬 **Email alerts** — Price drops, restocks, and 40%+ discounts
- ⏰ **Cron scheduling** — Automated via cron-job.org (every 6 hours)
