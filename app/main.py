from contextlib import asynccontextmanager
from typing import Annotated, Generic, TypeVar

from fastapi import Depends, FastAPI
from pydantic import BaseModel
from sqlmodel import Field, SQLModel, Session, create_engine, select

from app.models import Url




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
                Url(original_url="https://www.google.com/"),
                Url(original_url="https://www.microsoft.com/")
            ])
            session.commit()


    yield

app = FastAPI(root_path="/api/v1", lifespan=lifespan)

T= TypeVar("T")

class Response(BaseModel,Generic[T]):
    data: T
    
@app.post("/shorten",status_code=201,response_model=Response[Url])
async def shorten_url(url:Url,session:SessionDep):
    session.add(url)
    session.commit()
    session.refresh(url)

    return {"data": url}


