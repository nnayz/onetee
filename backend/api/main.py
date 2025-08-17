from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from community.router import router as community_router
from auth.router import router as auth_router

app = FastAPI(
    title="OneTee API",
    description="API for OneTee",
    version="0.1.0",
    contact={
        "name": "OneTee",
        "url": "https://onetee.in",
        "email": "info@onetee.in"
    }
)

import os

def _get_allowed_origins() -> list[str]:
    raw = os.getenv("CORS_ORIGINS")
    if raw:
        return [o.strip() for o in raw.split(",") if o.strip()]
    # sensible dev defaults
    return [
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "https://localhost:5173",
        "https://127.0.0.1:5173",
    ]

app.add_middleware(
    CORSMiddleware,
    allow_origins=_get_allowed_origins(),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(community_router, prefix="/community")
app.include_router(auth_router)

@app.get("/")
async def welcome():
    return {"message": "Welcome to OneTee API"}