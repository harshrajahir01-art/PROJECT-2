import os
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from app.config import settings
from app.api.v1 import api_router
from app.database import engine, Base
from app.seed.seed_data import seed_database

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: Create tables and auto-seed database
    Base.metadata.create_all(bind=engine)
    try:
        seed_database()
    except Exception as e:
        print(f"[WARN] Startup seed message: {e}")
    yield
    # Shutdown logic if any

app = FastAPI(
    title=settings.PROJECT_NAME,
    description="Real-World Vehicle Identification and Stolen Vehicle Detection API (Indian License Plates)",
    version="1.0.0",
    lifespan=lifespan,
    docs_url="/docs",
    redoc_url="/redoc"
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount static uploads directory for inspection images
os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
app.mount("/uploads", StaticFiles(directory=settings.UPLOAD_DIR), name="uploads")

# Mount API Router
app.include_router(api_router, prefix=settings.API_V1_STR)

@app.get("/api/health", tags=["System Health"])
def health_check():
    return {
        "status": "HEALTHY",
        "service": settings.PROJECT_NAME,
        "version": "1.0.0",
        "database": "CONNECTED",
        "ai_engine": "EASYOCR_OPENCV_ACTIVE"
    }

@app.get("/", tags=["Root"])
def root():
    return {
        "message": "VehicleShield API is operational. Visit /docs for OpenAPI documentation.",
        "api_v1": settings.API_V1_STR,
        "health": "/api/health"
    }
