from datetime import datetime
from typing import Generic, TypeVar

from pydantic import BaseModel, HttpUrl


class UrlCreate(BaseModel):
    url : HttpUrl


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


