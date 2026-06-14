# How to Run Trackazon Locally & Live

## Prerequisites

- **Node.js** v18 or higher
- **npm** or **yarn**
- A **MongoDB** database (free tier on [MongoDB Atlas](https://www.mongodb.com/atlas) works)
- An **Outlook/Hotmail email** for sending alerts (already configured as `trackazon@outlook.com`)

---

## 1. Clone & Install

```bash
cd /path/to/project/my-app
npm install
```

---

## 2. Set Up Environment Variables

Create a `.env.local` file in the project root (`my-app/`) with:

```env
MONGODB_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/<dbname>?retryWrites=true&w=majority
EMAIL_PASSWORD=your_outlook_app_password
```

| Variable | Description |
|----------|-------------|
| `MONGODB_URI` | Your MongoDB connection string |
| `EMAIL_PASSWORD` | The password (or app password) for `trackazon@outlook.com` |

---

## 3. Run in Development Mode

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 4. Run in Production Mode (Locally)

```bash
npm run build
npm run start
```

The app will serve on [http://localhost:3000](http://localhost:3000).

---

## 5. Trigger the Cron Job (Price Update)

The cron endpoint lives at `/api/cron`. To run it manually:

```bash
curl http://localhost:3000/api/cron
```

You'll get a JSON response showing how many products were updated successfully.

---

## 6. Set Up Automatic Scheduling (Cron)

### Option A: System Cron (macOS/Linux)

Run `crontab -e` and add a line like:

```cron
# Every 6 hours, trigger the price check
0 */6 * * * curl -s http://localhost:3000/api/cron > /dev/null 2>&1
```

> ⚠️ Make sure the Next.js app is running (`npm run start`) before the cron fires.

### Option B: Vercel Cron (if deployed to Vercel)

Add a `vercel.json` in the project root:

```json
{
  "crons": [
    {
      "path": "/api/cron",
      "schedule": "0 */6 * * *"
    }
  ]
}
```

Vercel will call your endpoint automatically every 6 hours.

---

## 7. Deploying Live (Vercel — Free Tier)

1. Push your code to a GitHub repo.
2. Go to [vercel.com](https://vercel.com) and import the repo.
3. Set the **Root Directory** to `my-app` (if your repo has a parent folder).
4. Add your environment variables (`MONGODB_URI`, `EMAIL_PASSWORD`) in Vercel's dashboard → Settings → Environment Variables.
5. Deploy. Vercel handles builds and hosting automatically.

---

## Troubleshooting

| Problem | Solution |
|---------|----------|
| Scraper returns empty data | Amazon may be blocking. Try again after a few minutes — the rotating User-Agent helps. |
| Email not sending | Check `EMAIL_PASSWORD` is correct. Outlook may require an "App Password" if 2FA is enabled. |
| MongoDB not connecting | Verify your `MONGODB_URI` is correct and your IP is whitelisted in Atlas. |
| Cron not running | Ensure the app is running before the cron fires. Check `curl` output for errors. |
| Build fails | Run `npm install` again; ensure Node.js v18+. |

---

## Project Structure (Quick Reference)

```
my-app/
├── app/                  → Next.js pages & API routes
│   ├── api/cron/         → Scheduled price-check endpoint
│   └── products/         → Product detail pages
├── lib/
│   ├── scraper/          → Amazon scraping logic
│   ├── actions/          → Server actions (scrape & store)
│   ├── models/           → MongoDB schemas
│   ├── nodemailer/       → Email sending logic
│   └── utils.ts          → Price extraction helpers
├── components/           → React UI components
├── .env.local            → Your secrets (never commit this)
└── package.json          → Dependencies & scripts
```
