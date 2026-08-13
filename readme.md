# URL Shortener

A production-ready URL Shortener built using FastAPI and SQLModel with a focus on clean architecture, modular design, and deployment-ready backend development. The application allows users to generate short URLs (with optional custom short codes), redirect to the original destination, and retrieve analytics such as click counts and creation timestamps.

The project follows backend engineering best practices including separation of concerns, environment-based configuration, reusable CRUD operations, IP-based rate limiting with Redis, and a layered project structure.

---

## Live Demo

**Frontend:**  
`https://snipurl-ten.vercel.app/`

<img width="1913" height="915" alt="image" src="https://github.com/user-attachments/assets/dbd8897a-663f-4062-95ec-60e00781ac07" />

<img width="1917" height="910" alt="image" src="https://github.com/user-attachments/assets/1d370758-5b2e-4546-9d9e-d5f2def25551" />



**Backend API:**  
`https://snipurl-p2zj.onrender.com`

**API Documentation:**  
`https://snipurl-p2zj.onrender.com/docs`

<img width="1488" height="904" alt="image" src="https://github.com/user-attachments/assets/fb09c469-c18d-4fcf-a0f6-c58981d622bf" />

---

## Features

- Generate unique 6-character short URLs using cryptographically secure random values
- **Custom short codes** — choose your own 6–30 character alias (letters, numbers, hyphens, underscores)
- Reserved code protection — prevents overwriting system routes (`shorten`, `stats`, `docs`, etc.)
- Duplicate URL detection — re-submitting the same URL returns the existing short link
- Redirect users to the original URL
- Track click counts automatically
- Retrieve URL statistics on a dedicated analytics page
- Collision-resistant short code generation
- IP-based rate limiting powered by Redis (configurable limit and window)
- Rate-limit cooldown countdown displayed in the UI
- Toast notification system for real-time user feedback
- Granular error handling — distinct UI for rate limits, code conflicts, reserved codes, and validation errors
- PostgreSQL database integration (with SQLite fallback for local development)
- Environment-based configuration via Pydantic Settings
- Modular project architecture
- Interactive API documentation using Swagger UI
- Responsive frontend built with HTML, CSS, and JavaScript
- Copy-to-clipboard functionality for shortened URLs
- Loading spinners and accessible form states
- Database seeding on first startup

---

## Tech Stack

### Backend

- FastAPI
- SQLModel
- PostgreSQL (Neon)
- Redis (rate limiting)
- Uvicorn
- Pydantic
- Pydantic Settings

### Frontend

- HTML5
- CSS3
- Vanilla JavaScript

### Deployment

- Render (Backend)
- Vercel (Frontend)
- Neon (PostgreSQL)
- Redis Cloud (Rate Limiting)

---

## Project Structure

```
UrlShortener/
│
├── app/
│   ├── routers/
│   │   ├── __init__.py
│   │   └── urls.py
│   │
│   ├── config.py
│   ├── crud.py
│   ├── database.py
│   ├── main.py
│   ├── models.py
│   ├── rate_limiter.py
│   ├── schemas.py
│   └── utils.py
│
├── frontend/
│   ├── index.html
│   ├── stats.html
│   ├── style.css
│   └── script.js
│
├── requirements.txt
├── .env.example
├── README.md
└── .gitignore
```

---

## Architecture

```
                 Browser
                     │
                     ▼
        Frontend (HTML, CSS, JavaScript)
           ┌─────────┴─────────┐
           │                   │
      index.html          stats.html
    (URL shortening)    (Click analytics)
   (Custom short codes)
                     │
                     ▼
              FastAPI REST API
                     │
              ┌──────┴──────┐
              │              │
         CRUD Layer    Rate Limiter
              │              │
              ▼              ▼
         SQLModel ORM      Redis
              │
              ▼
    PostgreSQL / SQLite
```

---

## API Endpoints

### Create Short URL

```
POST /shorten
```

Creates a shortened URL from a valid input URL. Optionally accepts a `custom_code` for a personalised short link. This endpoint is rate limited — clients exceeding the configured threshold will receive a `429 Too Many Requests` response with a `Retry-After` header.

