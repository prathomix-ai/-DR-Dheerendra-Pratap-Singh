from fastapi import APIRouter
router=APIRouter()
_prescriptions:dict={}
@router.get("/{pid}")
async def get_rx(pid:str): return _prescriptions.get(pid,None)
