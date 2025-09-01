# models/tournament.py
from sqlalchemy import Column, Integer, String, Date, Boolean, ForeignKey
from app.database import Base

class Tournament(Base):
    __tablename__ = "torneos"

    id = Column(Integer, primary_key=True, index=True)
    nombre = Column(String, nullable=False)
    descripcion = Column(String, nullable=True)
    fecha_inicio = Column(Date, nullable=False)
    fecha_fin = Column(Date, nullable=False)
    organizacion_id = Column(Integer, ForeignKey("usuarios.id"))
    activo = Column(Boolean, default=True)
