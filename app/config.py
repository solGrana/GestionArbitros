import os
from dotenv import load_dotenv

load_dotenv()

class Settings:
    DATABASE_URL: str = os.getenv("DATABASE_URL")
    SECRET_KEY: str = os.getenv("SECRET_KEY")
    ALGORITHM: str = os.getenv("ALGORITHM", "HS256")
    ACCESS_TOKEN_EXPIRE_MINUTES: int = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", 0.1))
    REFRESH_TOKEN_EXPIRE_DAYS = int = int(os.getenv("REFRESH_TOKEN_EXPIRE_DAYS", 7))
    print(DATABASE_URL)

settings = Settings()
