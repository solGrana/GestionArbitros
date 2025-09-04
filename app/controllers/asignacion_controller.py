from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.match import Match
from app.models.user import User
from app.services.asignacion_service import AsignacionService
""" from app.core.security import admin_required """
from app.services.auth_service import admin_required


router = APIRouter(prefix="/asignaciones", tags=["Asignaciones"])

@router.post("/{match_id}")
def asignar(match_id: int, arbitro_ids: list[int], asistente_ids: list[int],
           db: Session = Depends(get_db), current_user: User = Depends(admin_required)):

    match = db.query(Match).filter(Match.id == match_id).first()
    if not match:
        raise HTTPException(status_code=404, detail="Partido no encontrado")

    arbitros = db.query(User).filter(User.id.in_(arbitro_ids), User.rol == "arbitro").all()
    asistentes = db.query(User).filter(User.id.in_(asistente_ids), User.rol == "arbitro").all()  

    return AsignacionService.asignar_usuarios(db, match, arbitros, asistentes)


@router.get("/partido/{match_id}")
def get_asignaciones(match_id: int, db: Session = Depends(get_db)):
    from app.models.asignacion import Asignacion
    asignaciones = db.query(Asignacion).filter(Asignacion.match_id == match_id).all()
    return [
        {
            "rol": a.rol,
            "user": {"id": a.user.id, "nombre": a.user.nombre}
        } 
        for a in asignaciones
    ]

