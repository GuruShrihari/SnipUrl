from contextlib import asynccontextmanager
from typing import Annotated

from fastapi import Depends, FastAPI
from sqlmodel import SQLModel, Session, create_engine, select

from app.models import Url
from app.utils import generate_short_code


sql_file_name = "database.db"
sqlite_url = f"sqlite:///{sql_file_name}"

connect_args = {"check_same_thread": False}
engine = create_engine(sqlite_url, connect_args= connect_args)

def create_db_and_tables():
    SQLModel.metadata.create_all(engine)


def get_session():
    with Session(engine) as session:
        yield session

SessionDep = Annotated[Session,Depends(get_session)]

@asynccontextmanager
async def lifespan(app: FastAPI):
    create_db_and_tables()
    with Session(engine) as session:
        if not session.exec(select(Url)).first():
            session.add_all([
                Url(original_url="https://www.google.com/", short_code=generate_short_code()),
                Url(original_url="https://www.microsoft.com/", short_code=generate_short_code())
            ])
            session.commit()
    yield
