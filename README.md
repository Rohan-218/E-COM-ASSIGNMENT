# E-COM-ASSIGNMENT

Fullstack e-commerce assignment — server (Node/Express) and a React frontend.

This repository contains the backend server implementation inside the `server/` folder and an expected React frontend (commonly placed in `client/` or `frontend/` at the repo root). This README describes how to install, configure, run, and test both parts.

## Table of Contents
- Project overview
- Prerequisites
- Server (backend)
  - Quick start
  - Environment
  - Database migrations
  - Scripts
- Frontend (React) — setup guidance
- Running both locally
- Linting and tests
- Project structure (high level)
- Contributing
- License

## Project overview

Server: An Express.js backend implemented under the `server/` directory. It includes authentication, user management, product/cart/order DAOs, migration scripts, and utilities.

Frontend: A React application (not included in this folder tree). The README below assumes a React app will be placed in the repository root under `client/` or `frontend/`. If your React app lives elsewhere, adjust paths accordingly.

## Prerequisites
- Node.js (LTS recommended, v16+ or newer)
- npm (or yarn)
- PostgreSQL (for the database)
- Optional: PM2 for production process management

## Server (backend)

Path: `server/`

### Quick start
1. Open a terminal and install dependencies:

   cd server
   npm install

2. Copy environment file and configure values:

   cp .env.sample .env

   Edit `.env` to set your DB connection, JWT secret, SendGrid keys, and other values.

3. Run database migrations:

   npm run db:migrate

4. Start the server in development (uses nodemon and babel-node):

   npm run start

The server uses environment variables for configuration. Common vars to set in `.env` (see `.env.sample` for details):

- DATABASE_URL or DB_HOST/DB_USER/DB_PASSWORD/DB_NAME/DB_PORT
- PORT (server listening port)
- JWT_SECRET (for authentication tokens)
- SENDGRID_API_KEY (if email sending is used)

### Database migrations
This project uses `db-migrate` (with `db-migrate-pg`) to manage migrations. Useful commands (run inside `server/`):

- Run migrations: `npm run db:migrate`
- Rollback one migration: `npm run db:migrate-down`
- Reset and re-run migrations: `npm run db:refresh` (dangerous in production)
- Create a new migration: `npm run create:migration -- <migration-name>`

### Server scripts
Relevant scripts from `server/package.json`:

- `npm run start` — run with nodemon and babel-node (development)
- `npm run build` — compile source to `dist/` using babel
- `npm run serve` — run compiled `dist/` (production)
- `npm run serve:prod` — start with `pm2-runtime` (production with pm2)
- `npm run db:migrate`, `npm run db:migrate-down`, `npm run db:refresh` — db-migrate helpers
- `npm run lint` — run eslint (auto-fix where possible)

### Notes
- Server source is under `server/src/`. Routes live in `server/src/routes/` and loaders under `server/src/loaders/`.
- Token verification helper: `verifyToken.js` is present at repository root and used by the server middleware.

## Frontend (React)

This repository expects a React frontend app. If you already have a React app, put it at the repo root in a folder named `client/` or `frontend/`. If not, you can create one using Create React App.

### Create a new React app (if needed)

1. From the repository root:

   npx create-react-app client
   cd client
   npm install

2. Environment configuration

Create a `.env` (or `.env.development`) in the React app with variables that begin with `REACT_APP_`. Example:

REACT_APP_API_URL=http://localhost:3000

3. Common scripts (inside `client/`):

- `npm start` — start development server
- `npm run build` — create production build
- `npm test` — run tests

4. Proxying API requests (dev)

You can either set `REACT_APP_API_URL` and use absolute URLs, or use the `proxy` field in `client/package.json` to forward API calls to your backend during development.

## Running both locally

1. Start the backend (in one terminal):

   cd server
   npm install
   cp .env.sample .env
   # edit .env as needed
   npm run db:migrate
   npm run start

2. Start the React frontend (in another terminal):

   cd client
   npm install
   # set REACT_APP_API_URL in client/.env if needed
   npm start

Open your browser to the React dev server (typically http://localhost:3000) — if the backend runs on the same port, adjust ports and `REACT_APP_API_URL` accordingly.

## Linting & tests

Server lint: (from `server/`)

  npm run lint

Frontend tests/lint depend on your React setup. If you used Create React App, run:

  cd client
  npm test

## Project structure (high level)

- `server/` — Express backend
  - `src/app.js` — main server bootstrap
  - `src/routes/` — API route definitions
  - `src/models/` — data models and validation schemas
  - `src/dao/` — DAO layer for products/cart/orders/users
  - `migrations/` — DB migration files

- `client/` (optional) — React frontend (create this if not present)

## Contributing

1. Fork the repo and make a feature branch.
2. Follow project lint rules and run tests.
3. Open a PR with a clear description and migration notes if DB changes are included.

## Troubleshooting

- If migrations fail, check your DB connection and that the DB user has create/alter privileges.
- If the server doesn't start, inspect `.env` values and ensure required variables are set (JWT secret, DB connection).

## License

This project does not include a license file by default. Add a `LICENSE` file at the repo root if you want to make license terms explicit.
