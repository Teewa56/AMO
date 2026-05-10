# AMO — Installation Guide

Complete step-by-step guide to run AMO locally.

---

## Prerequisites

| Tool | Version | Install |
|------|---------|---------|
| Node.js | 18+ | [nodejs.org](https://nodejs.org/) |
| Python | 3.11+ | [python.org](https://www.python.org/) |
| pip | Latest | Bundled with Python |
| Git | Any | [git-scm.com](https://git-scm.com/) |

---

## 1. Clone the Repository

```bash
git clone https://github.com/Opeyemi-Builds/AMO.git
cd AMO
```

---

## 2. Environment Variables

```bash
# Copy the example environment file
cp .env.example .env
```

Open `.env` and fill in your Squad API key:

```env
SQUAD_SECRET_KEY=your_squad_sandbox_secret_key_here
SQUAD_BASE_URL=https://sandbox-api-d.squadco.com
DATABASE_URL=sqlite:///./aom_database.db
```

> **Get your Squad API key**: Sign up at [squadco.com](https://squadco.com/) and grab your sandbox secret key from the dashboard.
>
> **Note**: The app works without a Squad key — it gracefully falls back to mock account numbers for demo purposes.

---

## 3. Backend Setup

```bash
cd backend

# Create a virtual environment (recommended)
python -m venv venv

# Activate it
# On Windows:
venv\Scripts\activate
# On macOS/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Start the backend server
uvicorn app.main:app --reload --port 8000
```

The backend API will be available at **http://localhost:8000**

Verify it's running:
```bash
curl http://localhost:8000
# → {"status":"Online"}
```

View auto-generated API docs:
- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

---

## 4. Frontend Setup

Open a **new terminal** (keep the backend running):

```bash
cd frontend  # from project root

# Install dependencies
npm install

# Start the development server
npm run dev
```

The frontend will be available at **http://localhost:5173**

---

## 5. Using the App

1. **Open** http://localhost:5173 in your browser
2. **Explore** the landing page — click nodes in the orbital timeline, scroll through features
3. **Click** "Open Your Account" or "Launch App"
4. **Enter** your name and email → you'll get a real Wema Bank account number
5. **Send money** to any Nigerian bank account — watch the AI shield scan in real-time
6. **View** your transaction history with fraud risk scores

### Demo Notes
- Starting balance: **₦150,000**
- The AI fraud engine runs in 1.2 seconds — you'll see the scanning animation
- Try sending a very large amount to trigger a higher risk score
- All transactions are stored locally in `backend/aom_database.db` (SQLite)

---

## 6. Production Build

```bash
# Build the frontend
cd frontend
npm run build

# Preview the production build
npm run preview
```

---

## Troubleshooting

### Backend won't start
```bash
# Make sure you're in the right directory
cd backend

# Try installing with --upgrade
pip install -r requirements.txt --upgrade

# Check Python version
python --version  # Must be 3.11+
```

### Frontend can't reach backend
The frontend proxies `/api` requests to `http://localhost:8000` via Vite's dev server config.
Make sure the backend is running on port 8000 before starting the frontend.

If you run the backend on a different port, update `frontend/vite.config.ts`:
```ts
proxy: {
  '/api': {
    target: 'http://localhost:YOUR_PORT',  // Change this
    changeOrigin: true,
  },
},
```

### CORS errors
The backend has CORS fully open (`allow_origins=["*"]`) — if you're seeing CORS errors, the backend is likely not running.

### Squad API errors
If Squad returns errors, the app automatically falls back to mock account numbers. The demo will still work end-to-end.

---

## Project Structure

```
AMO/
├── .env.example              ← Environment variable template
├── README.md                 ← Project overview
├── INSTALLATION.md           ← This file
│
├── backend/
│   ├── requirements.txt      ← Python dependencies
│   └── app/
│       ├── main.py           ← FastAPI app + CORS config
│       ├── core/
│       │   ├── config.py     ← Settings (reads from .env)
│       │   └── database.py   ← SQLite + SQLAlchemy setup
│       ├── api/routers/
│       │   └── transfers.py  ← All API endpoints
│       ├── schemas/
│       │   ├── models.py     ← DB models (WalletDB, TransactionDB)
│       │   └── transactions.py ← Pydantic request schemas
│       └── services/
│           ├── squad_client.py  ← Squad API integration
│           └── fraud_engine.py  ← AI fraud detection engine
│
└── frontend/
    ├── package.json          ← Node dependencies
    ├── vite.config.ts        ← Vite + Tailwind + path aliases
    ├── tsconfig.app.json     ← TypeScript config
    └── src/
        ├── App.tsx           ← Router + dark mode setup
        ├── main.tsx          ← React entry point
        ├── index.css         ← Tailwind v4 + orange theme
        ├── api/client.ts     ← Type-safe API client
        ├── hooks/
        │   └── useWallet.ts  ← Wallet state management
        ├── lib/utils.ts      ← cn(), formatNaira(), etc.
        ├── pages/
        │   ├── Landing.tsx   ← Full landing page
        │   ├── Onboarding.tsx ← Account creation flow
        │   ├── Dashboard.tsx ← Main banking dashboard
        │   ├── SendMoney.tsx ← Transfer form + AI scan
        │   └── History.tsx   ← Transaction history
        └── components/
            ├── ui/           ← Badge, Button, Card, Input, etc.
            └── blocks/       ← Gallery4, Feature108, Features10
```

---

## Dependencies

### Backend (Python)
```
fastapi          — Web framework
uvicorn          — ASGI server
sqlalchemy       — ORM
pydantic         — Data validation
httpx            — Async HTTP client (Squad API)
python-dotenv    — Environment variables
```

### Frontend (Node.js)
```
react + react-dom        — UI framework
react-router-dom         — Client-side routing
tailwindcss              — Utility CSS
lucide-react             — Icon library
class-variance-authority — Component variants
@radix-ui/react-slot     — Composable components
@radix-ui/react-tabs     — Accessible tabs
embla-carousel-react     — Carousel/slider
motion                   — Animation library
clsx + tailwind-merge    — Class utilities
```
