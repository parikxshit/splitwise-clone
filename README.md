# Splitwise Clone

A full-stack expense-sharing application built with React, TypeScript, Node.js, Express, and PostgreSQL. Users can create groups, add registered members, record expenses, and split costs equally among selected group members.

**Status:** In development. Authentication, group management, and expense recording are implemented. Balance calculation and settlement flows are still pending.

## Implemented features

### Authentication
- Register, log in, and log out.
- Hash passwords with bcrypt.
- Authenticate API requests with JWT access tokens (15-minute lifetime) and refresh tokens (7-day lifetime).
- Refresh access tokens and retry failed authenticated requests through Axios interceptors.
- Protect frontend routes and backend group/expense endpoints.

### Groups
- Create groups with a name and optional description.
- List groups the current user belongs to and view group details.
- Add existing registered users by email; only the group creator can add members.
- Delete groups as the group creator.
- Prevent duplicate membership through a database uniqueness constraint.

### Expenses
- Add an expense with a description and amount in INR.
- Select group members to share an expense equally and preview the amount per person.
- Validate form inputs with Zod and show inline validation/server errors.
- Store expenses and their split records together in a Prisma transaction.
- List group expenses and display payer and split information.
- Delete an expense as its payer or the group creator.
- Enforce group membership checks for expense creation and listing.

### Frontend structure
- React/TypeScript pages for authentication, dashboard, groups, and group details.
- Redux Toolkit for authentication and group state.
- Reusable UI primitives and extracted expense list, expense item, members panel, and modal components.
- Tailwind CSS styling and Radix UI dialog primitives.

## Current limitations

- Dashboard totals for "You owe" and "You are owed" are placeholders, currently displaying zero.
- A settlement model exists in the database, but settlement APIs and UI are not implemented.
- Only equal splitting is implemented; custom amounts, percentages, and shares are not available.
- Equal splits are rounded independently to two decimal places. Remainder allocation is pending, so split totals may differ from the original amount by a few paise.
- Automated test suites are not configured. The root and server `npm test` scripts are placeholders.
- Refresh tokens are currently stored in browser local storage; cookie-based token storage is not implemented.

## Technology stack

| Layer | Technologies |
| --- | --- |
| Frontend | React 19, TypeScript, Vite, React Router |
| State and networking | Redux Toolkit, React Redux, Axios |
| UI and validation | Tailwind CSS, Radix UI, Lucide, Zod |
| Backend | Node.js, Express 5, Zod, Winston |
| Authentication | JSON Web Tokens, bcryptjs |
| Database | PostgreSQL, Prisma ORM and migrations |
| Local database container | Docker Compose, PostgreSQL 15 |

## Repository structure

```text
splitwise-clone/
├── client/
│   ├── src/
│   │   ├── api/             # Axios instance and token interceptors
│   │   ├── components/      # Layout, route guards, modals, and UI primitives
│   │   ├── pages/           # Login, registration, dashboard, groups, group details
│   │   ├── store/           # Redux Toolkit store and slices
│   │   ├── types/           # TypeScript domain types
│   │   └── validations/     # Client-side Zod schemas
│   └── package.json
├── server/
│   ├── prisma/             # Schema, migrations, and optional seed script
│   ├── src/
│   │   ├── config/         # Prisma database client
│   │   ├── constants/
│   │   ├── controllers/
│   │   ├── middleware/     # Authentication and error handling
│   │   ├── routes/
│   │   ├── services/       # Authentication, group, and expense logic
│   │   ├── utils/          # JWT, passwords, responses, errors, and logging
│   │   └── validators/     # Request validation
│   ├── .env.example
│   └── index.js
├── docker-compose.yml
└── README.md
```

## Run locally, step by step

Start the database, API server, and frontend separately. There is no combined startup script at the repository root.

### 1. Prerequisites

- Node.js **22.12 or newer within the Node 22 release line**, with npm (a suitable baseline for the installed Vite 8 tooling).
- Git, if cloning the repository.
- Docker with Docker Compose for the database, **or** an existing local PostgreSQL installation.

```bash
node --version
npm --version
```

### 2. Open the repository

For the existing local checkout:

```bash
cd ~/Desktop/Code/splitwise-clone
```

Alternatively, clone it:

```bash
git clone https://github.com/whiskyJack11/splitwise-clone.git
cd splitwise-clone
```

### 3. Start PostgreSQL

**Option A: Docker Compose**

Run from the repository root:

```bash
docker compose up -d postgres
docker compose ps
```

The Compose file exposes PostgreSQL on **localhost:5433**, with:

| Setting | Value |
| --- | --- |
| Database | `splitwise_db` |
| Username | `splitwise_user` |
| Password | `splitwise_password` |
| Host port | `5433` |

Data persists in the `postgres_data` Docker volume.

**Option B: PostgreSQL installed locally, without Docker**

Start PostgreSQL using your installation's service manager. Connect with a PostgreSQL administrator account:

```bash
psql -U postgres -h localhost -p 5432
```

Your administrator username may differ. In the SQL prompt, create the local development role and database:

```sql
CREATE USER splitwise_user WITH PASSWORD 'splitwise_password';
CREATE DATABASE splitwise_db OWNER splitwise_user;
\q
```

For this option, use port **5432** in `DATABASE_URL` (or your actual PostgreSQL port).

### 4. Configure the server environment

From the repository root:

```bash
cd server
cp .env.example .env
```

Edit `server/.env` to contain:

