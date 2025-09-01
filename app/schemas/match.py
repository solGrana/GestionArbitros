# app/schemas/match.py
from pydantic import BaseModel
from datetime import datetime

class MatchBase(BaseModel):
    torneo_id: int
    fecha_hora: datetime
    cancha: str
    cantidad_arbitros: int
    cantidad_asistentes: int
    modalidad_pago: str
    valor_arbitro: int
    valor_asistente: int

class MatchCreate(MatchBase):
    pass

class MatchResponse(MatchBase):
    id: int

    class Config:
        orm_mode = True
