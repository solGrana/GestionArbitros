from pydantic import BaseModel
from datetime import date

class TournamentBase(BaseModel):
    nombre: str
    descripcion: str | None = None
    fecha_inicio: date
    fecha_fin: date

class TournamentCreate(TournamentBase):
    organizacion_id: int

class TournamentResponse(TournamentBase):
    id: int
    activo: bool
    organizacion_id: int

    class Config:
        orm_mode = True
