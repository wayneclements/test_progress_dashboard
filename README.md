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
│   │   ├── 001_create_projects.sql              # Projects table schema
│   │   ├── 002_create_global_tags.sql           # global_tags table schema
│   │   ├── 003_create_global_documents.sql      # global_documents table schema
│   │   ├── 004_add_documnet_id_to_global_documents.sql
│   │   ├── 005_add_documnet_description_to_global_documents.sql
│   │   ├── 006_rename_documnet_id_to_document_id.sql
│   │   ├── 007_rename_documnet_description_to_document_description.sql
│   │   ├── 008_create_project_documents.sql              # project_documents table schema
│   │   ├── 009_drop_title_from_global_documents.sql
│   │   ├── 010_drop_content_from_global_documents.sql
│   │   ├── 011_drop_content_from_project_documents.sql
│   │   ├── 012_drop_title_from_project_documents.sql
│   │   ├── 013_rename_project_id_to_project_name.sql
│   │   ├── 014_change_project_name_type_to_text.sql
│   │   ├── 015_drop_project_documents_table.sql
│   │   ├── 016_drop_fk_constraint.sql
│   │   ├── 017_recreate_project_documents_table.sql
│   │   └── 018_copy_global_documents_to_project_documents.sql│   ├── scripts/
│   │   ├── create_db.js                  # Create PostgreSQL database
│   │   ├── drop_db.js                    # Drop PostgreSQL database
│   │   ├── insert_project.js             # Insert test project
│   │   ├── query_projects.js             # Query all projects
│   │   ├── describe_table.js             # Show table columns
│   │   ├── insert_global_document.js     # Insert row to global_documents
│   │   ├── query_global_document.js      # Query global_documents by document_id
│   │   └── query_project_documents.js    # Query project_documents with aggregation
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
- **PostgreSQL** (v12+) installed locally on Windows (no Docker required)
- PostgreSQL user credentials (current `.env`): user `postgres`, password `its`, database `test_process`

## Setup Instructions

### 1. Database Setup (Local Postgres)

Ensure PostgreSQL is installed and running on your machine (Windows Services → PostgreSQL). Create the `test_process` database using the helper script (uses credentials from `.env`):

```powershell
cd backend
npm install
node scripts/create_db.js test_process
```

Or manually with psql:
```powershell
$env:PGPASSWORD='its'
psql -U postgres -h localhost -p 5432 -c "CREATE DATABASE test_process;"
```

### 2. Backend Setup

Install dependencies and run migrations:

```powershell
cd backend
npm install
npm run migrate
```

**TypeScript Runner:** The backend uses `tsx` for running TypeScript at development and migration time (replaced `ts-node-dev` to eliminate the deprecated `inflight` dependency).

Confirm or update `backend/.env` with your local credentials:

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

**Describe a table (e.g., projects):**
```powershell
cd backend
node scripts/describe_table.js projects
```

**Insert document to global_documents:**
```powershell
cd backend
node scripts/insert_global_document.js "Document ID" "Document Description"
```

**Query global_documents by document_id:**
```powershell
cd backend
node scripts/query_global_document.js "Document ID"
```

**Query project_documents with aggregation:**
```powershell
cd backend
node scripts/query_project_documents.js
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

### global_tags Table

```
CREATE TABLE global_tags (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL UNIQUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

| Column | Type | Nullable | Default |
|--------|------|----------|---------|
| id | integer | NO | auto-increment |
| name | varchar(255) | NO | — |
| created_at | timestamp | YES | CURRENT_TIMESTAMP |

### global_documents Table

```sql
CREATE TABLE global_documents (
  id SERIAL PRIMARY KEY,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  document_id TEXT UNIQUE,
  document_description TEXT UNIQUE
);
```

| Column | Type | Nullable | Default |
|--------|------|----------|---------|
| id | integer | NO | auto-increment |
| created_at | timestamp | YES | CURRENT_TIMESTAMP |
| document_id | text | YES | — |
| document_description | text | YES | — |

### project_documents Table

```sql
CREATE TABLE project_documents (
  id SERIAL PRIMARY KEY,
  project_name TEXT NOT NULL,
  document_id TEXT NOT NULL,
  document_description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_project_documents_project_name ON project_documents(project_name);
ALTER TABLE project_documents ADD CONSTRAINT uniq_project_document_id UNIQUE (project_name, document_id);
```

| Column | Type | Nullable | Default |
|--------|------|----------|----------|
| id | integer | NO | auto-increment |
| project_name | text | NO | — |
| document_id | text | NO | — |
| document_description | text | YES | — |
| created_at | timestamp | YES | CURRENT_TIMESTAMP |

**Data:** Contains all global_documents copied for each project in the projects table (CROSS JOIN). Each project has all global documents associated with it.

## Architecture

- **Backend:** Express.js + TypeScript on port 4000, using `tsx` for TypeScript execution
- **Frontend:** React 18 (via CDN) with Babel for JSX transpilation, served by Express on port 3000
- **Database:** Local PostgreSQL with SQL migrations
- **Dependencies:** Cleaned of deprecated packages (removed `ts-node-dev` and transitive `inflight` dependency)

Docker has been removed; everything runs directly on your machine.

## Notes

- Frontend loads React from CDN and transpiles JSX in-browser using Babel (development-friendly).
- Backend uses dotenv to load `DATABASE_URL` from `.env`.
- Migrations run via `npm run migrate` using `tsx` as the TypeScript runner.
- All database utilities are simple Node.js scripts using the `pg` library.
- Backend development uses `npm run dev` with `tsx --watch` for hot-reload.
- `project_documents` table stores documents scoped to project names (text-based, not FK-based).
- All global_documents are duplicated in `project_documents` for each project via CROSS JOIN migration.
- `global_documents` contains only `id`, `created_at`, `document_id`, and `document_description` (no `title` or `content`).
- `project_documents` contains only `id`, `project_name`, `document_id`, `document_description`, and `created_at` (no `title` or `content`).

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
  - Verify PostgreSQL Windows service is running and listening on localhost:5432.
  - Check [backend/.env](backend/.env) `DATABASE_URL` matches your credentials and database name.
  - Create DB and run migrations:
    ```powershell
    cd backend
    node scripts/create_db.js test_process
    npm run migrate
    ```
