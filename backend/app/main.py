#app/main.py
import os
import traceback
from dotenv import load_dotenv

load_dotenv()

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from app.database import engine, Base
from app.router import auth, lost, found, trust, claims, users, recommend
from fastapi.staticfiles import StaticFiles




app = FastAPI(
    title="TrackMate API",
    description="Backend for UOG Lost & Found System with Trust Score & Secure Verification",
    version="1.0.0"
)

#Create Tables automatically (Dev mode only)
# if os.getenv("ENV") == "development":
#   Base.metadata.create_all(bind=engine)

@app.middleware("http")
async def catch_exceptions_middleware(request: Request, call_next):
    try:
        return await call_next(request)
    except Exception as e:
        print("❌ UNHANDLED EXCEPTION ❌")
        print(traceback.format_exc()) 
        return JSONResponse(
            status_code=500,
            content={"detail": "Internal Server Error. Check Terminal for logs."},
        )
# 2. CORS 
origins = [
    "http://localhost:3000",
    "http://localhost:5173",  # React Frontend
    "http://localhost:8000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
os.makedirs("static/images", exist_ok=True)
app.mount("/static", StaticFiles(directory="static"), name="static")
# 3. Register Routers (Connecting modules)
app.include_router(auth.router)
app.include_router(users.router)
app.include_router(lost.router)
app.include_router(found.router)
app.include_router(recommend.router)
app.include_router(claims.router)
app.include_router(trust.router)

@app.get("/")
def root():
    return {"message": "TrackMate Backend is Running! Visit /docs for Swagger UI."}

