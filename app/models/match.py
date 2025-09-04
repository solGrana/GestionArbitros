# app/models/match.py
from sqlalchemy import Column, Integer, String, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from app.database import Base

class Match(Base):
    __tablename__ = "partidos"

    id = Column(Integer, primary_key=True, index=True)
    torneo_id = Column(Integer, ForeignKey("torneos.id"), nullable=False)
    fecha_hora = Column(DateTime, nullable=False)
    cancha = Column(String, nullable=False)
    cantidad_arbitros = Column(Integer, nullable=False, default=1)
    cantidad_asistentes = Column(Integer, nullable=False, default=0)
    modalidad_pago = Column(String, nullable=False)  # "en_cancha" o "administrador"
    valor_arbitro = Column(Integer, nullable=False)
    valor_asistente = Column(Integer, nullable=False)
    # En principio agrego estos campos string para simplificar la creación del partido
    equipo_local = Column(String, nullable=False)
    equipo_visitante = Column(String, nullable=False)

    torneo = relationship("Tournament", backref="partidos")
    asignaciones = relationship("Asignacion", back_populates="match", cascade="all, delete-orphan")

