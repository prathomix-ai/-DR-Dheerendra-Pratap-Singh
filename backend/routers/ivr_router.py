from fastapi import APIRouter,Form
from fastapi.responses import Response
from pydantic import BaseModel
from services.twilio_service import initiate_ivr_call
router=APIRouter()
class IVRReq(BaseModel): to:str; patient_name:str; appointment_time:str
@router.post("/call")
async def call(req:IVRReq): return await initiate_ivr_call(req.to,req.patient_name,req.appointment_time)
@router.post("/gather")
async def gather(Digits:str=Form("")):
    from twilio.twiml.voice_response import VoiceResponse; r=VoiceResponse()
    msgs={"1":"Appointment confirmed. Dhanyavaad!","2":"Please call to reschedule. Dhanyavaad!","3":"Appointment cancelled. Dhanyavaad!"}
    r.say(msgs.get(Digits,"Invalid input. Goodbye!"),voice="Polly.Aditi",language="hi-IN")
    return Response(content=str(r),media_type="application/xml")
