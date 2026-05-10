"""
AMO AI Fraud Shield — 7-module rule-based risk engine.

Each module independently scores a slice of the transaction and returns:
  • score   — risk contribution in [0.0, 1.0]
  • verdict — human-readable one-liner
  • detail  — machine-friendly short label

The composite score is a weighted sum, clamped to [0.0, 1.0].

Decision thresholds
-------------------
  < 0.35  → APPROVED  (green)
  0.35–0.65 → FLAGGED   (yellow — still executes but highlighted)
  > 0.65  → BLOCKED   (red — transaction rejected)
"""

import asyncio
import logging
import time
from datetime import datetime, timezone

log = logging.getLogger(__name__)

# ---------------------------------------------------------------------------
# Module weights  (must sum to 1.0)
# ---------------------------------------------------------------------------
_WEIGHTS = {
    "amount_threshold":  0.25,
    "balance_drain":     0.20,
    "round_amount":      0.10,
    "late_night":        0.10,
    "remark_keywords":   0.15,
    "account_pattern":   0.10,
    "velocity_hint":     0.10,
}

# ---------------------------------------------------------------------------
# Individual modules
# ---------------------------------------------------------------------------

def _module_amount_threshold(amount: float) -> dict:
    """Large transfers carry higher inherent risk."""
    if amount >= 500_000:
        return {"score": 0.95, "verdict": "Extremely high transfer value (≥ ₦500k)", "detail": "VERY_HIGH_AMOUNT"}
    if amount >= 200_000:
        return {"score": 0.70, "verdict": "High transfer value (≥ ₦200k)", "detail": "HIGH_AMOUNT"}
    if amount >= 100_000:
        return {"score": 0.45, "verdict": "Elevated transfer value (≥ ₦100k)", "detail": "ELEVATED_AMOUNT"}
    if amount >= 50_000:
        return {"score": 0.20, "verdict": "Moderate transfer value (≥ ₦50k)", "detail": "MODERATE_AMOUNT"}
    return {"score": 0.05, "verdict": "Low-risk transfer value", "detail": "LOW_AMOUNT"}


def _module_balance_drain(amount: float, sender_balance: float) -> dict:
    """Transactions that consume most of the sender's balance are suspicious."""
    if sender_balance <= 0:
        return {"score": 0.50, "verdict": "Cannot assess drain ratio (zero balance)", "detail": "UNKNOWN_BALANCE"}
    ratio = amount / sender_balance
    if ratio >= 0.95:
        return {"score": 0.90, "verdict": f"Near-total balance drain ({ratio:.0%})", "detail": "DRAIN_CRITICAL"}
    if ratio >= 0.80:
        return {"score": 0.65, "verdict": f"High balance drain ({ratio:.0%})", "detail": "DRAIN_HIGH"}
    if ratio >= 0.50:
        return {"score": 0.35, "verdict": f"Moderate balance drain ({ratio:.0%})", "detail": "DRAIN_MODERATE"}
    return {"score": 0.05, "verdict": f"Normal balance consumption ({ratio:.0%})", "detail": "DRAIN_NORMAL"}


def _module_round_amount(amount: float) -> dict:
    """
    Perfectly round figures (e.g. 100 000.00) are commonly used in
    social-engineering scams where victims are told to send 'exactly X'.
    """
    kobo = round(amount * 100)
    if kobo % 100_000_00 == 0:   # multiple of 1 000 000
        return {"score": 0.55, "verdict": "Suspiciously round amount (multiple of ₦1M)", "detail": "ROUND_1M"}
    if kobo % 10_000_00 == 0:    # multiple of 100 000
        return {"score": 0.35, "verdict": "Round amount (multiple of ₦100k)", "detail": "ROUND_100K"}
    if kobo % 1_000_00 == 0:     # multiple of 10 000
        return {"score": 0.20, "verdict": "Moderately round amount (multiple of ₦10k)", "detail": "ROUND_10K"}
    if kobo % 100 == 0:          # whole Naira, no kobo
        return {"score": 0.10, "verdict": "Whole-Naira amount", "detail": "ROUND_NAIRA"}
    return {"score": 0.02, "verdict": "Non-round amount — looks organic", "detail": "NOT_ROUND"}


def _module_late_night(hour_utc: int) -> dict:
    """
    Transactions between midnight and 05:00 WAT (UTC+1 → 23:00–04:00 UTC)
    have a higher incidence of fraudulent origin.
    """
    # WAT = UTC+1; adjust hour to West Africa Time
    wat_hour = (hour_utc + 1) % 24
    if 0 <= wat_hour < 2:
        return {"score": 0.80, "verdict": f"Initiated at {wat_hour:02d}:xx WAT (very late night)", "detail": "LATE_NIGHT_SEVERE"}
    if 2 <= wat_hour < 5:
        return {"score": 0.55, "verdict": f"Initiated at {wat_hour:02d}:xx WAT (late night)", "detail": "LATE_NIGHT"}
    if 5 <= wat_hour < 7:
        return {"score": 0.20, "verdict": f"Initiated at {wat_hour:02d}:xx WAT (early morning)", "detail": "EARLY_MORNING"}
    return {"score": 0.02, "verdict": f"Normal business hour ({wat_hour:02d}:xx WAT)", "detail": "BUSINESS_HOURS"}


