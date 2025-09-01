from sqlalchemy.orm import Session
from app.repositories.match_repository import MatchRepository
from app.schemas.match import MatchCreate

class MatchService:
    @staticmethod
    def create_match(db: Session, match: MatchCreate):
        return MatchRepository.create_match(db, match)

    @staticmethod
    def list_matches_by_tournament(db: Session, torneo_id: int):
        return MatchRepository.get_matches_by_tournament(db, torneo_id)

    @staticmethod
    def get_match(db: Session, match_id: int):
        match = MatchRepository.get_match_by_id(db, match_id)
        if not match:
            raise ValueError("Partido no encontrado")
        return match

    @staticmethod
    def list_all_matches(db: Session):
        return MatchRepository.get_all_matches(db)