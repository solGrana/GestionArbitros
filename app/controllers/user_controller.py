from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.schemas.user import UserCreate, UserResponse
from app.services.user_service import UserService
from app.services.auth_service import get_current_user, admin_required
from app.models.user import User

router = APIRouter(prefix="/usuarios", tags=["Usuarios"])

@router.post("/", response_model=UserResponse, dependencies=[Depends(admin_required)])
def create_user(user: UserCreate, db: Session = Depends(get_db)):
    """
    Crear un usuario (solo admin).
    """
    try:
        return UserService.register_user(db, user)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/me", response_model=UserResponse)
def read_users_me(current_user: User = Depends(get_current_user)):
    """
    Obtener datos del usuario logueado.
    """
    return current_user


@router.get("/admin-only", response_model=dict)
def read_admin_data(current_user: User = Depends(admin_required)): 
    """
    Endpoint de prueba para admin.
    """
    return {"msg": "Accediste como admin"}


@router.get("/", response_model=list[UserResponse], dependencies=[Depends(admin_required)])  
def list_users(db: Session = Depends(get_db)):
    return UserService.list_users(db)
