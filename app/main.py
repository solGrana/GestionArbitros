""" from fastapi import FastAPI
from app.database import Base, engine
from app.controllers import user_controller, auth_controller
from app.controllers import tournament_controller
from app.controllers import match_controller
from app.controllers import asignacion_controller
from fastapi.middleware.cors import CORSMiddleware """


from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.database import Base, engine

# Importar TODOS los modelos para que SQLAlchemy los registre
from app.models.user import User
from app.models.tournament import Tournament
from app.models.match import Match
from app.models.asignacion import Asignacion

# Importar routers
from app.controllers import user_controller, auth_controller
from app.controllers import tournament_controller, match_controller, asignacion_controller


app = FastAPI(title="Gestión de Árbitros")
""" Base.metadata.create_all(bind=engine) """

app.include_router(user_controller.router)
app.include_router(auth_controller.router)
app.include_router(tournament_controller.router)
app.include_router(match_controller.router)
app.include_router(asignacion_controller.router)

origins = [
    "http://localhost:5173",  
    "http://127.0.0.1:5173",
    "http://localhost",       
    "http://127.0.0.1",
    "http://127.0.0.1:5500",
    "http://localhost:5500"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], #  * para permitir todas las fuentes -- desps cambiarlo
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def root():
    return {"message": "API Gestión de Árbitros funcionando 🚀"}
