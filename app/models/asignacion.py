# app/models/asignacion.py
from sqlalchemy import Column, Integer, ForeignKey, String, Boolean
from sqlalchemy.orm import relationship
from app.database import Base
import enum
from app.models.user import User
from app.models.match import Match

class RolAsignacion(str, enum.Enum):
    ARBITRO = "arbitro"
    ASISTENTE = "asistente"

class Asignacion(Base):
    __tablename__ = "asignaciones"

    id = Column(Integer, primary_key=True, index=True)
    match_id = Column(Integer, ForeignKey("partidos.id"), nullable=False)  # <- ajustado
    user_id = Column(Integer, ForeignKey("usuarios.id"), nullable=False)
    rol = Column(String, nullable=False)
    confirmado = Column(Boolean, default=False)

    match = relationship("Match", back_populates="asignaciones")
    user = relationship("User")
