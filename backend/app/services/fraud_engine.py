import httpx
from app.core.config import settings

async def run_fraud_scan(transaction_data: dict) -> dict:
    """Call the external AI fraud engine and normalize the response."""
    try:
        async with httpx.AsyncClient(verify=False, timeout=15) as client:
            response = await client.post(settings.AI_ENGINE_URL, json=transaction_data)
            response.raise_for_status()
            result = response.json()
    except httpx.HTTPError as exc:
        print(f"AI ENGINE ERROR: {str(exc)}")
        return {
            "is_safe": False,
            "risk_score": 0.99,
            "decision": "RED",
            "modules": {},
            "explanation": "AI engine unavailable or returned an invalid response.",
        }
    except ValueError as exc:
        print(f"AI ENGINE JSON ERROR: {str(exc)}")
        return {
            "is_safe": False,
            "risk_score": 0.99,
            "decision": "RED",
            "modules": {},
            "explanation": "AI engine returned malformed JSON.",
        }

    return {
        "is_safe": bool(result.get("is_safe", result.get("risk_score", 0.0) < 0.65)),
        "risk_score": float(result.get("risk_score", 0.0)),
        "decision": str(result.get("decision", "APPROVED")).upper(),
        "modules": result.get("modules", {}),
        "explanation": result.get("explanation", ""),
        "raw_response": result,
    }
