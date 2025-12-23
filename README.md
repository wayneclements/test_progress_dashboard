# test_progress_dashboard

A full-stack monorepo application with a React frontend and Node.js backend, connected to a PostgreSQL database.

## Project Structure

```
test_progress_dashboard/
├── backend/
│   ├── src/
│   │   ├── index.ts          # Express server & API endpoints
│   │   └── migrate.ts        # Database migration runner
│   ├── migrations/
│   │   └── 001_create_projects.sql  # Projects table schema
│   ├── scripts/
│   │   ├── create_db.js      # Create PostgreSQL database
│   │   ├── drop_db.js        # Drop PostgreSQL database
│   │   ├── insert_project.js # Insert test project
│   │   ├── query_projects.js # Query all projects
│   │   └── describe_table.js # Show table columns
│   ├── package.json
│   ├── tsconfig.json
│   └── .env                  # Database credentials
├── frontend/
│   ├── src/
│   │   └── main.js           # React app (no build step)
│   ├── index.html            # HTML entry point
│   ├── server.js             # Express static server
│   ├── package.json
│   └── global.css            # Stylesheet
└── README.md
```

## Prerequisites

- **Node.js** (v16+)
- **PostgreSQL** (v12+) running locally on `localhost:5432`
- PostgreSQL user credentials (default: `postgres` / `postgres`)

## Setup Instructions

### 1. Database Setup

Ensure PostgreSQL is running. Create the `test_process` database using the helper script:

```powershell
cd backend
npm install
node scripts/create_db.js
```

Or manually with psql:
```powershell
$env:PGPASSWORD='postgres'
psql -U postgres -h localhost -p 5432 -c "CREATE DATABASE test_process;"
```

### 2. Backend Setup

Install dependencies and run migrations:

```powershell
cd backend
npm install
npm run migrate
```

Update `.env` if your PostgreSQL credentials differ from the defaults:
```
DATABASE_URL=postgres://postgres:its@localhost:5432/test_process
```

### 3. Frontend Setup

Install dependencies only (no build step needed):

```powershell
cd frontend
npm install
```

## Running the Application

### Start the Backend

```powershell
cd backend
npm run dev
```

Backend runs on `http://localhost:4000`

**Available endpoints:**
- `GET /api/health` - Health check
- `GET /api/projects` - List all projects

### Start the Frontend

```powershell
cd frontend
npm start
```

Frontend runs on `http://localhost:3000`

Frontend UI:
- Left panel: lists project names.
- Right panel: shows Description of the selected project.

## Utility Scripts

### Backend Database Management

**Create database:**
```powershell
cd backend
node scripts/create_db.js
```

**Drop database:**
```powershell
cd backend
node scripts/drop_db.js
```

**Insert test project:**
```powershell
cd backend
node scripts/insert_project.js
```

**Query all projects:**
```powershell
cd backend
node scripts/query_projects.js
```

**Show projects table columns:**
```powershell
cd backend
node scripts/describe_table.js projects
```

## Database Schema

### Projects Table

```sql
CREATE TABLE projects (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

| Column | Type | Nullable | Default |
|--------|------|----------|---------|
| id | integer | NO | auto-increment |
| name | varchar(255) | NO | — |
| description | text | YES | — |
| created_at | timestamp | YES | CURRENT_TIMESTAMP |
| updated_at | timestamp | YES | CURRENT_TIMESTAMP |

## Architecture

- **Backend:** Express.js + TypeScript on port 4000
- **Frontend:** React 18 (via CDN) with Babel for JSX transpilation, served by Express on port 3000
- **Database:** PostgreSQL with SQL migrations

No Docker, Vite, or build tools required — minimal, direct setup.

## Notes

- Frontend loads React from CDN and transpiles JSX in-browser using Babel (development-friendly).
- Backend uses dotenv to load `DATABASE_URL` from `.env`.
- Migrations run via `npm run migrate` using the `ts-node` TypeScript runner.
- All database utilities are simple Node.js scripts using the `pg` library.

## Troubleshooting

- Frontend “refused to connect”:
  - Ensure the frontend server is running:
    ```powershell
    cd frontend
    npm start
    ```
  - Then open http://localhost:3000

- Frontend “Error: Failed to fetch”:
  - Ensure backend is running on port 4000:
    ```powershell
    cd backend
    npm run dev
    ```
  - Test the API directly: http://localhost:4000/api/projects
  - If on a different host/port, update the fetch URL in `frontend/src/main.js`.

- Database connection errors:
  - Verify PostgreSQL is running on localhost:5432.
  - Check `backend/.env` `DATABASE_URL` matches your credentials and database name.
  - Create DB and run migrations:
    ```powershell
    cd backend
    node scripts/create_db.js
    npm run migrate
    ```
