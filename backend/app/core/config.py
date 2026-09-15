import os
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    PROJECT_NAME: str = "LeakGuard AI – Pre-LLM Security Gateway"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api/v1"
    
    # Database
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./leakguard.db")
    
    # Security Settings Defaults
    DEFAULT_SENSITIVITY: int = 75
    STRICT_MODE_DEFAULT: bool = False
    ALWAYS_MASK_EVIDENCE: bool = True
    RETAIN_ORIGINAL: bool = True
    RETENTION_DAYS: int = 7
    
    # Optional LLM Intelligence
    LLM_ENABLED: bool = os.getenv("LLM_ENABLED", "false").lower() == "true"
    LLM_PROVIDER: str = os.getenv("LLM_PROVIDER", "openai")
    LLM_MODEL: str = os.getenv("LLM_MODEL", "gpt-4o-mini")
    LLM_API_KEY: str = os.getenv("LLM_API_KEY", "")
    
    # CORS
    CORS_ORIGINS: list[str] = ["*"]

    class Config:
        case_sensitive = True

settings = Settings()
