from fastapi import APIRouter
from pydantic import BaseModel
from typing import Optional
router=APIRouter()
EX=[{"id":"ex1","name":"Knee Extension","reps":15,"sets":3,"body_part":"Knee","difficulty":"easy","completed":False,"instructions":["Sit","Extend","Hold 3s","Lower"],"youtube_url":"https://www.youtube.com/watch?v=YyvelsModelling"},{"id":"ex2","name":"Hip Bridge","reps":12,"sets":3,"body_part":"Hip","difficulty":"medium","completed":True,"accuracy_score":88,"instructions":["Lie","Lift","Squeeze","Hold"],"youtube_url":"https://www.youtube.com/watch?v=wPM8icPu6H8"}]
class CompleteReq(BaseModel): accuracy_score:Optional[float]=None; reps_done:Optional[int]=None
@router.get("/{pid}")
async def get_ex(pid:str): return {"exercises":EX,"patient_id":pid}
@router.post("/{eid}/complete")
async def complete(eid:str,req:CompleteReq): return {"exercise_id":eid,"completed":True,"accuracy_score":req.accuracy_score}
