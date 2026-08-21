"""Prathomix V2 Refined — FastAPI Backend"""
import os
from contextlib import asynccontextmanager

from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

load_dotenv()

from routers import (
    admin,
    appointments,
    auth,
    caregiver_router,
    dashboard,
    exercises,
    ivr_router,
    ocr_router,
    pain_map_router,
    pdf_router,
    pose,
    prescription_router,
    settings_router,
    sms_router,
    triage,
    whatsapp_router,
)


@asynccontextmanager
async def lifespan(app: FastAPI):
    print("🚀 Prathomix V2 Refined — Initialising…")
    # Heavy caches were moved out of startup so Render does not pay the RAM cost before the first request.
    from services.api_rotator import api_rotator

    print(f"  ✓ API Key Rotator ready — {len(api_rotator.keys)} Gemini key(s) loaded (Feature 17)")
    print("  ✓ ChromaDB RAG will initialize lazily on the first triage request")
    print("  ✓ MediaPipe Pose Service will load per request")
    print("  ✓ TTS feedback keys loaded")
    print("  ✓ Twilio IVR + WhatsApp + SMS ready (Features 9,12,14)")
    print("  ✓ Doctor-Patient Closed Loop ready (Pain Map + OCR + Exercises)")
    print("  ✓ Ghost Admin Route: POST /api/auth/admin/login")
    print("  ✓ Prathomix V2 Backend LIVE on :8000")
    yield
    print("🛑 Prathomix V2 — Shutting down")

app = FastAPI(
    title="Prathomix AI Physiotherapy API V2 Refined",
    version="2.1.0",
    lifespan=lifespan,
    docs_url="/docs",
    redoc_url="/redoc",
)

origins = os.getenv("ALLOWED_ORIGINS", "http://localhost:3000").split(",")
app.add_middleware(CORSMiddleware, allow_origins=origins, allow_credentials=True,
                   allow_methods=["*"], allow_headers=["*"])

app.include_router(auth.router,              prefix="/api/auth",          tags=["Auth"])
app.include_router(triage.router,            prefix="/api/triage",        tags=["AI Triage"])
app.include_router(appointments.router,      prefix="/api/appointments",  tags=["Appointments"])
app.include_router(exercises.router,         prefix="/api/exercises",     tags=["Exercises"])
app.include_router(dashboard.router,         prefix="/api/dashboard",     tags=["Dashboard"])
app.include_router(pose.router,              prefix="/api/pose",          tags=["Pose AI"])
app.include_router(admin.router,             prefix="/api/admin",         tags=["Admin"])
app.include_router(settings_router.router,   prefix="/api/settings",      tags=["Settings"])
app.include_router(pdf_router.router,        prefix="/api/pdf",           tags=["PDF"])
app.include_router(ocr_router.router,        prefix="/api/ocr",           tags=["OCR"])
app.include_router(whatsapp_router.router,   prefix="/api/whatsapp",      tags=["WhatsApp"])
app.include_router(sms_router.router,        prefix="/api/sms",           tags=["SMS"])
app.include_router(ivr_router.router,        prefix="/api/ivr",           tags=["IVR"])
app.include_router(caregiver_router.router,  prefix="/api/caregiver",     tags=["Caregiver"])
app.include_router(pain_map_router.router,   prefix="/api/pain-map",      tags=["Pain Map"])
app.include_router(prescription_router.router,prefix="/api/prescription", tags=["Prescription"])

@app.get("/")
async def root():
    return {"service": "Prathomix AI V2 Refined", "status": "operational",
            "features": 18, "powered_by": "Prathomix", "docs": "/docs"}

@app.get("/health")
async def health():
    return {"status": "healthy", "version": "2.1.0"}
