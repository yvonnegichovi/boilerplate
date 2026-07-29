# Boilerplate

A modern full-stack boilerplate built with **Django** and **React (Vite)**, providing a solid foundation for building scalable web applications.

![Django](https://img.shields.io/badge/Django-5.0-092E20?style=flat&logo=django&logoColor=white)
![DRF](https://img.shields.io/badge/Django_REST_Framework-3.15-red?style=flat)
![React](https://img.shields.io/badge/React-18-61DAFB?style=flat&logo=react&logoColor=black)
![Vite](https://img.shields.io/badge/Vite-5-646CFF?style=flat&logo=vite&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15-4169E1?style=flat&logo=postgresql&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-4-06B6D4?style=flat&logo=tailwindcss&logoColor=white)
![JWT](https://img.shields.io/badge/JWT-SimpleJWT-black?style=flat&logo=jsonwebtokens)

---

## Tech Stack

### Backend
- **Django 5** — web framework
- **Django REST Framework** — REST API layer
- **SimpleJWT** — JWT authentication with token rotation and blacklisting
- **drf-spectacular** — OpenAPI 3 schema + Swagger UI
- **PostgreSQL** — relational database
- **python-decouple** — environment variable management

### Frontend
- **React 18** — UI library
- **Vite** — build tool and dev server
- **React Router v6** — client-side routing
- **Zustand** — auth state management
- **Axios** — HTTP client with JWT interceptors
- **Tailwind CSS v4** — utility-first styling
- **React Hook Form** — form handling and validation

---

## Features

### Implemented
- [x] Custom User model (UUID PK, email-based auth, phone number, avatar)
- [x] JWT authentication — register, login, logout, token refresh
- [x] Silent token refresh via Axios interceptor (with request queue)
- [x] Protected routes with automatic redirect
- [x] Profile management — view and update
- [x] Password change with old password verification
- [x] Swagger UI at `/api/docs/` and ReDoc at `/api/redoc/`
- [x] Modular `apps/` architecture — each feature is a self-contained Django app
- [x] `docs.py` convention — OpenAPI decorators separated from business logic
- [x] Full backend test suite — models, serializers, and API endpoints
- [x] CI/CD pipeline with GitHub Actions (dev and production workflows)

### Coming Soon
- [ ] Tasks module — CRUD with status, priority, and due dates
- [ ] Blog module — posts, categories, and tags
- [ ] File uploads
- [ ] Docker + docker-compose
- [ ] Frontend tests (Vitest + React Testing Library)

---

## Project Structure

```text
.
├── backend/
│   ├── core/                   # Django project config (settings, urls, wsgi)
│   ├── apps/
│   │   └── authentication/     # Auth module
│   │       ├── models.py
│   │       ├── serializers.py
│   │       ├── views.py
│   │       ├── docs.py         # OpenAPI decorators
│   │       ├── urls.py
│   │       ├── admin.py
│   │       └── tests/
│   ├── manage.py
│   ├── requirements.txt
│   └── .env.example
│
├── frontend/
│   ├── src/
│   │   ├── api/                # Axios client and API functions
│   │   ├── components/         # Reusable components
│   │   ├── context/            # Zustand stores
│   │   ├── pages/              # Page components
│   │   └── styles/             # CSS and Tailwind
│   ├── index.html
│   ├── package.json
│   └── vite.config.js
│
└── README.md
```

---

## Getting Started

### Prerequisites

- Python 3.11+
- Node.js 22+
- PostgreSQL 15+
- Git

---

## Backend Setup

### 1. Fork and Clone

```bash
git clone https://github.com/<your-username>/<repository>.git
cd <repository>
```

### 2. Create and Activate a Virtual Environment

**macOS / Linux**
```bash
python3 -m venv venv
source venv/bin/activate
```

**Windows (Command Prompt)**
```cmd
python -m venv venv
venv\Scripts\activate.bat
```

**Windows (PowerShell)**
```powershell
python -m venv venv
venv\Scripts\Activate.ps1
```

### 3. Install Dependencies

```bash
cd backend
pip install -r requirements.txt
```

---

## Environment Variables

Copy `.env.example` to `.env` and update the values:

**macOS / Linux**
```bash
cp .env.example .env
```

**Windows**
```cmd
copy .env.example .env
```

`.env` reference:

```env
SECRET_KEY=your-secret-key
DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1
DATABASE_URL=postgres://my_django_user:your_password@localhost:5432/my_local_db
CORS_ALLOWED_ORIGINS=http://localhost:5173,http://localhost:3000
```

---

## PostgreSQL Setup

### Create a User and Database

```bash
psql -U postgres
```

```sql
CREATE USER my_django_user WITH PASSWORD 'your_password';
ALTER USER my_django_user CREATEDB;

CREATE DATABASE my_local_db;
GRANT ALL PRIVILEGES ON DATABASE my_local_db TO my_django_user;

\c my_local_db
GRANT ALL ON SCHEMA public TO my_django_user;
\q
```

### Verify the Connection

```bash
psql -U my_django_user -d my_local_db -h localhost
```

A successful connection confirms your PostgreSQL setup is complete.

---

## Database Migrations

```bash
python manage.py migrate
python manage.py createsuperuser
```

---

## Running the Backend

```bash
python manage.py runserver
```

| URL | Description |
|-----|-------------|
| `http://localhost:8000/admin/` | Django admin |
| `http://localhost:8000/api/docs/` | Swagger UI |
| `http://localhost:8000/api/redoc/` | ReDoc |

---

## Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

Frontend runs at `http://localhost:5173`.

### Tailwind CSS

Tailwind v4 is configured via the `@tailwindcss/vite` plugin — no `tailwind.config.js` required. If setting up from scratch:

```bash
npm install -D tailwindcss @tailwindcss/vite
```

Add the plugin to `vite.config.js`:

```js
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
})
```

Add to your main CSS file:

```css
@import "tailwindcss";
```

---

## API Documentation

Interactive API documentation is available once the backend is running:

- **Swagger UI** — `http://localhost:8000/api/docs/`
- **ReDoc** — `http://localhost:8000/api/redoc/`
- **OpenAPI schema** — `http://localhost:8000/api/schema/`

### Authentication Endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/auth/register/` | Public | Create account |
| POST | `/api/auth/login/` | Public | Obtain tokens |
| POST | `/api/auth/logout/` | Required | Blacklist refresh token |
| POST | `/api/auth/token/refresh/` | Public | Rotate tokens |
| GET | `/api/auth/me/` | Required | Get profile |
| PATCH | `/api/auth/me/` | Required | Update profile |
| PUT | `/api/auth/change-password/` | Required | Change password |

---

## Authentication Flow

1. User registers → backend creates account and returns access token, refresh token, and user object
2. Tokens stored in `localStorage` by the Zustand auth store
3. Axios attaches `Authorization: Bearer <token>` to every request
4. On 401, Axios silently calls `/api/auth/token/refresh/` and retries the original request
5. Concurrent requests during refresh are queued — only one refresh fires at a time
6. On logout, the refresh token is blacklisted server-side

---

## Running Tests

```bash
cd backend
source venv/bin/activate
python manage.py test apps.authentication.tests --verbosity=2
```

Tests cover:
- **Models** — UUID PK, password hashing, email normalisation, `full_name`, optional fields
- **Serializers** — validation, duplicate email, weak passwords, write-only password
- **Views** — all 7 endpoints including token blacklisting, rotation, and edge cases

---

## Local Development Workflow

1. Pull latest changes: `git pull`
2. Activate virtual environment
3. Install new backend deps: `pip install -r requirements.txt`
4. Apply migrations: `python manage.py migrate`
5. Start backend: `python manage.py runserver`
6. Install new frontend deps: `npm install`
7. Start frontend: `npm run dev`
8. Develop your feature
9. Run tests: `python manage.py test`
10. Commit, push, and open a Pull Request

---

## Troubleshooting

**CORS errors**
Ensure the frontend URL is in `CORS_ALLOWED_ORIGINS` in your `.env`.

**Database connection errors**
- Confirm PostgreSQL is running
- Verify `DATABASE_URL` credentials match your PostgreSQL user and database
- Confirm the database exists and the user has the correct privileges

**Migration errors**
- Confirm PostgreSQL is running
- Confirm the database has been created
- Confirm environment variables are loaded (`source venv/bin/activate` and `.env` is present)

**`DATABASE_URL not found` error**
You likely haven't created your `.env` file. Run `cp .env.example .env` and fill in your values.

---

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature`
3. Make your changes
4. Run tests: `python manage.py test`
5. Commit: `git commit -m "feat: your feature description"`
6. Push: `git push origin feature/your-feature`
7. Open a Pull Request against `dev`

---

## License

boilerplate - Yvonne Gichovi Repository