def _module_remark_keywords(remark: str) -> dict:
    """Scan the transaction narration for social-engineering red flags."""
    remark_lower = remark.lower()

    HIGH_RISK_TERMS = [
        "urgent", "emergency", "invest", "profit", "doubl",
        "crypto", "bitcoin", "forex", "ponzi", "lottery", "prize",
        "winner", "claim", "refund my", "send back", "otp", "pin",
    ]
    MEDIUM_RISK_TERMS = [
        "loan", "debt", "payment for", "business deal", "contract",
        "offshore", "overseas", "transfer back",
    ]

    for term in HIGH_RISK_TERMS:
        if term in remark_lower:
            return {
                "score": 0.75,
                "verdict": f"High-risk keyword detected in remark: '{term}'",
                "detail": "KEYWORD_HIGH_RISK",
            }
    for term in MEDIUM_RISK_TERMS:
        if term in remark_lower:
            return {
                "score": 0.45,
                "verdict": f"Medium-risk keyword in remark: '{term}'",
                "detail": "KEYWORD_MEDIUM_RISK",
            }
    return {"score": 0.05, "verdict": "No suspicious keywords in remark", "detail": "REMARK_CLEAN"}


def _module_account_pattern(account_number: str) -> dict:
    """
    Detect obviously fake or test account numbers:
    — all same digit (e.g. 1111111111)
    — sequential run  (e.g. 0123456789)
    """
    if len(set(account_number)) == 1:
        return {"score": 0.90, "verdict": "Account number is all identical digits", "detail": "ACCT_ALL_SAME"}
    digits = [int(d) for d in account_number]
    diffs = [digits[i + 1] - digits[i] for i in range(len(digits) - 1)]
    if all(d == 1 for d in diffs) or all(d == -1 for d in diffs):
        return {"score": 0.80, "verdict": "Account number is a sequential run", "detail": "ACCT_SEQUENTIAL"}
    # Low entropy check — fewer than 4 unique digits
    if len(set(account_number)) < 4:
        return {"score": 0.40, "verdict": "Account number has very low entropy", "detail": "ACCT_LOW_ENTROPY"}
    return {"score": 0.05, "verdict": "Account number pattern looks normal", "detail": "ACCT_NORMAL"}


def _module_velocity_hint(sender_account: str) -> dict:
    """
    In production this would query the last N transactions in the DB within
    a rolling window.  In this demo we flag accounts that start with '00'
    (Squad sandbox mock accounts) to simulate a velocity hit.
    """
    if sender_account.startswith("00"):
        return {
            "score": 0.30,
            "verdict": "Sender account matches sandbox velocity pattern",
            "detail": "VELOCITY_SANDBOX",
        }
    return {"score": 0.05, "verdict": "No abnormal transaction velocity detected", "detail": "VELOCITY_NORMAL"}


# ---------------------------------------------------------------------------
# Composite engine
# ---------------------------------------------------------------------------

async def run_fraud_scan(transaction_data: dict) -> dict:
    """
    Run all 7 fraud modules against the transaction payload.

    Parameters
    ----------
    transaction_data : dict
        Must contain at minimum: amount, sender_account, account_number,
        remark.  Optionally: sender_balance (float).

    Returns
    -------
    dict with keys:
        is_safe       — bool
        risk_score    — float [0.0, 1.0]
        decision      — "APPROVED" | "FLAGGED" | "BLOCKED"
        explanation   — human-readable summary string
        modules       — dict of per-module results
        scan_time_ms  — float
    """
    t0 = time.perf_counter()

    amount         = float(transaction_data.get("amount", 0))
    sender_account = str(transaction_data.get("sender_account", ""))
    acct_number    = str(transaction_data.get("account_number", ""))
    remark         = str(transaction_data.get("remark", ""))
    sender_balance = float(transaction_data.get("sender_balance", 0))
    now_utc        = datetime.now(timezone.utc)

    # Small artificial delay so the frontend scanning animation is visible
    await asyncio.sleep(0.8)

    # Run all modules
    modules = {
        "amount_threshold": _module_amount_threshold(amount),
        "balance_drain":    _module_balance_drain(amount, sender_balance),
        "round_amount":     _module_round_amount(amount),
        "late_night":       _module_late_night(now_utc.hour),
        "remark_keywords":  _module_remark_keywords(remark),
        "account_pattern":  _module_account_pattern(acct_number),
        "velocity_hint":    _module_velocity_hint(sender_account),
    }

    # Weighted composite score
    composite = sum(
        modules[key]["score"] * _WEIGHTS[key]
        for key in _WEIGHTS
    )
    risk_score = min(1.0, max(0.0, composite))

    # Decision thresholds
    if risk_score >= 0.65:
        decision = "BLOCKED"
        is_safe  = False
    elif risk_score >= 0.35:
        decision = "FLAGGED"
        is_safe  = True   # Execute but alert user
    else:
        decision = "APPROVED"
        is_safe  = True

    # Build a concise explanation from the highest-scoring module
    worst_module = max(modules, key=lambda k: modules[k]["score"])
    worst_score  = modules[worst_module]["score"]
    if worst_score > 0.5:
        explanation = f"Primary risk signal: {modules[worst_module]['verdict']}."
    else:
        explanation = "All modules passed — transaction profile looks normal."

    scan_time_ms = round((time.perf_counter() - t0) * 1000, 2)

    log.info(
        "Fraud scan complete | score=%.3f decision=%s scan_ms=%.1f",
        risk_score, decision, scan_time_ms,
    )

    return {
        "is_safe":     is_safe,
        "risk_score":  round(risk_score, 4),
        "decision":    decision,
        "explanation": explanation,
        "modules":     modules,
        "scan_time_ms": scan_time_ms,
    }
