
from fastapi import FastAPI
from sqlmodel import select

from app.database import SessionDep, lifespan
from app.models import Url
from app.schemas import Response, UrlCreate, UrlResponse
from app.utils import check_duplicate_code, generate_short_code


app = FastAPI(lifespan=lifespan)


    
@app.post("/shorten",status_code=201,response_model=Response[UrlResponse])
async def shorten_url(url:UrlCreate,session:SessionDep):

    while True:
        code = generate_short_code()
        existing = check_duplicate_code(code,session)
        if existing is False:
            break

    new_url = Url(original_url=str(url.url), short_code=code)
    session.add(new_url)
    session.commit()
    session.refresh(new_url)

    response = UrlResponse(
    short_url=f"http://localhost:8000/{new_url.short_code}"
    )

    return {"data": response}



