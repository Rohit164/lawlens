from fastapi import FastAPI, HTTPException, Depends, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import uvicorn
import os
from contextlib import asynccontextmanager

# Import route modules (with error handling for missing dependencies)
try:
    from routes import auth, summarize, payments, translate_gemini
    # Use LJP model for advanced features
    from routes import ljp_features
    print("[OK] Core routes loaded successfully")
    print("[OK] LJP model routes loaded ")
    
    # Optional routes that might have missing dependencies
    try:
        from routes import ocr, classify, explain
        FULL_FEATURES = True
        print("[OK] All AI features loaded")
    except ImportError as e:
        print(f"[WARN] Some AI features disabled due to missing dependencies: {e}")
        FULL_FEATURES = False
        ocr = classify = explain = None
except ImportError as e:
    print(f"[ERROR] Critical import error: {e}")
    print("[INFO] Try installing minimal dependencies: pip install -r requirements_core.txt")
    raise

# Security
security = HTTPBearer()

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    print("[INFO] LawLens API starting up...")
    yield
    # Shutdown
    print("[INFO] LawLens API shutting down...")

# Initialize FastAPI app
app = FastAPI(
    title="LawLens API",
    description="Multilingual Legal Document Simplification and Explainable AI Platform",
    version="1.0.0",
    lifespan=lifespan
)

# CORS middleware
FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:5173")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Health check endpoint
@app.get("/health")
async def health_check():
    return {"status": "healthy", "service": "LawLens API"}

# Include routers (with conditional loading)
app.include_router(auth.router, prefix="/api/auth", tags=["Authentication"])
app.include_router(summarize.router, prefix="/api/summarize", tags=["Summarization"])
app.include_router(payments.router, prefix="/api/payments", tags=["Payments"])
app.include_router(translate_gemini.router, prefix="/api/translate", tags=["Translation"])

# Advanced Features - Using LJP Model (with Groq AI)
app.include_router(ljp_features.router, tags=["LJP Features"])

# Include optional routers if dependencies are available
if FULL_FEATURES:
    app.include_router(ocr.router, prefix="/api/ocr", tags=["OCR"])
    app.include_router(classify.router, prefix="/api/classify", tags=["Classification"])
    app.include_router(explain.router, prefix="/api/explain", tags=["Explainability"])
else:
    print("[INFO] Running in basic mode - some AI features are disabled")

if __name__ == "__main__":
    uvicorn.run(
        "app:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level="info"
    )
