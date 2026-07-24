#  URL Shortener API

A production-ready URL Shortener built using **FastAPI** and **SQLModel**, following a clean, modular architecture. The project focuses on backend engineering practices such as API design, database abstraction, CRUD separation, configuration management, and deployment readiness rather than simply shortening URLs.

---

##  Features

- Generate unique 6-character short URLs
- Redirect users to the original URL
- Track click counts
- Retrieve URL statistics
- Collision-resistant short code generation
- RESTful API with automatic Swagger/OpenAPI documentation
- Generic API response wrapper for consistent responses
- Environment-based configuration using `.env`
- PostgreSQL-ready architecture (supports SQLite during development)

---

##  Tech Stack

| Category | Technology |
|----------|------------|
| Backend | FastAPI |
| ORM | SQLModel |
| Database | SQLite (Development), PostgreSQL (Production) |
| Validation | Pydantic |
| Configuration | Pydantic Settings |
| API Docs | Swagger UI / OpenAPI |
| Server | Uvicorn |

---

#  Project Structure

```
app/
│
├── routers/
│   ├── __init__.py
│   └── urls.py
│
├── crud.py
├── database.py
├── config.py
├── models.py
├── schemas.py
├── utils.py
└── main.py

.env.example
requirements.txt
README.md
```

---

#  Architecture

The project follows a layered architecture to separate responsibilities.

```
Client
   │
   ▼
FastAPI Router
   │
   ▼
CRUD Layer
   │
   ▼
SQLModel ORM
   │
   ▼
PostgreSQL / SQLite
```

### Router

Responsible only for:

- Receiving requests
- Returning responses
- Raising HTTP exceptions

### CRUD Layer

Responsible for all database operations:

- Creating short URLs
- Fetching URLs
- Updating click counts

### Models

Contains SQLModel database models.

### Schemas

Contains request and response models used by the API.

### Utils

Contains reusable helper functions including:

- Secure short code generation

### Config

Loads environment variables using Pydantic Settings.

---

# 📌 API Endpoints

## Create Short URL

```
POST /shorten
```

Creates a new shortened URL.

---

## Redirect

```
GET /{short_code}
```

Redirects to the original URL and increments the click counter.

---

## URL Statistics

```
GET /stats/{short_code}
```

Returns:

- Original URL
- Short Code
- Total Clicks
- Creation Timestamp

---

#  Design Decisions

### Clean Project Structure

The application was intentionally refactored from a single-file implementation into separate modules to improve maintainability.

- Routers
- CRUD
- Models
- Schemas
- Utilities
- Configuration

---

### Generic Response Model

A reusable generic response wrapper was implemented to ensure all API responses follow a consistent structure.

Example:

```json
{
    "data": {
        ...
    }
}
```

---

### Collision Handling

Generated short codes are checked against the database before insertion to ensure uniqueness.

---

### Click Analytics

Every successful redirect automatically increments the click counter stored in the database.

---

### Environment Configuration

Application configuration is loaded from environment variables instead of hardcoded values, making the project deployment-ready.

---

#  What I Learned

Building this project helped me gain practical experience with:

- Designing RESTful APIs using FastAPI
- Organizing backend projects using a layered architecture
- Using SQLModel for ORM-based database interactions
- Separating database logic into a dedicated CRUD layer
- Structuring request and response models with Pydantic
- Managing configuration through environment variables
- Generating collision-resistant short codes
- Implementing HTTP redirects
- Tracking analytics using database updates
- Preparing an application for production deployment

---

#  Running Locally

Clone the repository

```bash
git clone <repository-url>
cd url-shortener
```

Install dependencies

```bash
pip install -r requirements.txt
```

Create a `.env` file

```env
DATABASE_URL=sqlite:///database.db
```

Run the server

```bash
uvicorn app.main:app --reload
```

Open

```
http://127.0.0.1:8000/docs
```

---

#  Deployment

The application is designed to be deployed using:

- **Backend:** Render
- **Database:** PostgreSQL (Neon)
- **Frontend (Planned):** HTML, CSS, JavaScript deployed on Vercel

---

#  Future Improvements

- Custom aliases for shortened URLs
- QR Code generation
- URL expiration
- Rate limiting
- Docker support
- Automated tests using Pytest
- Redis caching
- User authentication
- Analytics dashboard

---

#  License

This project is licensed under the MIT License.