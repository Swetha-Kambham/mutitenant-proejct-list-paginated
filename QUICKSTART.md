# PSA Multi-Tenant System - Quick Start Guide

Complete guide to run the entire multi-tenant project management system.

## Architecture Overview

```
Browser (Port 3000)
    ↓
React Frontend
    ↓
GraphQL Middleware (Port 4000)
    ↓
.NET Backend API (Port 5011)
    ↓
PostgreSQL (Port 5432) + Redis (Port 6379)
```

## Prerequisites

- Docker & Docker Compose
- Node.js 18+
- .NET 8.0 SDK
- 4GB+ available RAM

## Step 1: Start Infrastructure

Start PostgreSQL and Redis containers:

```bash
docker-compose up -d
```

Verify services are running:

```bash
docker-compose ps
```

You should see:
- `psa_postgres` (healthy)
- `psa_redis` (healthy)

## Step 2: Start Backend (.NET API)

Navigate to backend and run:

```bash
cd backend
dotnet restore
dotnet run --project PSA.API
```

Backend will be available at: `http://localhost:5011`

### Verify Backend

```bash
curl http://localhost:5011/health
```

## Step 3: Start GraphQL Middleware

In a new terminal:

```bash
cd middleware
npm install
npm run dev
```

Middleware will be available at: `http://localhost:4000`

### Verify Middleware

Open browser: `http://localhost:4000/graphql`

You should see the Apollo Sandbox.

## Step 4: Start Frontend

In a new terminal:

```bash
cd frontend
npm install
npm start
```

Frontend will be available at: `http://localhost:3000`

## Step 5: Test the System

### Login as Tenant 1

1. Open `http://localhost:3000`
2. Enter credentials:
   - Company Key: `t1`
   - Username: `pm_t1`
   - Password: `password123`
3. Click "Login"

You should be redirected to the project list showing **10 projects** (out of 15 total).

### Test Search

1. Type "web" in the search box
2. Projects will be filtered in real-time

### Test Pagination

1. Change page size or navigate pages
2. Pagination controls update automatically

### Test Multi-Tenancy

1. Click "Logout"
2. Login as Tenant 2:
   - Company Key: `t2`
   - Username: `pm_t2`
   - Password: `password123`
3. You should see a **different set of 12 projects**

This demonstrates complete tenant isolation.

## Demo Flow

### Full Walkthrough

1. **Login with Tenant 1** (`t1` / `pm_t1` / `password123`)
2. **View Projects** - See 10 accessible projects
3. **Search** - Filter by name (e.g., "integration")
4. **Paginate** - Navigate through results
5. **Logout**
6. **Login with Tenant 2** (`t2` / `pm_t2` / `password123`)
7. **View Different Projects** - See 12 different projects
8. **Verify Isolation** - No access to Tenant 1 data

## System Details

### Authentication Flow

1. User submits login form
2. Frontend calls GraphQL `login` mutation
3. Middleware forwards to .NET backend `/api/auth/login`
4. Backend validates credentials in PostgreSQL
5. Backend returns user data
6. Middleware creates JWT and stores in Redis
7. Middleware sets `auth_ref` HttpOnly cookie
8. Frontend redirects to `/projects`

### Project List Flow

1. Frontend calls GraphQL `projects` query
2. Middleware extracts `auth_ref` from cookie
3. Middleware fetches JWT from Redis
4. Middleware decodes JWT to get `userId` and `tenantSlug`
5. Middleware calls .NET backend `/api/projects?tenantSlug=X&userId=Y&page=1&pageSize=10`
6. Backend queries PostgreSQL with row-level security
7. Backend returns paginated results
8. Middleware returns data to frontend

## Ports Reference

| Service           | Port | URL                          |
|-------------------|------|------------------------------|
| Frontend          | 3000 | http://localhost:3000        |
| GraphQL Middleware| 4000 | http://localhost:4000/graphql|
| .NET Backend      | 5011 | http://localhost:5011        |
| PostgreSQL        | 5432 | localhost:5432               |
| Redis             | 6379 | localhost:6379               |

## Test Credentials

### Tenant 1
- Company Key: `t1`
- Username: `pm_t1`
- Password: `password123`
- Access: 10 out of 15 projects

### Tenant 2
- Company Key: `t2`
- Username: `pm_t2`
- Password: `password123`
- Access: 12 out of 15 projects

## Troubleshooting

### Backend won't start
```bash
cd backend
dotnet clean
dotnet restore
dotnet build
dotnet run --project PSA.API
```

### Middleware errors
```bash
cd middleware
rm -rf node_modules package-lock.json
npm install
npm run dev
```

### Frontend errors
```bash
cd frontend
rm -rf node_modules package-lock.json
npm install
npm start
```

### Database issues
```bash
docker-compose down -v
docker-compose up -d
# Wait 10 seconds for initialization
docker-compose logs postgres | grep "NOTICE"
```

### Redis connection issues
```bash
docker exec -it psa_redis redis-cli PING
# Should return: PONG
```

## Stopping Services

### Stop All Services
```bash
# Stop frontend (Ctrl+C in terminal)
# Stop middleware (Ctrl+C in terminal)
# Stop backend (Ctrl+C in terminal)
docker-compose down
```

### Clean Restart
```bash
docker-compose down -v
docker-compose up -d
```

## Next Steps

- Review `/docs/system-design.md` for architecture details
- Review `/docs/frontend_spec.md` for frontend requirements
- Review `/docs/middleware.md` for middleware implementation
- Explore GraphQL schema at `http://localhost:4000/graphql`

## Security Notes

- **Demo only**: Uses MD5 hashing (use bcrypt in production)
- **HttpOnly cookies**: JWT never exposed to frontend
- **Redis TTL**: Sessions expire after 1 hour
- **Row-level security**: Users only see permitted projects
- **Tenant isolation**: Complete schema separation in PostgreSQL

## License

MIT
