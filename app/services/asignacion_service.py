from sqlalchemy.orm import Session
from app.models.asignacion import Asignacion, RolAsignacion
from app.models.user import User
from app.models.match import Match

class AsignacionService:

    @staticmethod
    def asignar_usuarios(db: Session, match: Match, arbitros: list[User], asistentes: list[User]):
        # Eliminar asignaciones anteriores
        db.query(Asignacion).filter(Asignacion.match_id == match.id).delete()
        db.commit()

        # Asignar arbitros
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
    
    @staticmethod
    def actualizar_usuarios(db: Session, match: Match, arbitros: list[User], asistentes: list[User]):
        # Solo actualizar las asignaciones existentes o crear si no hay
        asignaciones_existentes = db.query(Asignacion).filter(Asignacion.match_id == match.id).all()
        
        # Si no hay asignaciones crear nuevas
        if not asignaciones_existentes:
            return AsignacionService.asignar_usuarios(db, match, arbitros, asistentes)

        # Eliminar asignaciones antiguas
        for a in asignaciones_existentes:
            db.delete(a)
        db.commit()

        # Reasignar arbitros
        for u in arbitros:
            asignacion = Asignacion(match_id=match.id, user_id=u.id, rol=RolAsignacion.ARBITRO.value)
            db.add(asignacion)

        # Reasignar asistentes
        for u in asistentes:
            asignacion = Asignacion(match_id=match.id, user_id=u.id, rol=RolAsignacion.ASISTENTE.value)
            db.add(asignacion)

        match.cantidad_asistentes = len(asistentes)
        match.cantidad_arbitros = len(arbitros)
        db.add(match)


        db.commit()
        db.refresh(match)
        return match.asignaciones
