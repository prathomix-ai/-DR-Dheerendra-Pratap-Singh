from fastapi import APIRouter,Depends,UploadFile,File,Form
from pydantic import BaseModel
from routers.auth import require_admin
from services.twilio_service import send_whatsapp,send_sms
from services.ocr_service import extract_prescription
router=APIRouter()
class MsgReq(BaseModel): patient_id:str; message:str; channel:str="whatsapp"
class ExReq(BaseModel): patient_id:str; exercises:list
class PainMapReq(BaseModel): patient_id:str; regions:list
PS=[{"id":"p1","name":"Rajesh Kumar","phone":"+919876543210","condition":"Knee OA","completion_rate":88,"accuracy_score":91,"status":"active"},{"id":"p2","name":"Priya Sharma","phone":"+918765432109","condition":"Frozen Shoulder","completion_rate":62,"accuracy_score":74,"status":"pending"},{"id":"p3","name":"Arjun Singh","phone":"+917654321098","condition":"Lumbar Disc","completion_rate":95,"accuracy_score":97,"status":"active"},{"id":"p4","name":"Sunita Devi","phone":"+916543210987","condition":"Cervical Pain","completion_rate":21,"accuracy_score":48,"status":"critical"}]
# In-memory store (use Supabase in production)
_pain_maps:dict={}; _prescriptions:dict={}
@router.get("/patients")
async def patients(a=Depends(require_admin)): return {"patients":PS}
@router.get("/analytics")
async def analytics(a=Depends(require_admin)): return {"total_patients":124,"active_today":38,"avg_accuracy":82,"alerts":3,"rag_queries_today":147}
@router.get("/mediapipe-scores")
async def scores(a=Depends(require_admin)): return {"scores":[{"patient_id":p["id"],"name":p["name"],"accuracy":p["accuracy_score"],"condition":p["condition"]} for p in PS]}
@router.post("/message")
async def message(req:MsgReq,a=Depends(require_admin)):
    p=next((x for x in PS if x["id"]==req.patient_id),None)
    if not p: from fastapi import HTTPException; raise HTTPException(404,"Not found")
    r=await send_whatsapp(p["phone"],req.message) if req.channel=="whatsapp" else await send_sms(p["phone"],req.message)
    return {"sent":True,"channel":req.channel,"result":r}
@router.post("/assign-exercise")
async def assign(req:ExReq,a=Depends(require_admin)): return {"assigned":True,"patient_id":req.patient_id,"count":len(req.exercises)}
@router.post("/pain-map")
async def pain_map(req:PainMapReq,a=Depends(require_admin)): _pain_maps[req.patient_id]=req.regions; return {"synced":True,"patient_id":req.patient_id,"regions":req.regions}
@router.post("/prescription/upload")
async def upload_rx(patient_id:str=Form(...),file:UploadFile=File(...),a=Depends(require_admin)):
    data=await file.read(); result=await extract_prescription(data,file.content_type or "image/jpeg"); _prescriptions[patient_id]=result; return result
@router.get("/exercise-library")
async def ex_lib(a=Depends(require_admin)): return {"exercises":[{"id":"l1","name":"Knee Extension","body":"Knee","url":"https://www.youtube.com/watch?v=YyvelsModelling"},{"id":"l2","name":"Hip Bridge","body":"Hip","url":"https://www.youtube.com/watch?v=wPM8icPu6H8"}]}
