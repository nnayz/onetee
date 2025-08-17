# from uvicorn import run
from dotenv import load_dotenv
import os

load_dotenv()

def run_server():
    import uvicorn
    host = os.getenv("HOST", "127.0.0.1")
    port_str = os.getenv("PORT", "8000")
    try:
        port = int(port_str)
    except ValueError:
        port = 8000
    uvicorn.run("api.main:app", host=host, port=port, reload=True)
    # run("api.main:app", host=os.getenv("HOST"), port=os.getenv("PORT"), reload=True)

if __name__ == "__main__":
    run_server()