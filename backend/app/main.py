from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.core.database import engine, Base
from app.routers import categories, products, admin, auth

try:
    Base.metadata.create_all(bind=engine)
except Exception:
    pass

app = FastAPI(title=settings.PROJECT_NAME)

origins = [o.strip() for o in settings.CORS_ORIGINS.split(",") if o.strip()]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins if origins else ["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(categories.router)
app.include_router(products.router)
app.include_router(admin.router)
app.include_router(auth.router)

@app.get("/health")
def health_check():
    return {"status": "ok"}
