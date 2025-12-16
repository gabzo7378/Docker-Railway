from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from config.database import get_db_pool, close_db_pool
import os

# Import routers
from routes import (
    auth,
    students,
    teachers,
    courses,
    cycles,
    schedules,
    enrollments,
    payments,
    packages,
    admin
)

app = FastAPI(title="Academia API", version="2.0.0")

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",  # React por defecto
        "http://localhost:5173",  # Vite por defecto
        "http://127.0.0.1:3000",
        "http://127.0.0.1:5173"
    ],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
    allow_headers=["*"],
)

# Static files for uploads
if os.path.exists("uploads"):
    app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")

# Include routers
app.include_router(auth.router, prefix="/api")
app.include_router(students.router, prefix="/api")
app.include_router(teachers.router, prefix="/api")
app.include_router(courses.router, prefix="/api")
app.include_router(cycles.router, prefix="/api")
app.include_router(schedules.router, prefix="/api")
app.include_router(enrollments.router, prefix="/api")
app.include_router(payments.router, prefix="/api")
app.include_router(packages.router, prefix="/api")
app.include_router(admin.router, prefix="/api")

@app.on_event("startup")
async def startup():
    await get_db_pool()
    print("✓ Database pool created")

@app.on_event("shutdown")
async def shutdown():
    await close_db_pool()
    print("✓ Database pool closed")

@app.get("/")
async def root():
    return {"message": "Academia API v2.0 - FastAPI", "status": "running"}

@app.get("/health")
async def health():
    return {"status": "healthy"}

@app.get("/api/test")
async def test_endpoint():
    return {
        "message": "Backend is running",
        "timestamp": datetime.now().isoformat(),
        "status": "ok"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        app, 
        host="0.0.0.0",  # Esto permite conexiones externas
        port=int(os.getenv("PORT", "4000"))
    )