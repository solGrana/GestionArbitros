from pydantic import BaseModel, EmailStr
from enum import Enum

# Roles permitidos
class RoleEnum(str, Enum):
    admin = "admin"
    arbitro = "arbitro"
    organizacion = "organizacion"

# Campos base (se comparten entre requests y responses)
class UserBase(BaseModel):
    nombre: str
    email: EmailStr
    rol: RoleEnum
    ubicacion_lat: str | None = None
    ubicacion_lng: str | None = None
    localidad: str | None = None

# Para crear usuario (agrega password)
class UserCreate(UserBase):
    password: str

# Para devolver usuario (no incluye password)
class UserResponse(UserBase):
    id: int

    class Config:
        orm_mode = True  # permite convertir desde SQLAlchemy

# Para login
class UserLogin(BaseModel):
    email: EmailStr
    password: str

# Para respuesta de login (token)
class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
