from fastapi import APIRouter, Depends, HTTPException
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from datetime import timedelta
from app.database import get_db
from app.services.auth_service import authenticate_user
from app.core.security import create_refresh_token, create_access_token
from app.config import settings
from app.services.auth_service import get_current_user
from app.schemas.user import UserResponse
from app.models.user import User
from jose import jwt, JWTError
from pydantic import BaseModel

router = APIRouter(prefix="/auth", tags=["Auth"])

@router.post("/login")
def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    """
    Endpoint para login de usuario.
    Devuelve token JWT si email y contraseña son correctos.
    """
    user = authenticate_user(db, form_data.username, form_data.password)
    if not user:
        raise HTTPException(status_code=401, detail="Usuario o contraseña incorrectos")
    
    """ access_token_expires = settings.ACCESS_TOKEN_EXPIRE_MINUTES """
    """ access_token = create_access_token(data={"sub": str(user.id)}, expires_delta=access_token_expires) """

    access_token = create_access_token(
        data={"sub": str(user.id)},
        expires_delta=settings.ACCESS_TOKEN_EXPIRE_MINUTES
    )
    refresh_token = create_refresh_token(
        data={"sub": str(user.id)},
        expires_delta= settings.REFRESH_TOKEN_EXPIRE_DAYS
    )   
    return {
            "access_token": access_token, 
            "refresh_token": refresh_token,
            "token_type": "bearer"
            }


""" @router.post("/refresh")
def refresh(refresh_token: str = Form(...), db: Session = Depends(get_db)):
   
    Endpoint para renovar el access_token usando el refresh_token.
 
    try:
        payload = jwt.decode(refresh_token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        user_id: str = payload.get("sub")
        if user_id is None:
            raise HTTPException(status_code=401, detail="Refresh token inválido")
    except JWTError:
        raise HTTPException(status_code=401, detail="Refresh token inválido")

    user = db.query(User).filter(User.id == int(user_id)).first()
    if not user:
        raise HTTPException(status_code=401, detail="Usuario no encontrado")

    new_access_token = create_access_token(
        data={"sub": str(user.id)},
        expires_delta=timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    )

    return {"access_token": new_access_token, "token_type": "bearer"}
 """

@router.get("/me", response_model=UserResponse)
def get_me(current_user: User = Depends(get_current_user)):
    """
    Devuelve los datos del usuario logueado.
    Requiere token en header Authorization: Bearer <token>
    """
    return current_user

class RefreshRequest(BaseModel):
    refresh_token: str


@router.post("/refresh")
def refresh(request: RefreshRequest, db: Session = Depends(get_db)):
    """
    Endpoint para renovar el access_token usando el refresh_token.
    """
    try:
        payload = jwt.decode(request.refresh_token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        user_id: str = payload.get("sub")
        if user_id is None:
            raise HTTPException(status_code=401, detail="Refresh token inválido")
    except JWTError:
        raise HTTPException(status_code=401, detail="Refresh token inválido")

    user = db.query(User).filter(User.id == int(user_id)).first()
    if not user:
        raise HTTPException(status_code=401, detail="Usuario no encontrado")

    new_access_token = create_access_token(
        data={"sub": str(user.id)},
        expires_delta= settings.ACCESS_TOKEN_EXPIRE_MINUTES
    )

    return {"access_token": new_access_token, "token_type": "bearer"}
