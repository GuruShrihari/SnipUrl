
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware


from app.routers.urls import router
from app.database import lifespan



app = FastAPI(lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://your-frontend-domain.vercel.app", 
    ],
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(router)











