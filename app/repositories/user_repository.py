from sqlalchemy.orm import Session
from app.models.user import User
from app.schemas.user import UserCreate
from app.core.security import get_password_hash

class UserRepository:
    @staticmethod
    def create_user(db: Session, user: UserCreate):
        db_user = User(
            nombre=user.nombre,
            email=user.email,
            hashed_password=get_password_hash(user.password),
            rol=user.rol,
            localidad=user.localidad
        )
        db.add(db_user)
        db.commit()
        db.refresh(db_user)
        return db_user

    @staticmethod
    def get_user_by_email(db: Session, email: str):
        return db.query(User).filter(User.email == email).first()
    
    @staticmethod
    def get_user_by_id(db: Session, user_id: int):
        return db.query(User).filter(User.id == user_id).first()
    
    @staticmethod
    def list_users(db: Session):
        return db.query(User).all()
    
    
    @staticmethod
    def get_all_users(db: Session):
        from app.models.user import User
        return db.query(User).all()


