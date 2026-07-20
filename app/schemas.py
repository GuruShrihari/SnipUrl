from typing import Generic, TypeVar

from pydantic import BaseModel, HttpUrl


class UrlCreate(BaseModel):
    url : HttpUrl



T= TypeVar("T")

class UrlResponse(BaseModel):
    short_url: str

class Response(BaseModel,Generic[T]):
    data: T