```dotenv
PORT=8000
CORS_ORIGIN=http://localhost:5173
JWT_ACCESS_SECRET=replace-with-a-generated-access-secret
JWT_REFRESH_SECRET=replace-with-a-different-generated-refresh-secret
DATABASE_URL="postgresql://splitwise_user:splitwise_password@localhost:5433/splitwise_db?schema=public"
```

For a non-Docker database, change `5433` to your PostgreSQL port. Replace the secret placeholders with two different random values. Generate a value with this command, running it once for each secret:

```bash
node -e "console.log(require('node:crypto').randomBytes(48).toString('hex'))"
```

Keep your `.env` files local and do not commit secrets.

### 5. Install server dependencies and initialize the database

Run inside `server/`:

```bash
npm install
npx prisma generate
npx prisma migrate deploy
```

`migrate deploy` applies the checked-in migrations without requiring a shadow database. For future schema changes during development, use `npx prisma migrate dev --name descriptive_change_name` with a PostgreSQL role that can create the required shadow database, or with a separately configured shadow database.

### 6. Start the API server

In the same server terminal:

```bash
npm run dev
```

The API runs at **http://localhost:8000**. Verify the server responds:

```bash
curl http://localhost:8000/
```

The response contains a message stating that the Splitwise API is running. This endpoint checks the HTTP server; it does not verify database connectivity.

For startup without nodemon's automatic restarts, use `npm start` instead.

### 7. Configure and start the frontend

Open a second terminal:

```bash
cd ~/Desktop/Code/splitwise-clone/client
npm install
```

If you cloned elsewhere, use your checkout's `client/` directory. Optionally create `client/.env.local`:

```dotenv
VITE_API_URL=http://localhost:8000/api
```

This is also the default API URL when the variable is absent. Start Vite on the expected port:

```bash
npm run dev -- --port 5173 --strictPort
```

Open **http://localhost:5173**. Restart Vite after changing client environment variables. If you intentionally use another frontend origin, update the server's `CORS_ORIGIN` and restart the server.

### 8. Try the implemented workflow

1. Register a user and create a group.
2. Register another user in a separate browser profile or private window.
3. As the group creator, add that registered user's email to the group.
4. Add an expense and select the members who should share it.
5. Check the per-person preview and the saved expense list.
6. Log in as the other member and view the shared group and expenses.
7. Try deleting an expense as its payer or the group creator.

### Optional: inspect or seed the database

Run inside `server/`:

```bash
npx prisma studio
```

The current seed script creates **50 randomized groups using existing users**:

```bash
npx prisma db seed
```

User creation in the seed script is commented out. Register users first; an empty user table produces no seeded groups. Re-running the script adds another set of groups. Seeding is optional and is not required to run the application.

### Stop local services

Press `Ctrl+C` in the server and frontend terminals. If using Docker, run from the repository root:

```bash
docker compose down
```

This stops the database container while preserving its named data volume.

## Available scripts

| Directory | Command | Purpose |
| --- | --- | --- |
| `client/` | `npm run dev` | Start Vite development server |
| `client/` | `npm run build` | Build frontend assets into `dist/` |
| `client/` | `npm run preview` | Preview the frontend build locally; API must run separately |
| `client/` | `npm run lint` | Run ESLint |
| `client/` | `npx tsc --noEmit` | Check TypeScript separately from the Vite build |
| `server/` | `npm run dev` | Start API with nodemon |
| `server/` | `npm start` | Start API with Node.js |

## API overview

All paths below are relative to `/api`. Protected endpoints require `Authorization: Bearer <accessToken>`.

| Method | Path | Purpose | Authentication |
| --- | --- | --- | --- |
| POST | `/auth/register` | Register a user | Public |
| POST | `/auth/login` | Return user and access/refresh tokens | Public |
| POST | `/auth/refresh` | Obtain an access token using a refresh token | Refresh token in request body |
| POST | `/auth/logout` | Clear the stored refresh token | Access token |
| GET | `/groups` | List current user's groups | Access token |
| POST | `/groups` | Create a group | Access token |
| GET | `/groups/:id` | View a group | Group member |
| POST | `/groups/:id/members` | Add a registered user by email | Group creator |
| DELETE | `/groups/:id` | Delete a group | Group creator |
| POST | `/groups/:id/expenses` | Record an expense and equal splits | Group member |
| GET | `/groups/:id/expenses` | List group expenses | Group member |
| DELETE | `/expenses/:id` | Delete an expense | Expense payer or group creator |
| GET | `/protected` | Check access-token authentication | Access token |

## Troubleshooting

- **Cannot connect to the database:** Check that PostgreSQL is running, the database exists, and `DATABASE_URL` uses the correct credentials and port. Docker uses host port `5433`; a typical local installation uses `5432`.
- **Missing tables:** Run `npx prisma migrate deploy` from `server/`.
- **Prisma client initialization errors:** Run `npx prisma generate` from `server/` and restart the API.
- **CORS or frontend API errors:** Check `VITE_API_URL`, server port, and `CORS_ORIGIN`. Restart each affected process after editing its environment.
- **Port 5173 is occupied:** Stop the conflicting service or choose another frontend port and update `CORS_ORIGIN` to match.
- **Cannot add a member:** The email must belong to an existing registered user, and only the group creator can add members.
- **Dashboard balances stay at zero:** Balance aggregation is pending; the current figures are placeholders.

## Next development priorities

- Allocate rounding remainders so expense splits sum exactly to the expense amount.
- Calculate group and dashboard balances.
- Implement settlements and balance updates.
- Add meaningful automated tests for authentication, permissions, and expense calculations.
- Improve token storage and concurrent refresh handling.
- Expand expense editing and split options.
