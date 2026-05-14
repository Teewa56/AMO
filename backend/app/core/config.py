from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    PROJECT_NAME: str = "AOM SecurePay API"
    API_V1_STR: str = "/api/v1"
    SQUAD_SECRET_KEY: str
    SQUAD_BASE_URL: str = "https://sandbox-api-d.squadco.com"
    AI_ENGINE_URL: str = "http://localhost:8080/api/v1/fraud/analyze"
    DATABASE_URL: str = "sqlite:///./aom_database.db"

    class Config:
        env_file = ".env"

settings = Settings()