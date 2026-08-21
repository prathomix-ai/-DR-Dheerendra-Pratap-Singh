import re
from typing import Any, Optional

from fastapi import APIRouter, File, Form, Request, UploadFile
from pydantic import BaseModel

from services.api_rotator import DEFAULT_TRIAGE_SYSTEM_PROMPT, api_rotator
from services.chroma_service import query_rag

router = APIRouter()

SYS = DEFAULT_TRIAGE_SYSTEM_PROMPT

SAFE_FALLBACK = "System is busy right now, but your health is important. Please book a direct appointment with Dr. Dheerendra Pratap Singh."

ANAT = {
    "head": "C1-C7 cervical vertebrae. C1-C2 allow rotation; C3-C7 flexion/extension. Cervicalgia often from muscle tension or disc degeneration.",
    "left_shoulder": "Ball-and-socket joint. Rotator cuff (SITS): Supraspinatus, Infraspinatus, Teres minor, Subscapularis. Impingement = supraspinatus compression under acromion.",
    "lower_spine": "L4-L5 and L5-S1 most common herniation levels. Disc annulus tears → nucleus pulposus bulge → nerve root compression → sciatica.",
    "left_knee": "Medial compartment: MCL, medial meniscus. ACL = primary knee stabilizer. PCL = posterior stability. Patella tracks in femoral groove.",
    "right_knee": "Lateral compartment: LCL, lateral meniscus. IT band friction syndrome common in runners. Patellofemoral pain = anterior knee pain on stairs.",
}


def _clean_text(value: Any) -> str:
    return value.strip() if isinstance(value, str) else ""


def _normalize_text(value: str) -> str:
    return re.sub(r"\s+", " ", value).strip().lower()


def _parse_history(raw_history: Optional[list[Any]]) -> list[dict[str, str]]:
    parsed: list[dict[str, str]] = []
    for item in raw_history or []:
        if not isinstance(item, dict):
            continue
        role = str(item.get("role", "")).strip().lower()
        if role in {"assistant", "ai", "model"}:
            role = "assistant"
        elif role != "user":
            continue

        content = _clean_text(item.get("content"))
        if not content:
            continue

        parsed.append({"role": role, "content": content})

    return parsed


def _extract_latest_user_message(history: list[dict[str, str]], fallback: str) -> tuple[list[dict[str, str]], str]:
    latest_message = _clean_text(fallback)
    if history and history[-1]["role"] == "user":
        latest_message = history[-1]["content"] or latest_message
        history = history[:-1]
    return history, latest_message


def _build_prompt(latest_message: str, region: str, language: str, rag_ctx: str, anat_ctx: str) -> str:
    return f"""Analyze the latest user message first: {latest_message}

Patient language: {language}
Region: {region or 'general'}

RAG context:
{rag_ctx}

Anatomy context:
{anat_ctx or 'No region-specific anatomy context.'}

Response rules:
- Acknowledge the latest user message first.
- Never repeat the greeting introduction.
- Never repeat the same sentence template twice in a row.
- Keep it under 2-3 short sentences.
- Use warm Hinglish.
- If the case is risky, ambiguous, severe, or critical, say exactly: This requires physical evaluation. Dr. Dheerendra Pratap Singh will examine this personally during your appointment.
- Do not prescribe medicine or diagnose with certainty."""


@router.post("/chat")
async def chat(req: Request):
    try:
        payload = await req.json()
    except Exception:
        payload = {}

    region = _clean_text(payload.get("region"))
    language = _clean_text(payload.get("language")) or "en"
    system_prompt = _clean_text(payload.get("system_prompt")) or SYS
    raw_messages = payload.get("messages")
    if raw_messages is None:
        raw_messages = payload.get("history")

    messages = _parse_history(raw_messages if isinstance(raw_messages, list) else [])
    message_text = _clean_text(payload.get("message"))
    latest_message = message_text
    if messages and messages[-1]["role"] == "user" and messages[-1]["content"]:
        latest_message = messages[-1]["content"]
        messages = messages[:-1]

    if not latest_message:
        return {
            "reply": SAFE_FALLBACK,
            "navigate_to": "/appointments",
            "suggestions": ["Book appointment", "View exercises", "Describe symptoms"],
            "rag_sources": 0,
            "powered_by": "Prathomix Multi-Agent AI",
        }

    try:
        rag = await query_rag(latest_message, 3, region or None)
        rag_ctx = "\n".join([d["text"] for d in rag]) if rag else "Use general physiotherapy knowledge."
        anat_ctx = ANAT.get(region, "")

        prompt = _build_prompt(latest_message, region, language, rag_ctx, anat_ctx)
        reply = await api_rotator.generate(prompt=prompt, system=system_prompt, max_tokens=220, history=messages)

        previous_ai = next((turn["content"] for turn in reversed(messages) if turn["role"] == "assistant"), "")
        if previous_ai and _normalize_text(reply) == _normalize_text(previous_ai):
            repair_prompt = prompt + "\n\nThe previous answer repeated the earlier template. Rewrite it with fresh wording, no greeting, and directly acknowledge the latest user message."
            reply = await api_rotator.generate(prompt=repair_prompt, system=system_prompt, max_tokens=180, history=messages)

        nav = None
        match = re.search(r"\[NAVIGATE:([^\]]+)\]", reply)
        if match:
            nav = match.group(1)
            reply = reply.replace(match.group(0), "").strip()

        if not reply or (len(messages) > 1 and _normalize_text(reply).startswith("namaste")):
            reply = SAFE_FALLBACK
            nav = "/appointments"

        suggestions = (
            ["What causes this pain?", "Best exercises for me", "How long to recover?", "Book appointment"]
            if not region
            else [
                f"Why does my {region.replace('_', ' ')} hurt?",
                "Best exercises",
                "Book appointment",
                "How serious is this?",
            ]
        )

        return {
            "reply": reply,
            "navigate_to": nav,
            "suggestions": suggestions,
            "rag_sources": len(rag),
            "powered_by": "Prathomix Multi-Agent AI",
        }
    except Exception:
        return {
            "reply": SAFE_FALLBACK,
            "navigate_to": "/appointments",
            "suggestions": ["Book appointment", "View exercises", "Describe symptoms"],
            "rag_sources": 0,
            "powered_by": "Prathomix Multi-Agent AI",
        }


@router.post("/voice")
async def voice(audio: UploadFile = File(...), language: str = Form("en")):
    mocks = {
        "hi": "मुझे घुटने में बहुत दर्द है, चलने में तकलीफ हो रही है",
        "hinglish": "Mera knee bohot dard kar raha hai, 3 din se walk nahi ho rahi",
        "en": "I have severe knee pain and difficulty walking for the past 3 days",
        "ta": "என் முழங்காலில் மிகுந்த வலி இருக்கிறது",
    }
    return {
        "transcript": mocks.get(language, mocks["en"]),
        "language": language,
        "confidence": 0.94,
        "powered_by": "Prathomix Voice AI",
    }
