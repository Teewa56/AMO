from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )

    PROJECT_NAME:     str = "AMO SecurePay API"
    API_VERSION:      str = "1.0.0"
    API_V1_STR:       str = "/api/v1"

    # Squad payment gateway — defaults to empty so the app starts without .env
    SQUAD_SECRET_KEY: str = ""
    SQUAD_BASE_URL:   str = "https://sandbox-api-d.squadco.com"

    # Database
    DATABASE_URL: str = "sqlite:///./amo_database.db"


settings = Settings()
