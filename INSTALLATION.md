# AMO â€” Installation Guide

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
> **Note**: The app works without a Squad key â€” it gracefully falls back to mock account numbers for demo purposes.

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
# â†’ {"status":"Online"}
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
2. **Explore** the landing page â€” click nodes in the orbital timeline, scroll through features
3. **Click** "Open Your Account" or "Launch App"
4. **Enter** your name and email â†’ you'll get a real GTBank account number
5. **Send money** to any Nigerian bank account â€” watch the AI shield scan in real-time
6. **View** your transaction history with fraud risk scores

### Demo Notes
- Starting balance: **â‚¦150,000**
- The AI fraud engine runs in 1.2 seconds â€” you'll see the scanning animation
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
The backend has CORS fully open (`allow_origins=["*"]`) â€” if you're seeing CORS errors, the backend is likely not running.

### Squad API errors
If Squad returns errors, the app automatically falls back to mock account numbers. The demo will still work end-to-end.

---

## Project Structure

```
AMO/
â”œâ”€â”€ .env.example              â† Environment variable template
â”œâ”€â”€ README.md                 â† Project overview
â”œâ”€â”€ INSTALLATION.md           â† This file
â”‚
â”œâ”€â”€ backend/
â”‚   â”œâ”€â”€ requirements.txt      â† Python dependencies
â”‚   â””â”€â”€ app/
â”‚       â”œâ”€â”€ main.py           â† FastAPI app + CORS config
â”‚       â”œâ”€â”€ core/
â”‚       â”‚   â”œâ”€â”€ config.py     â† Settings (reads from .env)
â”‚       â”‚   â””â”€â”€ database.py   â† SQLite + SQLAlchemy setup
â”‚       â”œâ”€â”€ api/routers/
â”‚       â”‚   â””â”€â”€ transfers.py  â† All API endpoints
â”‚       â”œâ”€â”€ schemas/
â”‚       â”‚   â”œâ”€â”€ models.py     â† DB models (WalletDB, TransactionDB)
â”‚       â”‚   â””â”€â”€ transactions.py â† Pydantic request schemas
â”‚       â””â”€â”€ services/
â”‚           â”œâ”€â”€ squad_client.py  â† Squad API integration
â”‚           â””â”€â”€ fraud_engine.py  â† AI fraud detection engine
â”‚
â””â”€â”€ frontend/
    â”œâ”€â”€ package.json          â† Node dependencies
    â”œâ”€â”€ vite.config.ts        â† Vite + Tailwind + path aliases
    â”œâ”€â”€ tsconfig.app.json     â† TypeScript config
    â””â”€â”€ src/
        â”œâ”€â”€ App.tsx           â† Router + dark mode setup
        â”œâ”€â”€ main.tsx          â† React entry point
        â”œâ”€â”€ index.css         â† Tailwind v4 + orange theme
        â”œâ”€â”€ api/client.ts     â† Type-safe API client
        â”œâ”€â”€ hooks/
        â”‚   â””â”€â”€ useWallet.ts  â† Wallet state management
        â”œâ”€â”€ lib/utils.ts      â† cn(), formatNaira(), etc.
        â”œâ”€â”€ pages/
        â”‚   â”œâ”€â”€ Landing.tsx   â† Full landing page
        â”‚   â”œâ”€â”€ Onboarding.tsx â† Account creation flow
        â”‚   â”œâ”€â”€ Dashboard.tsx â† Main banking dashboard
        â”‚   â”œâ”€â”€ SendMoney.tsx â† Transfer form + AI scan
        â”‚   â””â”€â”€ History.tsx   â† Transaction history
        â””â”€â”€ components/
            â”œâ”€â”€ ui/           â† Badge, Button, Card, Input, etc.
            â””â”€â”€ blocks/       â† Gallery4, Feature108, Features10
```

---

## Dependencies

### Backend (Python)
```
fastapi          â€” Web framework
uvicorn          â€” ASGI server
sqlalchemy       â€” ORM
pydantic         â€” Data validation
httpx            â€” Async HTTP client (Squad API)
python-dotenv    â€” Environment variables
```

### Frontend (Node.js)
```
react + react-dom        â€” UI framework
react-router-dom         â€” Client-side routing
tailwindcss              â€” Utility CSS
lucide-react             â€” Icon library
class-variance-authority â€” Component variants
@radix-ui/react-slot     â€” Composable components
@radix-ui/react-tabs     â€” Accessible tabs
embla-carousel-react     â€” Carousel/slider
motion                   â€” Animation library
clsx + tailwind-merge    â€” Class utilities
```
