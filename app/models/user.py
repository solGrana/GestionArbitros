from sqlalchemy import Column, Integer, String
from app.database import Base
import enum

class RoleEnum(str, enum.Enum): 
    ADMIN = "admin"
    ARBITRO = "arbitro"
    ORGANIZACION = "organizacion"

class User(Base):
    __tablename__ = "usuarios"

    id = Column(Integer, primary_key=True, index=True)
    nombre = Column(String, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    rol = Column(String, nullable=False)  
    ubicacion_lat = Column(String, nullable=True)
    ubicacion_lng = Column(String, nullable=True)
    localidad = Column(String, nullable=True)
