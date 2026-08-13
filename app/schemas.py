from datetime import datetime
from typing import Generic, TypeVar

from pydantic import BaseModel, Field, HttpUrl


class UrlCreate(BaseModel):
    url : HttpUrl
    custom_code:str | None = Field(
        default= None,
        min_length=6,
        max_length=30,
        pattern=r"^[a-zA-Z0-9_-]+$"
    )


T= TypeVar("T")

class UrlResponse(BaseModel):
    short_url: str

class OriginalUrlResponse(BaseModel):
    original_url: str

class UrlStatsResponse(BaseModel):
    original_url: str
    short_code : str
    clicks: int
    created_at: datetime

class Response(BaseModel,Generic[T]):
    data: T


