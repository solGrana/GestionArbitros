from sqlalchemy.orm import Session
from app.models.tournament import Tournament
from app.schemas.tournament import TournamentCreate

class TournamentRepository:
    @staticmethod
    def create_tournament(db: Session, tournament: TournamentCreate):
        db_tournament = Tournament(
            nombre=tournament.nombre,
            descripcion=tournament.descripcion,
            fecha_inicio=tournament.fecha_inicio,
            fecha_fin=tournament.fecha_fin,
            organizacion_id=tournament.organizacion_id
        )
        db.add(db_tournament)
        db.commit()
        db.refresh(db_tournament)
        return db_tournament

    @staticmethod
    def get_tournament_by_id(db: Session, tournament_id: int):
        return db.query(Tournament).filter(Tournament.id == tournament_id).first()

    @staticmethod
    def get_all_tournaments(db: Session):
        return db.query(Tournament).all()
