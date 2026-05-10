from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    PROJECT_NAME: str = "AOM SecurePay API"
    API_V1_STR: str = "/api/v1"
    SQUAD_SECRET_KEY: str
    SQUAD_BASE_URL: str = "https://sandbox-api-d.squadco.com"

    class Config:
        env_file = ".env"

settings = Settings()