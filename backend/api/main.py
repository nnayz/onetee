from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from community.router import router as community_router
from auth.router import router as auth_router
from marketplace.router import router as shop_router
from .config import settings


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


app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(community_router, prefix="/community")
app.include_router(auth_router)
app.include_router(shop_router)

@app.get("/")
async def welcome():
    return {"message": "Welcome to OneTee API"}