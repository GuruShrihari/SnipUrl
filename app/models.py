from datetime import datetime

from sqlmodel import Field, SQLModel


class Url(SQLModel,table=True):
    id : int | None = Field(default=None , primary_key=True)
    original_url: str = Field(default=None, index = True)
    short_code : str = Field(default=None, index= True, unique=True)
    clicks: int = Field(default=0)
    created_at: datetime = Field(default_factory=datetime.now)
