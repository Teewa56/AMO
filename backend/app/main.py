from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.api.routers.transfers import router as transfers_router

# THIS LINE IS CRITICAL: It physically creates the aom_database.db file
from app.core.database import engine, Base
Base.metadata.create_all(bind=engine)

app = FastAPI(title=settings.PROJECT_NAME)

app.add_middleware(
    CORSMiddleware, allow_origins=["*"], allow_methods=["*"], allow_headers=["*"],
)

app.include_router(transfers_router, prefix=f"{settings.API_V1_STR}/transactions", tags=["Transactions"])

@app.get("/")
def health_check():
    return {"status": "Online"}