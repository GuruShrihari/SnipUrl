# URL Shortener

A production-ready URL Shortener built using FastAPI and SQLModel with a focus on clean architecture, modular design, and deployment-ready backend development. The application allows users to generate short URLs, redirect to the original destination, and retrieve analytics such as click counts and creation timestamps.

The project follows backend engineering best practices including separation of concerns, environment-based configuration, reusable CRUD operations, and a layered project structure.

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

- Generate unique 6-character short URLs
- Redirect users to the original URL
- Track click counts automatically
- Retrieve URL statistics
- Collision-resistant short code generation
- PostgreSQL database integration
- Environment-based configuration
- Modular project architecture
- Interactive API documentation using Swagger UI
- Responsive frontend built with HTML, CSS, and JavaScript

---

## Tech Stack

### Backend

- FastAPI
- SQLModel
- PostgreSQL (Neon)
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

---

## Project Structure

```
UrlShortner/
│
├── app/
│   ├── routers/
│   │   ├── __init__.py
│   │   └── urls.py
│   │
│   ├── config.py
│   ├── crud.py
│   ├── database.py
│   ├── models.py
│   ├── schemas.py
│   ├── utils.py
│   └── main.py
│
├── frontend/
│   ├── index.html
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
                     │
                     ▼
              FastAPI REST API
                     │
                     ▼
                 CRUD Layer
                     │
                     ▼
              SQLModel ORM
                     │
                     ▼
        PostgreSQL Database (Neon)
```

---

## API Endpoints

### Create Short URL

```
POST /shorten
```

Creates a shortened URL from a valid input URL.

---

### Redirect

```
GET /{short_code}
```

Redirects the user to the original URL and increments the click counter.

---

### URL Statistics

```
GET /stats/{short_code}
```

Returns:

- Original URL
- Short Code
- Total Clicks
- Creation Timestamp

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

### Collision-Resistant Short Codes

Short codes are generated using cryptographically secure random values and validated against the database before insertion to ensure uniqueness.

---

### Click Analytics

Every successful redirect increments a persistent click counter stored in the database.

---

### Environment-Based Configuration

Application configuration is managed using environment variables, allowing seamless migration between development and production environments without code changes.

---

## Running Locally

### Clone the repository

```bash
git clone https://github.com/<username>/<repository>.git
cd UrlShortner
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
```

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

| Component | Platform |
|-----------|----------|
| Frontend | Vercel |
| Backend | Render |
| Database | Neon PostgreSQL |

---

## Future Improvements

- Custom aliases for URLs
- URL expiration
- User authentication
- QR code generation
- Rate limiting
- Docker support
- Automated testing with Pytest
- Redis caching
- Analytics dashboard
- URL management dashboard

---

## What I Learned

This project provided practical experience in:

- Designing RESTful APIs with FastAPI
- Building modular backend applications
- Working with SQLModel as an ORM
- Structuring projects using routers, CRUD, models, and schemas
- Managing configuration using environment variables
- Integrating PostgreSQL with a FastAPI application
- Deploying backend services on Render
- Deploying static frontend applications on Vercel
- Connecting cloud-hosted applications to a managed PostgreSQL database
- Building and consuming REST APIs using Vanilla JavaScript
- Handling CORS for cross-origin communication
- Designing responsive user interfaces without frontend frameworks

---

## License

This project is licensed under the MIT License.
