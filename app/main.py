
from fastapi import FastAPI, HTTPException, status
from sqlmodel import select

from app.database import SessionDep, lifespan
from app.models import Url
from app.schemas import OriginalUrlResponse, Response, ShortCodeRead, UrlCreate, UrlResponse
from app.utils import generate_short_code


app = FastAPI(lifespan=lifespan)


    
@app.post("/shorten",status_code=201,response_model=Response[UrlResponse])
async def shorten_url(url:UrlCreate,session:SessionDep):

    while True:
        code = generate_short_code()
        
        query = select(Url).where(Url.short_code == code)

        existing = session.exec(query).first()
        if not existing:
            break


    new_url = Url(original_url=str(url.url), short_code=code)
    session.add(new_url)
    session.commit()
    session.refresh(new_url)

    response = UrlResponse(
    short_url=f"http://localhost:8000/{new_url.short_code}"
    )

    return {"data": response}



@app.get("/{short_code}",status_code = 200,response_model=Response[OriginalUrlResponse])
async def get_original_url(short_code: str, session:SessionDep):
    url = session.exec(
    select(Url).where(Url.short_code == short_code)
    ).first()

    if url is None:
        raise HTTPException(
            status_code=404,
            detail="Short code not found."
        )

    return {
        "data": OriginalUrlResponse(
            original_url=url.original_url
        )
    }

