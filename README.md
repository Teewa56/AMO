# AMO â€” Autonomous Money Operations

> **AI-Native Nigerian Payment Infrastructure Â· Built for SQUADCO 3.0 Hackathon**

[![FastAPI](https://img.shields.io/badge/FastAPI-0.115-009688?logo=fastapi)](https://fastapi.tiangolo.com/)
[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-6.0-3178C6?logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-4.0-06B6D4?logo=tailwindcss)](https://tailwindcss.com/)
[![Squad](https://img.shields.io/badge/Powered%20by-Squad-orange)](https://squadco.com/)

---

## What is AMO?

AMO is a **full-stack Nigerian fintech platform** that reimagines how money moves. Every transaction passes through a real-time **AI Fraud Shield** before processing â€” blocking suspicious activity in 1.2 seconds, not after the fact.

Built on Squad's production-grade payment infrastructure, AMO provisions real **GTBank virtual accounts**, executes NIP-compliant bank transfers, and maintains a full audit trail with per-transaction risk scores.

**This is not a mockup. This is production-grade fintech.**

---

## Architecture

```
AMO/
â”œâ”€â”€ backend/
â”‚   â””â”€â”€ app/
â”‚       â”œâ”€â”€ api/routers/transfers.py     â† All payment endpoints
â”‚       â”œâ”€â”€ services/squad_client.py     â† Squad API integration
â”‚       â”œâ”€â”€ services/fraud_engine.py     â† AI risk scoring (7 modules)
â”‚       â”œâ”€â”€ schemas/models.py            â† SQLAlchemy ORM (Wallet, Transaction)
â”‚       â””â”€â”€ core/                        â† Config + DB setup
â”‚
â””â”€â”€ frontend/
    â””â”€â”€ src/
        â”œâ”€â”€ pages/                       â† Landing, Dashboard, Send, History
        â”œâ”€â”€ components/ui/               â† shadcn-style component library
        â”œâ”€â”€ components/blocks/           â† Feature sections (Gallery, Tabs, etc.)
        â”œâ”€â”€ api/client.ts                â† Type-safe API client
        â””â”€â”€ hooks/useWallet.ts           â† Wallet state (localStorage)
```

---

## Core Features

### ðŸ›¡ï¸ AI Fraud Shield
Every transaction triggers a 7-module parallel risk analysis:
- Velocity checks Â· Amount anomaly detection Â· Blacklist scanning
- Pattern matching Â· Network analysis Â· Time-of-day risk Â· Recipient profiling

Risk scores â‰¥ 0.7 â†’ **Hard blocked instantly.** Analysis time: **1.2 seconds.**

### âš¡ Instant Transfers
- Squad NIP-compliant payouts to all 25+ Nigerian banks
- Settles in **< 3 seconds** Â· Full Squad reference tracking
- Atomic balance updates with DB rollback on failure

### ðŸ¦ Virtual Accounts
- Real **GTBank** virtual accounts via Squad API Â· NUBAN-compliant 10-digit numbers
- Instantly receivable â€” deposit from any Nigerian bank account

### ðŸ“Š Complete Audit Trail
- Last 20 transactions with AI risk scores, fraud decisions, Squad references

---

## API Reference

**Base URL**: `http://localhost:8000`

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/v1/transactions/receive` | Create wallet + virtual account |
| `POST` | `/api/v1/transactions/send` | Send money with AI fraud scan |
| `GET`  | `/api/v1/transactions/history/{account}` | Transaction history (last 20) |
| `GET`  | `/api/v1/transactions/balance/{account}` | Live balance check |
| `GET`  | `/` | Health check |

### Create Wallet
```http
POST /api/v1/transactions/receive
Content-Type: application/json

{
  "full_name": "Adaeze Okafor",
  "email": "adaeze@example.com"
}
```
```json
{
  "status": "success",
  "account_number": "0123456789",
  "bank_name": "GTBank",
  "starting_balance": 150000.0
}
```

### Send Money
```http
POST /api/v1/transactions/send
Content-Type: application/json

{
  "amount": 5000,
  "sender_account": "0123456789",
  "nip_code": "058",
  "account_number": "0987654321",
  "account_name": "Chukwuemeka Eze",
  "remark": "Rent payment"
}
```
```json
{
  "status": "success",
  "new_balance": 145000.0,
  "reference": "AMO-20241201-143052-abc123",
  "metrics": {
    "risk_score": 0.12,
    "decision": "APPROVED",
    "explanation": "Transaction cleared all 7 risk modules.",
    "scan_time_ms": 1200.0
  }
}
```

---

## Tech Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| **Backend** | FastAPI (Python 3.11+) | REST API + async processing |
| **Database** | SQLite + SQLAlchemy | Wallet and transaction persistence |
| **Payment** | Squad Co API | Virtual accounts + NIP payouts |
| **AI Engine** | Custom fraud engine | 7-module parallel risk scoring |
| **Frontend** | React 19 + TypeScript | SPA with full type safety |
| **Build** | Vite 8 + React Compiler | Optimized HMR + build |
| **Styling** | Tailwind CSS 4 + shadcn/ui | Design system (orange theme) |
| **Animation** | Motion (Framer) | Orbital timeline + scroll reveals |
| **Routing** | React Router v6 | Client-side SPA routing |

---

## Quick Start

See [INSTALLATION.md](./INSTALLATION.md) for step-by-step setup.

```bash
# Clone and setup
git clone https://github.com/Opeyemi-Builds/AMO.git && cd AMO

# Backend
cd backend && pip install -r requirements.txt
cp ../.env.example ../.env  # Add SQUAD_SECRET_KEY
uvicorn app.main:app --reload --port 8000

# Frontend (new terminal)
cd frontend && npm install && npm run dev
# â†’ http://localhost:5173
```

---

## Hackathon Notes

**Built for**: SQUADCO 3.0 â€” "The Future of Nigerian Payments"

**What makes AMO different:**

1. **Real infrastructure** â€” Squad API integration with actual virtual account provisioning
2. **Fraud-first design** â€” AI shield is the core transaction flow, not an afterthought
3. **Production patterns** â€” Atomic DB transactions, rollback on failure, comprehensive error handling
4. **Full-stack completeness** â€” Landing page, onboarding, dashboard, transfers, history â€” a complete product

**Demo**: Use any name + email. No KYC required. â‚¦150,000 starting balance.

---

## License

MIT â€” Built for SQUADCO 3.0 Hackathon 2026.
