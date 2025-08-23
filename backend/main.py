# from uvicorn import run
from dotenv import load_dotenv
import os

load_dotenv()

def run_server():
    import uvicorn
    host = os.getenv("HOST")
    port = int(os.getenv("PORT"))
    try:
        uvicorn.run("api.main:app", host=host, port=port, reload=True)
    except Exception as e:
        print(e)
        exit(1)

if __name__ == "__main__":
    run_server()