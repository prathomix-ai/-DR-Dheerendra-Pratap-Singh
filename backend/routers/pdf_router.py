from fastapi import APIRouter
from fastapi.responses import Response
from services.pdf_service import generate_prescription_pdf
router=APIRouter()
EX=[{"name":"Knee Extension","reps":15,"sets":3,"body_part":"Knee"},{"name":"Hip Bridge","reps":12,"sets":3,"body_part":"Hip"},{"name":"Wall Squat","reps":10,"sets":2,"duration_sec":30,"body_part":"Knee"}]
@router.get("/prescription/{pid}")
async def pdf(pid:str):
    data=generate_prescription_pdf({"name":"Rajesh Kumar","phone":"+91 98765 43210","condition":"Knee OA","next_visit":"15 Jul 2025"},EX,"Focus on quad strengthening. Ice after exercises.")
    return Response(content=data,media_type="application/pdf",headers={"Content-Disposition":f"attachment; filename=Prathomix-{pid}.pdf"})
