import asyncio
import os
import time
"""Feature 17 — Advanced Multi-Key API Rotator (Gemini keys round-robin)"""
from typing import Any, List
import httpx

DEFAULT_TRIAGE_SYSTEM_PROMPT = (
    "You are the AI Assistant for Prathomix Physio. RULE 1: NEVER repeat your intro greeting. RULE 2: Answer directly in 1-2 short sentences. RULE 3: Do not hallucinate features or make up medical advice. Always guide users to book a clinic visit."
)

class APIRotator:
    """
    Rotates through multiple Gemini API keys to prevent rate limiting.
    GEMINI_KEYS env var: comma-separated list of keys.
    Falls back to HuggingFace if all Gemini keys fail.
    """
    def __init__(self):
        raw = os.getenv("GEMINI_KEYS", os.getenv("GEMINI_API_KEY", ""))
        self.keys: List[str] = [k.strip() for k in raw.split(",") if k.strip()]
        self.hf_key = os.getenv("HUGGINGFACE_API_KEY", "")
        # Per-key tracking
        self.idx             = 0
        self.error_counts    = {k: 0 for k in self.keys}
        self.cooldown_until  = {k: 0.0 for k in self.keys}
        self.call_counts     = {k: 0 for k in self.keys}
        self.hf_calls        = 0
        self.hf_errors       = 0
        print(f"    APIRotator: {len(self.keys)} Gemini key(s) · HuggingFace: {'yes' if self.hf_key else 'no'}")

    def _next_key(self) -> str | None:
        """Round-robin key selection, skipping keys in cooldown or with too many errors."""
        now = time.time()
        for _ in range(len(self.keys)):
            k = self.keys[self.idx % len(self.keys)]
            self.idx += 1
            if self.cooldown_until.get(k, 0) > now:
                continue
            if self.error_counts.get(k, 0) >= 5:
                continue
            return k
        return None

    def _normalize_history(self, history: list[dict[str, str]] | None) -> list[dict[str, str]]:
        normalized: list[dict[str, str]] = []
        for turn in history or []:
            if not isinstance(turn, dict):
                continue
            role = str(turn.get("role", "")).strip().lower()
            if role in {"assistant", "ai", "model"}:
                role = "assistant"
            elif role != "user":
                continue

            content = turn.get("content", "")
            if not isinstance(content, str):
                continue
            content = content.strip()
            if not content:
                continue

            normalized.append({"role": role, "content": content})
        return normalized

    def _to_gemini_history(self, history: list[dict[str, str]]) -> list[dict[str, Any]]:
        return [
            {
                "role": "user" if turn["role"] == "user" else "model",
                "parts": [turn["content"]],
            }
            for turn in history
        ]

    def _history_to_text(self, history: list[dict[str, str]]) -> str:
        if not history:
            return "None"
        return "\n".join(
            f"{'Patient' if turn['role'] == 'user' else 'AI'}: {turn['content']}"
            for turn in history
        )

    async def generate(
        self,
        prompt: str,
        system: str = "",
        max_tokens: int = 1024,
        history: list[dict[str, str]] | None = None,
    ) -> str:
        """Try available Gemini keys in rotation, fallback to HuggingFace."""
        normalized_history = self._normalize_history(history)
        if self.keys:
            key = self._next_key()
            if key:
                try:
                    result = await self._call_gemini(key, prompt, system, max_tokens, normalized_history)
                    self.call_counts[key] = self.call_counts.get(key, 0) + 1
                    self.error_counts[key] = 0  # reset on success
                    return result
                except Exception as e:
                    err_str = str(e)
                    self.error_counts[key] = self.error_counts.get(key, 0) + 1
                    if "429" in err_str or "RATE" in err_str.upper():
                        # Cooldown this key for 60 seconds
                        self.cooldown_until[key] = time.time() + 60
                        print(f"    Key {key[:12]}… rate-limited — cooling 60s")
                    else:
                        print(f"    Gemini error ({key[:12]}…): {e}")

        # HuggingFace fallback
        if self.hf_key:
            try:
                self.hf_calls += 1
                return await self._call_hf(prompt, system, max_tokens, normalized_history)
            except Exception as e:
                self.hf_errors += 1
                print(f"    HuggingFace error: {e}")

        return self._mock(prompt)

    async def _call_gemini(
        self,
        key: str,
        prompt: str,
        system: str,
        max_tokens: int,
        history: list[dict[str, str]] | None = None,
    ) -> str:
        import google.generativeai as genai

        genai.configure(api_key=key)
        model = genai.GenerativeModel(
            "gemini-1.5-flash",
            system_instruction=system or DEFAULT_TRIAGE_SYSTEM_PROMPT,
        )

        generation_config = {"max_output_tokens": max_tokens, "temperature": 0.1}
        if history:
            chat = model.start_chat(history=self._to_gemini_history(history))
            r = await asyncio.to_thread(chat.send_message, prompt, generation_config=generation_config)
            return r.text

        r = await asyncio.to_thread(model.generate_content, prompt, generation_config=generation_config)
        return r.text

    async def _call_hf(
        self,
        prompt: str,
        system: str,
        max_tokens: int,
        history: list[dict[str, str]] | None = None,
    ) -> str:
        url = "https://api-inference.huggingface.co/models/mistralai/Mistral-7B-Instruct-v0.3"
        transcript = self._history_to_text(history or [])
        full = f"[INST] {system or DEFAULT_TRIAGE_SYSTEM_PROMPT}\n\nConversation history:\n{transcript}\n\nLatest user message:\n{prompt} [/INST]"
        async with httpx.AsyncClient(timeout=30) as c:
            r = await c.post(url, headers={"Authorization": f"Bearer {self.hf_key}"},
                             json={"inputs": full, "parameters": {"max_new_tokens": max_tokens, "temperature": 0.1}})
            d = r.json()
            if isinstance(d, list) and d:
                return d[0].get("generated_text", "").replace(full, "").strip()
        raise Exception("HuggingFace empty response")

    def _mock(self, prompt: str) -> str:
        return (
            "System is busy right now, but your health is important. Please book a direct appointment with Dr. Dheerendra Pratap Singh."
        )

    def stats(self) -> dict:
        return {
            "keys_active": len(self.keys),
            "call_counts": self.call_counts,
            "error_counts": self.error_counts,
            "hf_calls": self.hf_calls,
            "hf_errors": self.hf_errors,
        }

api_rotator = APIRotator()
