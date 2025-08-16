from fastapi import FastAPI


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

@app.get("/")
async def welcome():
    return {"message": "Welcome to OneTee API"}