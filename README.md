# Field Journal 🌿

A full-stack nature-observation logging app. Authenticated users can record wildlife sightings (species, location, GPS co-ordinates, photo, notes) and browse the community feed.

## Stack

| Layer | Technology |
|-------|-----------|
| Front-end | React 19 + TypeScript, Vite, Tailwind CSS v4, Radix UI primitives |
| Back-end | .NET 10 Minimal-host Web API, EF Core 9, Npgsql |
| Auth | JWT ****** (BCrypt password hashing) |
| Database | PostgreSQL 16 |
| Tests (BE) | xUnit + WebApplicationFactory + EF Core InMemory |
| Tests (FE) | Vitest + React Testing Library |

---

## Prerequisites

- [.NET 10 SDK](https://dotnet.microsoft.com/download)
- [Node.js ≥ 20](https://nodejs.org)
- [Docker + Docker Compose](https://docs.docker.com/compose/) *(for the local Postgres instance)*

---

## Quick start

### 1 — Start the database

```bash
docker-compose up -d
```

This starts a Postgres 16 container on `localhost:5432` with database `fieldjournaldb`.

### 2 — Configure the back-end secrets

Override the JWT key and DB password. Never commit real secrets.

Using .NET user-secrets (recommended for development):

```bash
cd backend/FieldJournal.Api
dotnet user-secrets set "Jwt:Key" "$(openssl rand -base64 48)"
dotnet user-secrets set "ConnectionStrings:DefaultConnection" \
  "Host=localhost;Port=5432;Database=fieldjournaldb;Username=postgres;******"
```

Or set environment variables:

```
ConnectionStrings__DefaultConnection="Host=localhost;..."
Jwt__Key="your-super-secret-key-at-least-32-chars"
```

### 3 — Run the back-end

```bash
cd backend/FieldJournal.Api
dotnet run
# API available at http://localhost:5000
# Swagger UI at http://localhost:5000/swagger
```

EF Core migrations run automatically on first start (development mode).

### 4 — Run the front-end

```bash
cd frontend/field-journal
npm install
npm run dev
# App at http://localhost:5173
```

---

## Running tests

### Back-end (xUnit)

```bash
cd backend
dotnet test
```

9 integration tests covering: registration, duplicate-email conflict, login, wrong password, unauthenticated access, create observation, list observations, cross-user delete protection.

### Front-end (Vitest + RTL)

```bash
cd frontend/field-journal
npm test
```

11 unit/component tests covering `Button`, `Input`, and `AuthPage` behaviour.

---

## Project structure

```
.
├── backend/
│   ├── FieldJournal.Api/
│   │   ├── Controllers/        # AuthController, ObservationsController
│   │   ├── Data/               # AppDbContext + EF migrations
│   │   ├── DTOs/               # Request/response records
│   │   ├── Models/             # User, Observation
│   │   ├── Services/           # TokenService (JWT)
│   │   └── Program.cs
│   └── FieldJournal.Tests/     # Integration tests (WebApplicationFactory)
├── frontend/
│   └── field-journal/
│       └── src/
│           ├── api/            # Axios client + typed helpers
│           ├── components/
│           │   ├── ui/         # Button, Input, Modal, Toast (Radix-based)
│           │   └── Navbar.tsx
│           ├── contexts/       # AuthContext (JWT storage)
│           ├── pages/          # AuthPage, JournalPage
│           └── test/           # Vitest test suites
└── docker-compose.yml
```

---

## API endpoints

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/api/auth/register` | — | Create account, returns JWT |
| POST | `/api/auth/login` | — | Login, returns JWT |
| GET | `/api/observations` | ✅ | All observations (newest first) |
| GET | `/api/observations/{id}` | ✅ | Single observation |
| POST | `/api/observations` | ✅ | Create observation |
| PUT | `/api/observations/{id}` | ✅ owner | Update observation |
| DELETE | `/api/observations/{id}` | ✅ owner | Delete observation |

Full interactive docs available at `/swagger` when the API is running.
