# test_progress_dashboard

A full-stack monorepo application with a React frontend and Node.js backend, connected to a PostgreSQL database.

## Project Structure

```
test_progress_dashboard/
├── backend/
│   ├── src/
│   │   ├── index.ts          # Express server & API endpoints
│   │   └── migrate.ts        # Database migration runner
│   ├── migrations/           # 30 SQL migration files for database schema evolution
│   │   ├── 001_create_projects.sql through 030_add_columns_to_global_tags.sql
│   ├── scripts/              # Database management utilities
│   │   ├── create_db.js, drop_db.js, insert_project.js
│   │   ├── query_*.js (projects, documents, tags)
│   │   ├── describe_*.js, and other utilities
│   ├── package.json
│   ├── tsconfig.json
│   └── .env                  # Database credentials
├── frontend/
│   ├── src/
│   │   ├── App.tsx           # React app root component (TypeScript)
│   │   ├── main.tsx          # React 18 entry point (TypeScript)
│   │   ├── main.js           # Legacy entry point (kept for reference)
│   │   └── global.css        # Global stylesheet
│   ├── index.html            # HTML entry point
│   ├── server.js             # Express static server
│   ├── package.json
│   └── tsconfig.json
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

Install dependencies:

```powershell
cd frontend
npm install
```

The frontend is built with **React 18** using **TypeScript** (`App.tsx` and `main.tsx`). It is served directly via Express without a separate build step during development.

**Development mode:**
The app runs directly from source with TypeScript transpiled at runtime.

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
- `GET /api/project-documents` - List documents (use `projectName` to filter)
  - Example: `GET /api/project-documents?projectName=Project%20No.%201`
- `GET /api/document-tags` - List tags for a document with type information (use `documentName`)
  - Example: `GET /api/document-tags?documentName=Test%20Plan`
  - Returns: `{ id, tag_name, document_name, created_at, type }`
- `GET /api/project-tags` - List all project tag values
- `POST /api/project-tags` - Create a new project tag value
- `PUT /api/project-tags/:id` - Update a project tag value
- `DELETE /api/project-tags/:id` - Delete a project tag value

### Start the Frontend

```powershell
cd frontend
npm start
```

Frontend runs on `http://localhost:3000`

