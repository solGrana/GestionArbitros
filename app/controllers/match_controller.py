from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.schemas.match import MatchCreate, MatchResponse
from app.services.match_service import MatchService
from app.services.auth_service import admin_required

router = APIRouter(prefix="/partidos", tags=["Partidos"])

@router.post("/", response_model=MatchResponse, dependencies=[Depends(admin_required)])
def create_match(match: MatchCreate, db: Session = Depends(get_db)):
    try:
        return MatchService.create_match(db, match)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/torneo/{torneo_id}", response_model=list[MatchResponse])
def list_matches_by_tournament(torneo_id: int, db: Session = Depends(get_db)):
    return MatchService.list_matches_by_tournament(db, torneo_id)

@router.get("/{match_id}", response_model=MatchResponse)
def get_match(match_id: int, db: Session = Depends(get_db)):
    try:
        return MatchService.get_match(db, match_id)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))

@router.get("/", response_model=list[MatchResponse])
def list_all_matches(db: Session = Depends(get_db)):
    return MatchService.list_all_matches(db)


