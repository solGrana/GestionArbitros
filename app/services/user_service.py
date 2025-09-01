from sqlalchemy.orm import Session
from app.repositories.user_repository import UserRepository
from app.schemas.user import UserCreate

class UserService:
    @staticmethod
    def register_user(db: Session, user: UserCreate):
        existing = UserRepository.get_user_by_email(db, user.email)
        if existing:
            raise ValueError("El usuario ya existe")
        return UserRepository.create_user(db, user)
    

    @staticmethod
    def list_users(db: Session):
        return UserRepository.get_all_users(db)
