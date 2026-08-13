from sqlmodel import Session, select

from app.models import Url
from app.utils import generate_short_code


def get_url_by_short_code(session: Session, short_code: str):
    return session.exec(
        select(Url).where(Url.short_code == short_code)
    ).first()

def create_short_url(session: Session, original_url: str):
    existing_url = session.exec(
        select(Url).where(Url.original_url == original_url)
    )
    if existing_url:
        return existing_url
    
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