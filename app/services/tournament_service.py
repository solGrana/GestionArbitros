# app/services/tournament_service.py
from sqlalchemy.orm import Session
from app.repositories.tournament_repository import TournamentRepository
from app.schemas.tournament import TournamentCreate

class TournamentService:
    @staticmethod
    def create_tournament(db: Session, tournament: TournamentCreate):
        # Validaciones de negocio
        if tournament.fecha_fin < tournament.fecha_inicio:
            raise ValueError("La fecha de fin no puede ser anterior a la fecha de inicio")
        return TournamentRepository.create_tournament(db, tournament)

    @staticmethod
    def list_tournaments(db: Session):
        return TournamentRepository.get_all_tournaments(db)

    @staticmethod
    def get_tournament(db: Session, tournament_id: int):
        tournament = TournamentRepository.get_tournament_by_id(db, tournament_id)
        if not tournament:
            raise ValueError("Torneo no encontrado")
        return tournament