**Request Body:**

```json
{
  "url": "https://example.com/very-long-url",
  "custom_code": "my-brand"
}
```

> `custom_code` is optional. When omitted, a random 6-character code is generated.

**Validation Rules for `custom_code`:**

| Rule         | Value                            |
|--------------|----------------------------------|
| Min length   | 6 characters                     |
| Max length   | 30 characters                    |
| Allowed chars| `a-z`, `A-Z`, `0-9`, `_`, `-`   |

**Response (201):**

```json
{
  "data": {
    "short_url": "https://snipurl-p2zj.onrender.com/my-brand"
  }
}
```

**Error Responses:**

| Status | Condition                                      | Body                                                     |
|--------|-------------------------------------------------|----------------------------------------------------------|
| `400`  | Custom code is a reserved system route          | `{ "detail": "This custom code is reserved on the server side" }` |
| `409`  | Custom code is already in use                   | `{ "detail": "Custom code already exists" }`             |
| `422`  | Invalid URL or custom code fails validation     | Pydantic validation error details                        |
| `429`  | Rate limit exceeded                             | `{ "detail": "Too many requests. Try again later." }` + `Retry-After` header |

**Duplicate URL Handling:**

If the submitted URL already exists in the database, the API returns the existing short URL instead of creating a duplicate entry. This is a `201` response with the same shape.

---

### Redirect

```
GET /{short_code}
```

Redirects the user to the original URL and increments the click counter. Returns `404` if the short code does not exist.

---

### URL Statistics

```
GET /stats/{short_code}
```

Returns analytics for a given short code:

- Original URL
- Short Code
- Total Clicks
- Creation Timestamp

**Response (200):**

```json
{
  "data": {
    "original_url": "https://example.com/very-long-url",
    "short_code": "aB3kX9",
    "clicks": 42,
    "created_at": "2026-08-10T15:30:00"
  }
}
```

---

## Rate Limiting

The API implements IP-based rate limiting using Redis. Each client IP is tracked with a sliding window counter.

| Setting              | Default | Description                                       |
|----------------------|---------|---------------------------------------------------|
| `RATE_LIMIT`         | `5`     | Maximum number of requests allowed per window     |
| `RATE_LIMIT_WINDOW`  | `60`    | Time window in seconds before the counter resets  |

When the limit is exceeded, the API responds with:

- **Status:** `429 Too Many Requests`
- **Header:** `Retry-After: <seconds>`
- **Body:** `{ "detail": "Too many requests. Try again later." }`

The frontend handles this gracefully with a visual cooldown countdown on the Shorten button and a toast notification.

---

## Design Decisions

### Modular Project Structure

The project is organized into dedicated modules to improve readability, maintainability, and scalability.

- `routers/` handles API routes.
- `crud.py` contains all database operations.
- `models.py` defines database models.
- `schemas.py` defines request and response models.
- `utils.py` contains reusable helper functions.
- `config.py` manages environment configuration.
- `rate_limiter.py` enforces per-IP rate limits using Redis.

---

### Layered Architecture

Business logic is separated from routing logic. Route handlers are responsible only for request validation, response formatting, and error handling, while database operations are encapsulated within the CRUD layer.

---

### Generic API Responses

A reusable generic response model provides a consistent response format across all endpoints.

Example:

```json
{
  "data": {
    ...
  }
}
```

---

### Custom Short Codes

Users can optionally provide their own short code when creating a URL. The system validates the code against:

1. **Format rules** — must be 6–30 characters, alphanumeric with hyphens and underscores (enforced by Pydantic schema).
2. **Reserved codes** — a server-side set of protected routes (`shorten`, `stats`, `docs`, `redoc`, `openapi.json`) that cannot be used as short codes.
3. **Uniqueness** — the code is checked against existing entries to prevent conflicts.

The custom code is lowercased before storage to ensure case-insensitive uniqueness.

---

### Duplicate URL Detection

When a URL that already exists in the database is submitted, the system returns the existing short URL rather than creating a duplicate entry. This keeps the database clean and ensures consistent short codes for the same destination.

---

### Collision-Resistant Short Codes

