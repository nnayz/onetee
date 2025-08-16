from uvicorn import run
from dotenv import load_dotenv
import os

load_dotenv()

def run_server():
    run("api.main:app", host=os.getenv("HOST"), port=os.getenv("PORT"), reload=True)

if __name__ == "__main__":
    run_server()