**Architecture:**
- **Framework:** React 18 (TypeScript with `App.tsx` and `main.tsx`)
- **Editor:** Quill 1.3.6 (via CDN) for WYSIWYG rich text editing
- **Styling:** Global CSS with component-level styling
- **Main Page:** Lists all projects on the left panel; displays selected project description on the right panel. Double-click a project to open the Project page.
  - Left panel: Document cards in two columns; click a card to select a document.
  - Connector lines: A solid vertical line connects stacked cards.
  - Right panel: Shows document details and tag list for the selected document (`document_name`, description, and tags from `document_tags`).
  - Tag editing: Double-click a tag row to edit its value. Different modal types appear based on the tag's type:
    - **Text tags** (`type = 'text'`): "Edit Text Tag" modal with a text input field
    - **Rich text tags** (`type = 'rich_text'`): "Edit Rich Text Tag" modal with Quill WYSIWYG editor (700px wide, 300px height)
      - Features: Headers, bold, italic, underline, strike-through, lists, text/background colors, links, and clear formatting
      - Saves content as HTML
    - **Date tags** (`type = 'date'`): "Edit Date Tag" modal with a date picker input
  - Value display formats:
    - Dates: Displayed in `dd/MM/yyyy` format
    - Rich text: First 50 characters of plain text (HTML tags stripped) with "..." if longer
    - Text: Full value or "empty" if not set
  - Background color: Light yellow (#FFFFE0)

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
node scripts/insert_global_document.js "Document Name" "Document Description"
```

**Query global_documents:**
```powershell
cd backend
node scripts/query_global_document.js
```

**Query project_documents with aggregation:**
```powershell
cd backend
node scripts/query_project_documents.js
```

**Query global_tags:**
```powershell
cd backend
node scripts/query_global_tags.js
```

**Query project_tags:**
```powershell
cd backend
node scripts/query_project_tags.js
```

**Query document_tags:**
```powershell
cd backend
node scripts/query_document_tags.js
```

**Update tag type in global_tags:**
```powershell
cd backend
# Edit the script first to set the tag name and type you want
node scripts/update_global_tag_type.js
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

```sql
CREATE TABLE global_tags (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL UNIQUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  type TEXT
);
```

| Column | Type | Nullable | Default |
|--------|------|----------|---------|
| id | integer | NO | auto-increment |
| name | varchar(255) | NO | — |
| created_at | timestamp | YES | CURRENT_TIMESTAMP |
| type | text | YES | — |

The `type` column defines how the tag value should be edited and displayed:
- `'text'` - Standard text input field
- `'rich_text'` - Multiline textarea for longer content
- `'date'` - Date picker input (displays in dd/MM/yyyy format)

### global_documents Table

```sql
CREATE TABLE global_documents (
  id SERIAL PRIMARY KEY,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  document_name TEXT,
  document_description TEXT
);
```

| Column | Type | Nullable | Default |
|--------|------|----------|---------|
| id | integer | NO | auto-increment |
| created_at | timestamp | YES | CURRENT_TIMESTAMP |
| document_name | text | YES | — |
| document_description | text | YES | — |

### project_documents Table

```sql
CREATE TABLE project_documents (
  id SERIAL PRIMARY KEY,
  project_name TEXT NOT NULL,
  document_name TEXT NOT NULL,
  document_description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_project_documents_project_name ON project_documents(project_name);
ALTER TABLE project_documents ADD CONSTRAINT uniq_project_document UNIQUE (project_name, document_name);
```

| Column | Type | Nullable | Default |
|--------|------|----------|----------|
| id | integer | NO | auto-increment |
| project_name | text | NO | — |
| document_name | text | NO | — |
| document_description | text | YES | — |
| created_at | timestamp | YES | CURRENT_TIMESTAMP |

**Data:** Contains all global_documents copied for each project in the projects table (CROSS JOIN). Each project has all global documents associated with it. `document_name` is the identifier used across API and UI.

### document_tags Table

```sql
CREATE TABLE document_tags (
  id SERIAL PRIMARY KEY,
  tag_name VARCHAR,
  document_name VARCHAR,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

| Column | Type | Nullable | Default |
|--------|------|----------|---------|
| id | integer | NO | auto-increment |
| tag_name | varchar | YES | — |
| document_name | varchar | YES | — |
| created_at | timestamp | YES | CURRENT_TIMESTAMP |

## Architecture

- **Backend:** Express.js + TypeScript on port 4000, using `tsx` for TypeScript execution
  - Handles all API endpoints and database operations
  - Migrations managed via SQL files and `migrate.ts`
- **Frontend:** React 18 + TypeScript on port 3000
  - Entry points: `src/main.tsx` (TypeScript) with `src/App.tsx` root component
  - Legacy: `src/main.js` kept for reference
  - Server: Express static file server in `server.js`
  - Rich Text Editor: Quill 1.3.6 (CDN) for WYSIWYG tag editing
  - Styling: Global CSS + component-level styles
- **Database:** Local PostgreSQL with 30 SQL migrations for schema evolution

Docker has been removed; everything runs directly on your machine.

**Development Workflow:**
- Backend: `npm run dev` with `tsx --watch` for hot-reload on changes
- Frontend: Served by Express on port 3000, no build step required for development
- TypeScript: Compiled to JavaScript at runtime on backend and frontend

## Notes

- **Frontend:** Built with React 18 and TypeScript (`App.tsx`, `main.tsx`). Entry point is `main.tsx`.
- **Backend:** Uses `tsx` as the TypeScript runner for development, migrations, and scripts (replaces `ts-node-dev`).
- **Migrations:** 30 SQL migration files track schema evolution from initial tables through refinements.
- **Database:** Local PostgreSQL; all database utilities are simple Node.js scripts using the `pg` library.
- **Development:** Backend uses `npm run dev` with `tsx --watch` for hot-reload; Frontend served by Express.
- **project_documents table:** Stores documents scoped to project names (text-based, not FK-based).
  - All `global_documents` are duplicated in `project_documents` for each project via CROSS JOIN migration.
- **global_documents:** Contains only `id`, `created_at`, `document_name`, and `document_description`.
- **project_documents:** Contains only `id`, `project_name`, `document_name`, `document_description`, and `created_at`.
- **Tag types in global_tags:**
  - `'text'` - Simple input field
  - `'rich_text'` - Quill WYSIWYG editor with formatting toolbar (saves as HTML)
  - `'date'` - Date picker, displays in dd/MM/yyyy format
- **Rich text display:** HTML tags are stripped; first 50 characters of plain text shown in table with "..." if longer. Full content editable in modal.
- **API joins:** The `document-tags` endpoint joins with `global_tags` to include the `type` field for proper modal rendering.
- **No deprecated dependencies:** Removed `ts-node-dev` and transitive `inflight` dependency for a cleaner build.
## PostgreSQL Access via psql

You can access your PostgreSQL database directly using `psql`:

```powershell
# Set password environment variable
$env:PGPASSWORD='its'

# Connect to the database
psql -U postgres -d test_process

# Common commands in psql:
\dt              # List all tables
\d <tablename>   # Describe table structure
SELECT * FROM <tablename>;  # Query table
\q               # Exit psql
```

### Global Tags

The `global_tags` table currently contains the following tags (15 total):

| Tag Name | Type |
|----------|------|
| project_name | text |
| project_description | rich_text |
| project_start_date | date |
| project_test_strategy | text |
| project_test_scenarios | text |
| project_in_scope | text |
| project_out_of_scope | text |
| project_reference | text |
| project_delivery_manager | text |
| project_delivery_date | date |
| test_case | text |
| test_case_status | text |
| test_case_results | text |
| test_status | text |
| test_summary | text |

To view all tags:
```powershell
psql -U postgres -d test_process -c "SELECT id, name, type FROM global_tags;"
```

To update a tag's type:
```powershell
cd backend
# Edit scripts/update_global_tag_type.js to set the desired tag name and type
node scripts/update_global_tag_type.js
```
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
  - If on a different host/port, update the fetch URL in `frontend/src/main.tsx` or `frontend/src/main.js`.

- TypeScript compilation errors:
  - Ensure `tsconfig.json` is properly configured in both `backend/` and `frontend/`
  - Run `npm install` to ensure all dependencies are installed
  - Check that `tsx` is installed globally or in `node_modules` for TypeScript execution

- Database connection errors:
  - Verify PostgreSQL Windows service is running and listening on localhost:5432.
  - Check [backend/.env](backend/.env) `DATABASE_URL` matches your credentials and database name.
  - Create DB and run migrations:
    ```powershell
    cd backend
    node scripts/create_db.js test_process
    npm run migrate
    ```

- Port conflicts:
  - Backend default: 4000
  - Frontend default: 3000
  - If ports are in use, modify the port in `backend/src/index.ts` and `frontend/server.js`
