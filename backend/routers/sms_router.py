from fastapi import APIRouter
from pydantic import BaseModel
from services.twilio_service import send_sms
router=APIRouter()
class SMSReq(BaseModel): to:str; message:str
@router.post("/send")
async def send(req:SMSReq): return await send_sms(req.to,req.message)
@router.post("/fallback")
async def fallback(phone:str,message:str): return await send_sms(phone,f"[Prathomix] {message}\n— Powered by Prathomix AI")
