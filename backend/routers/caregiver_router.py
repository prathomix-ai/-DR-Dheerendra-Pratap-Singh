from fastapi import APIRouter,Depends
from pydantic import BaseModel
from typing import Optional
from routers.auth import get_current_user
import uuid
router=APIRouter()
class CGReq(BaseModel): name:str; phone:str; relation:str; email:Optional[str]=""
@router.get("")
async def list_cg(u=Depends(get_current_user)): return {"caregivers":[{"id":"cg1","name":"Meera Sharma","phone":"+919876543210","relation":"Spouse","access_level":"view"}]}
@router.post("")
async def add(req:CGReq,u=Depends(get_current_user)): return {"caregiver":{"id":str(uuid.uuid4())[:8],"name":req.name,"phone":req.phone,"relation":req.relation},"invite_sent":True}
@router.delete("/{cid}")
async def remove(cid:str,u=Depends(get_current_user)): return {"message":f"Removed {cid}"}
