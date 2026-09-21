import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
from app.routes.recommendations import router as rec_router

load_dotenv()

app = FastAPI(
    title="Melomix 2.0 ML Service",
    description="AI-Powered Music Recommendation & Mood Analysis Engine",
    version="2.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/health")
def health_check():
    return {
        "service": "melomix-ml",
        "status": "healthy"
    }

# Include ML recommendation, mood, and NLP search routes
app.include_router(rec_router)

if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("ML_PORT", "8000"))
    host = os.getenv("ML_HOST", "0.0.0.0")
    uvicorn.run("main:app", host=host, port=port, reload=True)
