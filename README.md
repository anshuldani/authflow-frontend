# AuthFlow — Frontend

> TurboTax for prior authorization.

The Next.js client for [AuthFlow](https://github.com/anshuldani/authflow-backend) — paste a clinical note, pick a payer, get a complete, policy-cited prior auth form back in seconds. **3rd place, Techstars Chicago Startup Weekend.**

The interesting work lives in the [backend repo](https://github.com/anshuldani/authflow-backend) (RAG over payer policies, Gemini form generation, appeal letters). This repo is the staff-facing UI on top of it.

---

## Stack

- **Next.js 14** (App Router) + TypeScript
- **Tailwind CSS** for the UI
- Calls the AuthFlow FastAPI backend at `NEXT_PUBLIC_API_URL`

---

## Getting started

```bash
git clone https://github.com/anshuldani/authflow-frontend.git
cd authflow-frontend
npm install
cp .env.local.example .env.local
# Set NEXT_PUBLIC_API_URL to your authflow-backend URL (default: http://localhost:8001)
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

You'll need the [authflow-backend](https://github.com/anshuldani/authflow-backend) running for the form-generation endpoints to work.

---

## Environment

| Variable | Required | Default |
|---|---|---|
| `NEXT_PUBLIC_API_URL` | ✅ Yes | `http://localhost:8001` |

---

## Deploy to Vercel

```bash
vercel deploy
vercel env add NEXT_PUBLIC_API_URL
```
