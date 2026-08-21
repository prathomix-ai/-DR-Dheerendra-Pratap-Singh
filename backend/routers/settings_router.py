import json
from pathlib import Path
from threading import Lock
from typing import Any, Optional

from fastapi import APIRouter
from pydantic import BaseModel

router = APIRouter()

SETTINGS_FILE = Path(__file__).resolve().parents[1] / "data" / "user_settings.json"
SETTINGS_FILE.parent.mkdir(parents=True, exist_ok=True)
SETTINGS_LOCK = Lock()


class SR(BaseModel):
	language: Optional[str] = "en"
	voice_enabled: Optional[bool] = True
	sms_notif: Optional[bool] = True
	wa_notif: Optional[bool] = True
	dark_mode: Optional[bool] = False


DEFAULT_SETTINGS = {"language": "en", "voice_enabled": True, "sms_notif": True, "wa_notif": True, "dark_mode": False}


def _load_store() -> dict[str, Any]:
	if not SETTINGS_FILE.exists():
		return {}

	try:
		return json.loads(SETTINGS_FILE.read_text(encoding="utf-8"))
	except json.JSONDecodeError:
		return {}


def _save_store(store: dict[str, Any]) -> None:
	SETTINGS_FILE.write_text(json.dumps(store, indent=2, ensure_ascii=False), encoding="utf-8")


@router.get("/{uid}")
async def get(uid: str):
	with SETTINGS_LOCK:
		store = _load_store()
		settings = {**DEFAULT_SETTINGS, **store.get(uid, {})}

	return {"user_id": uid, "settings": settings}


@router.put("/{uid}")
async def update(uid: str, s: SR):
	updated = s.model_dump()

	with SETTINGS_LOCK:
		store = _load_store()
		current = {**DEFAULT_SETTINGS, **store.get(uid, {})}
		current.update(updated)
		store[uid] = current
		_save_store(store)

	return {"user_id": uid, "updated": True, "settings": current}
