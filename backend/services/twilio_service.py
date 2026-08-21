import os
"""Features 9,12,13,14 — Twilio Services"""
ACCOUNT_SID = os.getenv("TWILIO_ACCOUNT_SID", "")
AUTH_TOKEN  = os.getenv("TWILIO_AUTH_TOKEN", "")
FROM_NUMBER = os.getenv("TWILIO_FROM_NUMBER", "+10000000000")
WA_FROM     = os.getenv("TWILIO_WHATSAPP_FROM", "whatsapp:+14155238886")
CLINIC      = os.getenv("CLINIC_NAME", "Prathomix Physiotherapy")

def get_client():
    if ACCOUNT_SID and AUTH_TOKEN:
        from twilio.rest import Client
        return Client(ACCOUNT_SID, AUTH_TOKEN)
    return None

async def send_sms(to: str, body: str) -> dict:
    c = get_client()
    if not c: return {"status": "mock", "to": to, "powered_by": "Prathomix"}
    m = c.messages.create(body=body, from_=FROM_NUMBER, to=to)
    return {"status": "sent", "sid": m.sid}

async def send_whatsapp(to: str, body: str) -> dict:
    c = get_client()
    wa = f"whatsapp:{to}" if not to.startswith("whatsapp:") else to
    if not c: return {"status": "mock", "to": wa, "powered_by": "Prathomix"}
    m = c.messages.create(body=body, from_=WA_FROM, to=wa)
    return {"status": "sent", "sid": m.sid}

async def initiate_ivr_call(to: str, name: str, appt_time: str) -> dict:
    c = get_client()
    if not c: return {"status": "mock_call", "to": to}
    from twilio.twiml.voice_response import VoiceResponse, Gather
    r = VoiceResponse(); g = Gather(num_digits=1, action="/api/ivr/gather", method="POST")
    g.say(f"Namaste {name}! {CLINIC} se call aa raha hai. Dr. Dheerendra Pratap Singh  ke saath aapka appointment {appt_time} pe hai. 1 press karein confirm ke liye, 2 reschedule ke liye, 3 cancel ke liye.", voice="Polly.Aditi", language="hi-IN")
    r.append(g); r.say("Koi input nahi mila. Dhanyavaad!", voice="Polly.Aditi")
    call = c.calls.create(twiml=str(r), to=to, from_=FROM_NUMBER)
    return {"status": "calling", "sid": call.sid}

async def send_followup(to: str, name: str, days: int, channel: str = "whatsapp") -> dict:
    msg = (f"🙏 Namaste {name}! Dr. Dheerendra Pratap Singh  yaad kar rahe hain. {days} din ho gaye last session ke baad. "
           f"Aaj ka exercise complete karo aur recovery track karo! 💚\n— Powered by Prathomix AI")
    return await send_whatsapp(to, msg) if channel == "whatsapp" else await send_sms(to, msg)
