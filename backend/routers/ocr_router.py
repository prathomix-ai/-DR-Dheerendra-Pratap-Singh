from fastapi import APIRouter,UploadFile,File
from services.ocr_service import extract_prescription
router=APIRouter()
@router.post("/prescription")
async def ocr(file:UploadFile=File(...)): return await extract_prescription(await file.read(),file.content_type or "image/jpeg")
