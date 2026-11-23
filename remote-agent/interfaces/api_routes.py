from fastapi import APIRouter, HTTPException, status
from application.use_cases import RemoteControlUseCase
from pydantic import BaseModel

router = APIRouter()
control_use_case: RemoteControlUseCase = None

class WebBlockRequest(BaseModel):
    url: str

class PingRequest(BaseModel):
    allow: bool

def set_use_case(use_case: RemoteControlUseCase):
    global control_use_case
    control_use_case = use_case

@router.post("/control/block-input")
def block_input():
    if control_use_case.block_peripherals():
        return {"status": "success", "message": "Teclado y mouse bloqueados"}
    raise HTTPException(status_code=500, detail="Error al bloquear")

@router.post("/control/unblock-input")
def unblock_input():
    if control_use_case.unblock_peripherals():
        return {"status": "success", "message": "Teclado y mouse desbloqueados"}
    raise HTTPException(status_code=500, detail="Error al desbloquear")

@router.post("/control/shutdown")
def shutdown_pc():
    if control_use_case.shutdown():
        return {"status": "success", "message": "Apagando equipo..."}
    raise HTTPException(status_code=500, detail="Error al apagar")

@router.post("/control/block-web")
def block_web(req: WebBlockRequest):
    success = control_use_case.block_web(req.url)
    if success:
        return {"status": "success", "message": f"Web {req.url} bloqueada"}
    else:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN, 
            detail="Permiso denegado para modificar el archivo hosts."
        )

@router.post("/control/unblock-web")
def unblock_web(req: WebBlockRequest):
    success = control_use_case.unblock_web(req.url)
    if success:
        return {"status": "success", "message": f"Web {req.url} desbloqueada"}
    else:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN, 
            detail="Permiso denegado para modificar el archivo hosts."
        )

@router.post("/control/ping")
def toggle_ping(req: PingRequest):
    if control_use_case.set_ping_state(req.allow):
        estado = "permitido" if req.allow else "denegado"
        return {"status": "success", "message": f"Ping {estado}"}
    raise HTTPException(status_code=500, detail="Error al modificar ping")