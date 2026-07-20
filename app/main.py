
from fastapi import FastAPI

from app.database import SessionDep, lifespan
from app.models import Url
from app.schemas import Response, UrlCreate


app = FastAPI(lifespan=lifespan)


    
@app.post("/shorten",status_code=201,response_model=Response[Url])
async def shorten_url(url:UrlCreate,session:SessionDep):
    
    return {"data": url}


