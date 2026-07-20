from typing import Generic, TypeVar

from pydantic import BaseModel, HttpUrl


class UrlCreate(BaseModel):
    url : HttpUrl



T= TypeVar("T")

class Response(BaseModel,Generic[T]):
    data: T


