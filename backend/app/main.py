from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .routers import runs

app = FastAPI(title="Run Tracker API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(runs.router)

@app.get("/health")
def health():
    return {"status": "ok"}