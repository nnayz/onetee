import os
from dotenv import load_dotenv
load_dotenv()


class Settings:
    def __init__(self, environment: str):
        self.environment = environment
        if self.environment == "development":
            self._CORS_ORIGINS = [
                "http://localhost:5173",
                "http://127.0.0.1:5173",
                "https://localhost:5173",
                "https://127.0.0.1:5173",
            ]
        elif self.environment == "production":
            self._CORS_ORIGINS = [
                "https://onetee.in",
                "https://www.onetee.in",
            ]
        else:
            raise ValueError(f"Invalid environment: {self.environment}")

    @property
    def CORS_ORIGINS(self) -> list[str]:
        return self._CORS_ORIGINS
    
settings = Settings(os.getenv("ENVIRONMENT"))