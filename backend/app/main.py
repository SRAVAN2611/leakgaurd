from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.core.database import Base, engine, SessionLocal
from app.models.policy import PolicyModel
from app.models.settings import SettingsModel
from app.services.scan_service import execute_scan

from app.api.routes import health, scans, threats, policies, analytics, settings as settings_route

Base.metadata.create_all(bind=engine)

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    openapi_url=f"{settings.API_V1_STR}/openapi.json"
)

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include Routers
app.include_router(health.router, tags=["Health"])
app.include_router(health.router, prefix=settings.API_V1_STR, tags=["Health"])
app.include_router(scans.router, prefix=settings.API_V1_STR, tags=["Scans"])
app.include_router(threats.router, prefix=settings.API_V1_STR, tags=["Threats"])
app.include_router(policies.router, prefix=settings.API_V1_STR, tags=["Policies"])
app.include_router(analytics.router, prefix=settings.API_V1_STR, tags=["Analytics"])
app.include_router(settings_route.router, prefix=settings.API_V1_STR, tags=["Settings"])

@app.on_event("startup")
def seed_initial_data():
    db = SessionLocal()
    try:
        # Seed Default Settings if missing
        sys_settings = db.query(SettingsModel).filter(SettingsModel.id == "default").first()
        if not sys_settings:
            db.add(SettingsModel(id="default"))
            db.commit()

        # Seed Default Policies if missing or update missing categories
        default_policies = [
            PolicyModel(name="Block Critical Credentials", description="Immediately block inputs containing cloud provider access keys or API tokens", category="API_KEYS", severity="Critical", action="BLOCK", enabled=True),
            PolicyModel(name="Redact PII Automatically", description="Sanitize emails, SSNs and phone numbers before LLM submission", category="PII", severity="Medium", action="REDACT", enabled=True),
            PolicyModel(name="Block Prompt Injection", description="Prevent instructions attempting to override model safeguards", category="PROMPT_INJECTION", severity="High", action="BLOCK", enabled=True),
            PolicyModel(name="Block Jailbreak Roleplay", description="Prevent DAN mode and unrestricted persona roleplays", category="JAILBREAK", severity="High", action="BLOCK", enabled=True),
            PolicyModel(name="Block System Prompt Extraction", description="Prevent attempts to extract proprietary system context", category="SYSTEM_PROMPT_EXTRACTION", severity="High", action="BLOCK", enabled=True),
            PolicyModel(name="Block Unencrypted Private Keys", description="Prevent transmission of RSA/PEM private key headers", category="PRIVATE_KEYS", severity="Critical", action="BLOCK", enabled=True),
            PolicyModel(name="Block Database Credentials", description="Prevent leak of DB connection strings and passwords", category="DATABASE_SECRETS", severity="Critical", action="BLOCK", enabled=True),
            PolicyModel(name="Block Plaintext Passwords", description="Prevent transmission of exposed application passwords", category="PASSWORDS", severity="High", action="BLOCK", enabled=True),
            PolicyModel(name="Block JWT Access Tokens", description="Prevent transmission of bearer tokens and JWT headers", category="JWT_TOKENS", severity="High", action="BLOCK", enabled=True)
        ]
        for pol in default_policies:
            existing = db.query(PolicyModel).filter(PolicyModel.category == pol.category).first()
            if not existing:
                db.add(pol)
        db.commit()


        # No fake scan seeding - scans must come strictly from user interaction.
    finally:
        db.close()

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="127.0.0.1", port=8000, reload=True)
