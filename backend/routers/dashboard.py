from fastapi import APIRouter
router=APIRouter()
@router.get("/{pid}")
async def dashboard(pid:str): return {"patient_id":pid,"streak":7,"completion":68,"next_appt":"2025-07-10 10:00 AM","doctor":"Dr. Dheerendra Pratap Singh ","progress":{"mobility":75,"strength":62,"pain_reduction":81,"overall":68},"powered_by":"Prathomix"}
