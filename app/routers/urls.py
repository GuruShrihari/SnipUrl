from fastapi import APIRouter, HTTPException, Request
from fastapi.responses import RedirectResponse

from app.crud import create_short_url, get_url_by_short_code, increments_click
from app.database import SessionDep
from app.schemas import Response, UrlCreate, UrlResponse, UrlStatsResponse

router = APIRouter()


@router.post("/shorten",status_code=201,response_model=Response[UrlResponse])
async def shorten_url(request: Request,url:UrlCreate,session:SessionDep):

    new_url = create_short_url(session, str(url.url))

    shortend_url = UrlResponse(
    short_url=str(request.base_url) + new_url.short_code
    )

    return {"data": shortend_url}


@router.get("/{short_code}")
async def get_original_url(short_code: str, session:SessionDep):
    url = get_url_by_short_code(session, short_code)

    if url is None:
        raise HTTPException(
            status_code=404,
            detail="Short code not found."
        )

    increments_click(session, url)

    return RedirectResponse(url.original_url)



@router.get("/stats/{short_code}", response_model=Response[UrlStatsResponse])
async def get_stats(short_code: str, session:SessionDep):
    url = get_url_by_short_code(session, short_code)

    if url is None:
        raise HTTPException(
            status_code=404,
            detail="Short code not found"
        )

    stats = UrlStatsResponse(
        original_url=url.original_url,
        short_code=url.short_code,
        clicks=url.clicks,
        created_at=url.created_at
    )

    return {"data":stats}