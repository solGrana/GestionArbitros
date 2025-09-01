# app/repositories/match_repository.py
from sqlalchemy.orm import Session
from app.models.match import Match
from app.schemas.match import MatchCreate

class MatchRepository:
    @staticmethod
    def create_match(db: Session, match: MatchCreate):
        db_match = Match(**match.dict())
        db.add(db_match)
        db.commit()
        db.refresh(db_match)
        return db_match

    @staticmethod
    def get_matches_by_tournament(db: Session, torneo_id: int):
        return db.query(Match).filter(Match.torneo_id == torneo_id).all()

    @staticmethod
    def get_match_by_id(db: Session, match_id: int):
        return db.query(Match).filter(Match.id == match_id).first()

    @staticmethod
    def get_all_matches(db: Session):
        return db.query(Match).all()