Short codes are generated using cryptographically secure random values (`secrets` module) and validated against the database before insertion to ensure uniqueness.

---

### Click Analytics

Every successful redirect increments a persistent click counter stored in the database. Users can look up analytics on the dedicated Stats page.

---

### Environment-Based Configuration

Application configuration is managed using Pydantic Settings with environment variables loaded from a `.env` file, allowing seamless migration between development and production environments without code changes.

---

### Dual Database Support

The application detects whether the configured `DATABASE_URL` points to SQLite or PostgreSQL and adjusts the engine creation accordingly (e.g., `check_same_thread=False` for SQLite). This allows easy local development with SQLite while using PostgreSQL in production.

---

### Database Seeding

On first startup, the application automatically seeds the database with sample URL entries if the table is empty, providing immediate data for testing and demonstration.

---

### Toast Notification System

The frontend includes a fully custom toast notification system (no React dependencies — pure vanilla JS) with:

- Four toast types: success, error, warning, and info
- Auto-dismiss with configurable duration
- Animated progress bar
- Manual close button
- Accessible `aria-live` regions
- Context-aware messages for different error types (rate limit, code conflict, reserved code, validation)

---

### Granular Frontend Error Handling

The frontend differentiates between backend error types and provides specific, actionable feedback:

| HTTP Status | Frontend Behavior                                                |
|-------------|------------------------------------------------------------------|
| `400`       | Warning toast — "Reserved code" — highlights the custom code input |
| `409`       | Warning toast — "Code already taken" — selects the input for quick edit |
| `422`       | Warning toast — displays Pydantic validation details              |
| `429`       | Error toast + cooldown countdown on the Shorten button            |
| `404`       | Error toast — "Not found" (on stats page)                        |
| Network     | Error toast — "Connection failed" + inline error message          |

---

## Running Locally

### Clone the repository

```bash
git clone https://github.com/GuruShrihari/UrlShortener.git
cd UrlShortener
```

### Create a virtual environment

```bash
python -m venv .venv
```

### Activate the virtual environment

**Windows**

```bash
.venv\Scripts\activate
```

**Linux/macOS**

```bash
source .venv/bin/activate
```

### Install dependencies

```bash
pip install -r requirements.txt
```

### Configure environment variables

Create a `.env` file in the project root.

```env
DATABASE_URL=<your_database_url>
REDIS_URL=<your_redis_url>
RATE_LIMIT=5
RATE_LIMIT_WINDOW=60
```

> **Note:** For local development without PostgreSQL, you can use a SQLite URL:  
> `DATABASE_URL=sqlite:///database.db`

### Run the backend

```bash
uvicorn app.main:app --reload
```

### Open the application

API Documentation

```
http://127.0.0.1:8000/docs
```

---

## Deployment

The project is deployed using a modern cloud-native stack.

| Component  | Platform        |
|------------|-----------------|
| Frontend   | Vercel          |
| Backend    | Render          |
| Database   | Neon PostgreSQL |
| Cache      | Redis Cloud     |

---

## Future Improvements

- URL expiration
- User authentication
- QR code generation
- Docker support
- Automated testing with Pytest
- Redis caching for URL lookups
- Analytics dashboard with charts
- URL management dashboard

---

## What I Learned

This project provided practical experience in:

- Designing RESTful APIs with FastAPI
- Building modular backend applications
- Working with SQLModel as an ORM
- Structuring projects using routers, CRUD, models, and schemas
- Managing configuration using Pydantic Settings and environment variables
- Integrating PostgreSQL with a FastAPI application
- Implementing IP-based rate limiting with Redis
- Implementing custom short code validation with reserved code protection
- Deploying backend services on Render
- Deploying static frontend applications on Vercel
- Connecting cloud-hosted applications to a managed PostgreSQL database
- Building and consuming REST APIs using Vanilla JavaScript
- Handling CORS for cross-origin communication
- Designing responsive user interfaces without frontend frameworks
- Building custom toast notification systems
- Handling granular API error states in the frontend (409, 400, 422, 429)
- Handling rate-limit UX with cooldown countdowns

---

## License

This project is licensed under the MIT License.
