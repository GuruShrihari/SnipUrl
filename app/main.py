
from fastapi import FastAPI, HTTPException
from fastapi.responses import RedirectResponse
from sqlmodel import select

from app.database import SessionDep, lifespan
from app.models import Url
from app.schemas import Response, UrlCreate, UrlResponse, UrlStatsResponse
from app.utils import generate_short_code


app = FastAPI(lifespan=lifespan)


    
@app.post("/shorten",status_code=201,response_model=Response[UrlResponse])
async def shorten_url(url:UrlCreate,session:SessionDep):

    while True:
        code = generate_short_code()
        
        query = select(Url).where(Url.short_code == code)

        existing = session.exec(query).first()
        if existing is None:
            break


    new_url = Url(original_url=str(url.url), short_code=code)
    session.add(new_url)
    session.commit()
    session.refresh(new_url)

    response = UrlResponse(
    short_url=f"http://localhost:8000/{new_url.short_code}"
    )

    return {"data": response}



@app.get("/{short_code}")
async def get_original_url(short_code: str, session:SessionDep):
    url = session.exec(
    select(Url).where(Url.short_code == short_code)
    ).first()

    if url is None:
        raise HTTPException(
            status_code=404,
            detail="Short code not found."
        )

    url.clicks += 1
    session.commit()
    session.refresh(url)

    return RedirectResponse(url.original_url)




@app.get("/stats/{short_code}", response_model=Response[UrlStatsResponse])
async def get_stats(short_code: str, session:SessionDep):
    url = session.exec(
        select(Url).where(Url.short_code == short_code)
    ).first()

    if url is None:
        raise HTTPException(
            status_code=404,
            detail="Short code not found"
        )

    response = UrlStatsResponse(
        original_url=url.original_url,
        short_code=url.short_code,
        clicks=url.clicks,
        created_at=url.created_at
    )

    return {"data":response}



