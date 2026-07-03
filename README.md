# boilerplate

This repository will be covering multiple components as stated below:
- Auth

The setup:

1. Fork the repository

2. Clone the repository

3. Create a virtual environment by running:

Windows: python -m venv .venv

macOS / Linux: python3 -m venv venv

4. Activate your virtual environment

Windows (Command Prompt): venv\Scripts\activate.batWindows (PowerShell): venv\Scripts\Activate.ps1macOS / Linux: source venv/bin/activate

pip install -r requirements.txt


Creating a local database

For Linux (Ubuntu/Debian)Linux installations protect the database with an OS-level user. Route your command through the system postgres user:bash# 1. Access the PostgreSQL prompt using the postgres OS account
psql -U postgres

# 2. Create your user account inside the database engine
CREATE USER my_django_user WITH PASSWORD 'your_password';

# 3. Grant database creation permissions
ALTER USER my_django_user CREATEDB;

# 4. Exit the CLI
\q
Use code with caution.For WindowsOpen your Command Prompt (cmd) or PowerShell and run the following:shell# 1. Log into the console using the default admin account (it will prompt for the password you picked during installation)
psql -U postgres

# 2. Create your account
CREATE USER my_django_user WITH PASSWORD 'your_password';

# 3. Elevate permissions so Django can run migrations and tests
ALTER USER my_django_user CREATEDB;

# 4. Exit the tool
\q
Use code with caution.Next Action: Update your .env stringOnce you finish executing the steps above, update your .env connection string to use your newly configured account details:envDATABASE_URL=postgres://my_django_user:your_password@localhost:5432/my_local_db
Use code with caution.

. Create the Database and Connect Usersql-- 1. Create a physical database container
CREATE DATABASE my_local_db;

-- 2. Assign full administrative rights of the database to your user
GRANT ALL PRIVILEGES ON DATABASE my_local_db TO my_django_user;

-- 3. Grant schema modification permissions (Required for Django 15+ / PG 15+)
\c my_local_db
GRANT ALL ON SCHEMA public TO my_django_user;
Use code with caution.2. Verify Your ConfigurationExit the admin session and try logging in directly using your new credentials to verify everything works:bash# 1. Exit admin session
\q

# 2. Log in using your new user and database name
psql -U my_django_user -d my_local_db -h localhost
Use code with caution.(It will prompt you for the password you assigned to my_django_user)3. Your Final .env StringUpdate your project's .env configuration file to point directly to this database:envDATABASE_URL=postgres://my_django_user:your_password@localhost:5432/my_local_db
Use code with caution.

create an .env use, the .env.example to guide you.