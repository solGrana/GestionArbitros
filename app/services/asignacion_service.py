from sqlalchemy.orm import Session
from app.models.asignacion import Asignacion, RolAsignacion
from app.models.user import User
from app.models.match import Match

class AsignacionService:

    @staticmethod
    def asignar_usuarios(db: Session, match: Match, arbitros: list[User], asistentes: list[User]):
        # Eliminar asignaciones previas
        db.query(Asignacion).filter(Asignacion.match_id == match.id).delete()
        db.commit()

        # Asignar árbitros
        for u in arbitros[:match.cantidad_arbitros]:
            asignacion = Asignacion(match_id=match.id, user_id=u.id, rol=RolAsignacion.ARBITRO.value)
            db.add(asignacion)

        # Asignar asistentes
        for u in asistentes[:match.cantidad_asistentes]:
            asignacion = Asignacion(match_id=match.id, user_id=u.id, rol=RolAsignacion.ASISTENTE.value)
            db.add(asignacion)

        db.commit()
        db.refresh(match)
        return match.asignaciones
