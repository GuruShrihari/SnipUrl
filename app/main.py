
from fastapi import FastAPI

from app.routers.urls import router
from app.database import lifespan


app = FastAPI(lifespan=lifespan)

app.include_router(router)











