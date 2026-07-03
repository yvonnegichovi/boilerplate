# Boilerplate

A modern full-stack boilerplate built with **Django** and **React (Vite)**, providing a solid foundation for building scalable web applications.

## Tech Stack

### Backend
- Django 5
- Django REST Framework
- SimpleJWT Authentication
- PostgreSQL

### Frontend
- React 18
- Vite
- React Router v6
- Zustand
- Axios
- Tailwind CSS

---

# Project Structure

```text
.
├── backend/
│   ├── core/
│   ├── apps/
│   │   └── authentication/
│   ├── manage.py
│   └── requirements.txt
│
├── frontend/
│   ├── src/
│   ├── public/
│   └── package.json
│
└── README.md
```

---

# Getting Started

## 1. Fork the Repository

Fork this repository into your GitHub account.

---

## 2. Clone the Repository

```bash
git clone https://github.com/<your-username>/<repository>.git

cd <repository>
```

---

# Backend Setup

## 1. Create a Virtual Environment

### Windows

```bash
python -m venv .venv
```

### macOS / Linux

```bash
python3 -m venv .venv
```

---

## 2. Activate the Virtual Environment

### Windows (Command Prompt)

```cmd
.venv\Scripts\activate.bat
```

### Windows (PowerShell)

```powershell
.venv\Scripts\Activate.ps1
```

### macOS / Linux

```bash
source .venv/bin/activate
```

---

## 3. Install Dependencies

```bash
pip install -r requirements.txt
```

---

# Environment Variables

Create a `.env` file in the backend root.

> **Do not create it manually.**
>
> Copy the values from `.env.example` and replace the placeholder values with your local configuration.

Example:

```bash
cp .env.example .env
```

or on Windows

```cmd
copy .env.example .env
```

Update the variables as needed.

Example:

```env
SECRET_KEY=your-secret-key

DEBUG=True

DATABASE_URL=postgres://my_django_user:your_password@localhost:5432/my_local_db

ALLOWED_HOSTS=localhost,127.0.0.1

CORS_ALLOWED_ORIGINS=http://localhost:5173,http://localhost:3000
```

---

# PostgreSQL Setup

## Create a PostgreSQL User

### Linux (Ubuntu/Debian)

```bash
psql -U postgres
```

Create a user.

```sql
CREATE USER my_django_user
WITH PASSWORD 'your_password';
```

Grant database creation privileges.

```sql
ALTER USER my_django_user CREATEDB;
```

Exit PostgreSQL.

```sql
\q
```

---

### Windows

Open Command Prompt or PowerShell.

```bash
psql -U postgres
```

Create the user.

```sql
CREATE USER my_django_user
WITH PASSWORD 'your_password';
```

Grant permissions.

```sql
ALTER USER my_django_user CREATEDB;
```

Exit.

```sql
\q
```

---

# Create the Database

Login as postgres.

```bash
psql -U postgres
```

Create the database.

```sql
CREATE DATABASE my_local_db;
```

Grant privileges.

```sql
GRANT ALL PRIVILEGES
ON DATABASE my_local_db
TO my_django_user;
```

Connect to the database.

```sql
\c my_local_db
```

Grant schema permissions.

```sql
GRANT ALL ON SCHEMA public TO my_django_user;
```

Exit PostgreSQL.

```sql
\q
```

---

# Verify the Database

Login using your newly created user.

```bash
psql -U my_django_user -d my_local_db -h localhost
```

If you successfully connect, your PostgreSQL configuration is complete.

---

# Database Migrations

Run the initial migrations.

```bash
python manage.py migrate
```

Create an administrator account.

```bash
python manage.py createsuperuser
```

---

# Running the Backend

Start the Django development server.

```bash
python manage.py runserver
```

Backend URL:

```
http://localhost:8000
```

---

# Frontend Setup

Navigate to the frontend directory.

```bash
cd frontend
```

Install dependencies.

```bash
npm install
```

### Install Tailwind CSS

If Tailwind CSS has not already been installed, run the following commands from the `frontend` directory.

```bash
npm install -D tailwindcss @tailwindcss/vite
```

Update your `vite.config.js` (or `vite.config.ts`) to include the Tailwind Vite plugin.

```javascript
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
});
```

Import Tailwind into your main stylesheet (for example, `src/index.css` or `src/styles/main.css`).

```css
@import "tailwindcss";
```

Ensure your application's entry file imports the stylesheet.

```javascript
import "./index.css";
```

You can verify the installation by adding a Tailwind utility class to a component.

```jsx
function App() {
  return (
    <h1 className="text-3xl font-bold text-blue-600">
      Tailwind CSS is working!
    </h1>
  );
}
```

If the styled text appears correctly when running the application, Tailwind CSS has been configured successfully.

Run the development server.

```bash
npm run dev
```

Frontend URL:

```
http://localhost:5173
```

---

# Authentication Flow

Authentication is handled using **JWT (JSON Web Tokens)** via **Django REST Framework SimpleJWT**.

The authentication flow is as follows:

1. A user registers through the frontend.
2. The backend creates the account.
3. The backend returns:
   - Access Token
   - Refresh Token
   - User object
4. Tokens are securely stored by the frontend.
5. Axios automatically attaches the access token to authenticated requests.
6. When the access token expires, Axios silently refreshes it using the refresh token.
7. If the refresh token has expired or is invalid, the user is redirected to the login page.

---

# Local Development Workflow

Typical development workflow:

1. Pull the latest changes.

```bash
git pull
```

2. Activate the virtual environment.

3. Install any new dependencies.

```bash
pip install -r requirements.txt
```

4. Apply database migrations.

```bash
python manage.py migrate
```

5. Start the backend.

```bash
python manage.py runserver
```

6. Start the frontend.

```bash
npm run dev
```

7. Develop your feature.

8. Run tests before committing.

9. Commit your changes.

10. Push your branch and open a Pull Request.

---

# Available Components

Current modules include:

- Authentication

Additional modules will be added as development progresses.

---

# Troubleshooting

## CORS Errors

Ensure the frontend URL is included in:

```env
CORS_ALLOWED_ORIGINS
```

---

## Database Connection Errors

Verify:

- PostgreSQL is running.
- `DATABASE_URL` is correct.
- The database exists.
- The configured user has the necessary privileges.

---

## Migration Errors

If migrations fail, ensure:

- PostgreSQL is running.
- The database has been created.
- Environment variables are correctly configured.

---

# Contributing

1. Fork the repository.
2. Create a feature branch.
3. Make your changes.
4. Run tests.
5. Submit a Pull Request.

---

# License

Specify the project's license here.