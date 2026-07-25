
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware


from app.routers.urls import router
from app.database import lifespan



app = FastAPI(lifespan=lifespan)



app.include_router(router)











