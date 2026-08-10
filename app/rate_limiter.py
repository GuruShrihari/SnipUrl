from fastapi import HTTPException, Request, status

from app.config import settings
from app.database import redis_client





def check_rate_limit(request: Request):
    ip = request.client.host
    key = f"rate_limit:{ip}"

    request_count = redis_client.incr(key)

    if request_count == 1:
        redis_client.expire(key, settings.RATE_LIMIT_WINDOW)

    if request_count > settings.RATE_LIMIT:
        ttl = redis_client.ttl(key)
        retry_after = ttl if ttl and ttl > 0 else settings.RATE_LIMIT_WINDOW
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail="Too many requests. Try again later.",
            headers={"Retry-After": str(retry_after)}
        )