from fastapi import APIRouter
from pydantic import BaseModel
from typing import Optional
from services.twilio_service import send_whatsapp
import uuid
router=APIRouter()
class BookReq(BaseModel): mode:str; date:str; slot:str; patient_name:str; phone:str; notes:Optional[str]=""
@router.get("")
async def list_appts(): return {"appointments":[]}
@router.post("")
async def book(req:BookReq):
    aid=str(uuid.uuid4())[:8]
    await send_whatsapp(req.phone,f"✅ Confirmed!\n📅 {req.date} at {req.slot}\n👨‍⚕️ Dr. Dheerendra Pratap Singh  · {req.mode}\n📋 Ref: #{aid}\n— Powered by Prathomix")
    return {"appointment":{"id":aid,"status":"confirmed"},"whatsapp_sent":True}
@router.get("/slots")
async def slots(date:str):
    booked=["09:30 AM","11:00 AM","03:00 PM","04:30 PM"]
    all_s=["09:00 AM","09:30 AM","10:00 AM","10:30 AM","11:00 AM","11:30 AM","02:00 PM","02:30 PM","03:00 PM","03:30 PM","04:00 PM","04:30 PM"]
    return {"slots":[{"time":s,"available":s not in booked} for s in all_s]}
@router.delete("/{aid}")
async def cancel(aid:str): return {"message":f"Cancelled {aid}"}
