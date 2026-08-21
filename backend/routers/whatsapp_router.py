from fastapi import APIRouter,Request
from pydantic import BaseModel
from services.twilio_service import send_whatsapp
router=APIRouter()
class WAReq(BaseModel): to:str; message:str
@router.post("/send")
async def send(req:WAReq): return await send_whatsapp(req.to,req.message)
@router.post("/webhook")
async def webhook(request:Request):
    form=await request.form(); from_=form.get("From","")
    await send_whatsapp(from_,"🙏 Namaste! Prathomix mein aapka swagat hai.\nType TRIAGE, BOOK, or EXERCISE\n— Powered by Prathomix AI")
    return {"status":"ok"}
