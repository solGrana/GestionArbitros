# app/controllers/tournament_controller.py
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.schemas.tournament import TournamentCreate, TournamentResponse
from app.services.tournament_service import TournamentService
from app.services.auth_service import get_current_user, admin_required

router = APIRouter(prefix="/torneos", tags=["Torneos"])

@router.post("/", response_model=TournamentResponse, dependencies=[Depends(admin_required)])
def create_tournament(tournament: TournamentCreate, db: Session = Depends(get_db)):
    try:
        return TournamentService.create_tournament(db, tournament)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/", response_model=list[TournamentResponse])
def list_tournaments(db: Session = Depends(get_db)):
    return TournamentService.list_tournaments(db)

@router.get("/{tournament_id}", response_model=TournamentResponse)
def get_tournament(tournament_id: int, db: Session = Depends(get_db)):
    try:
        return TournamentService.get_tournament(db, tournament_id)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
