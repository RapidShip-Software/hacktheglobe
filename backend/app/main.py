import os
from contextlib import asynccontextmanager
from typing import AsyncGenerator

from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .routers import readings, patients, alerts, summary, discharge, chat

load_dotenv()


@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncGenerator[None, None]:
    """Application lifespan handler."""
    # Startup
    print("Canopy backend starting up...")
    yield
    # Shutdown
    print("Canopy backend shutting down...")


app = FastAPI(
    title="Canopy API",
    description="Continuous remote care platform backend",
    version="0.1.0",
    lifespan=lifespan,
)

# CORS
cors_origins = os.getenv("CORS_ORIGINS", "http://localhost:3000").split(",")
app.add_middleware(
    CORSMiddleware,
    allow_origins=cors_origins,
    allow_origin_regex=r"https://.*\.vercel\.app",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Register routers
app.include_router(readings.router)
app.include_router(patients.router)
app.include_router(alerts.router)
app.include_router(summary.router)
app.include_router(discharge.router)
app.include_router(chat.router)


@app.get("/health")
async def health_check() -> dict[str, str]:
    """Health check endpoint."""
    return {"status": "healthy", "service": "canopy-api"}
