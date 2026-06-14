# PriceHawk — Amazon Price Tracker

An automated Amazon price tracking app that monitors products and sends email alerts when prices drop, items restock, or big discounts appear.

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

## Tech Stack

- **Next.js 14** — App router, server actions, API routes
- **MongoDB + Mongoose** — Product storage & price history
- **Cheerio + Axios** — Lightweight HTML scraping
- **Nodemailer** — Email alerts via Outlook
- **Tailwind CSS** — Styling
