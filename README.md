# test_progress_dashboard

Monorepo with a React + TypeScript frontend and a Node + TypeScript backend.

Database: PostgreSQL database named `test_progress` (docker-compose provided).

Quick start (requires Docker and Node.js):

1. Start Postgres:

```bash
docker compose up -d
```

2. Install backend deps and run backend (from `backend`):

```bash
cd backend
npm install
npm run dev
```

3. Install frontend deps and run frontend (from `frontend`):

```bash
cd frontend
npm install
npm run dev
```

Database connection URL used by backend: `postgresql://postgres:postgres@localhost:5432/test_progress`
