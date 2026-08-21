from fastapi import APIRouter
from pydantic import BaseModel
from services.mediapipe_service import analyze_pose,analyze_gait
router=APIRouter()
class PoseReq(BaseModel): image:str; exercise_name:str
@router.post("/analyze")
async def analyze(req:PoseReq): return await analyze_pose(req.image,req.exercise_name)
@router.get("/exercises/{name}")
async def ref(name:str): return {"name":name,"cues":["Keep core tight","Track knee over toe","Neutral spine"]}
