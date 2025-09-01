from sqlalchemy.orm import Session
from datetime import timedelta
from fastapi import HTTPException, status
from app.repositories.user_repository import UserRepository
from app.core.security import verify_password, create_access_token
from app.models.user import User
from fastapi import Depends
from app.database import get_db
from app.schemas.user import UserResponse

from fastapi.security import OAuth2PasswordBearer
from jose import jwt, JWTError
from app.config import settings

# Tiempo de expiración del token en minutos
ACCESS_TOKEN_EXPIRE_MINUTES = 600
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="auth/login")

def authenticate_user(db: Session, email: str, password: str) -> User | None:
    """Valida email y password, devuelve usuario si es correcto."""
    user = UserRepository.get_user_by_email(db, email)
    if not user or not verify_password(password, user.hashed_password):
        return None
    return user

def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)) -> User:
    """Obtiene usuario actual a partir del token JWT."""
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="No se pudo autenticar",
        headers={"WWW-Authenticate": "Bearer"},
    )

    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        user_id: str = payload.get("sub")
        if user_id is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception

    user = UserRepository.get_user_by_id(db, int(user_id))
    if user is None:
        raise credentials_exception
    return user

def admin_required(current_user: User = Depends(get_current_user)) -> User:
    """Valida que el usuario sea admin."""
    if current_user.rol != "admin":
        raise HTTPException(status_code=403, detail="Acceso solo para administradores")
    return current_user

