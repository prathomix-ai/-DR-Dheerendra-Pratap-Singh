from fastapi import APIRouter
router=APIRouter()
_pain_maps:dict={"mock-patient":["lower_spine","left_knee"]}
@router.get("/{pid}")
async def get_pain_map(pid:str): return {"regions":_pain_maps.get(pid,[]),"patient_id":pid}
@router.post("/{pid}")
async def set_pain_map(pid:str,data:dict): _pain_maps[pid]=data.get("regions",[]); return {"synced":True}
