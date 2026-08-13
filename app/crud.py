from fastapi import HTTPException
from sqlmodel import Session, select

from app.models import Url
from app.utils import generate_short_code

RESERVED_CODES = {
    "shorten",
    "stats",
    "docs",
    "redoc",
    "openapi.json",
}



def get_url_by_short_code(session: Session, short_code: str):
    return session.exec(
        select(Url).where(Url.short_code == short_code)
    ).first()

def create_short_url(session: Session, original_url: str,custom_code:str | None = None):
    existing_url = session.exec(
        select(Url).where(Url.original_url == original_url)
    ).first()
    if existing_url:
        return existing_url

    if custom_code:
        custom_code = custom_code.lower()
        if custom_code in RESERVED_CODES:
            raise HTTPException(
                status_code=400,
                detail="This custom code is reserved on the server side"
            )

        existing_code = session.exec(
            select(Url).where(Url.short_code == custom_code)
        ).first()

        if existing_code:
            raise HTTPException(
                status_code=409,
                detail="Custom code already exists"
            )

        code = custom_code
    else:
        while True:
            code = generate_short_code()
            
            query = select(Url).where(Url.short_code == code)

            existing = session.exec(query).first()
            if existing is None:
                break
        
    new_url = Url(original_url=original_url, short_code=code)
    session.add(new_url)
    session.commit()
    session.refresh(new_url)

    return new_url


def increments_click(session: Session,url: Url):
    url.clicks += 1
    session.commit()
    session.refresh(url)