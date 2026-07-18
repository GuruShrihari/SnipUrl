from sqlmodel import Field, SQLModel


class Url(SQLModel,table=True):
    id : int | None = Field(default=None , primary_key=True)
    original_url: str = Field(default=None, index = True)
    short_code : str = Field(default=None, index= True)