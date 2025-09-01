from sqlalchemy.orm import Session
from app.database import SessionLocal
from app.services.auth_service import authenticate_user

db: Session = SessionLocal()

user = authenticate_user(db, "admin@liga.com", "admin123")
if user:
    print("Login exitoso:", user.nombre, user.email)
else:
    print("Usuario o contraseña incorrectos")

db.close()
