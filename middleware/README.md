# PSA GraphQL Middleware

## Phase 3: GraphQL Middleware Layer

Node.js + Express + Apollo Server middleware that sits between the frontend and .NET backend.

## Purpose

This middleware acts as the **ONLY** API exposed to the frontend and handles:
- ✅ Authentication with reference tokens (`auth_ref`)
- ✅ JWT storage in Redis (browser never sees JWT)
- ✅ User context management
- ✅ Request forwarding to .NET backend
- ✅ GraphQL API for frontend

## Architecture

```
Browser
  ↓ (auth_ref cookie only)
GraphQL Middleware (THIS LAYER)
  ↓ (forwards requests with tenant context)
.NET Backend (Phase 2)
  ↓
PostgreSQL (multi-tenant schemas)
```

## Tech Stack

- Node.js 20+
- TypeScript
- Express
- Apollo Server (GraphQL)
- Redis (auth_ref → JWT storage)
- Axios (backend HTTP client)
- JWT (jsonwebtoken)

## Prerequisites

- Node.js 20+
- Redis running (from Phase 1)
- .NET backend running on http://localhost:5011 (from Phase 2)

## Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment

```bash
cp .env.example .env
```

Edit `.env`:
```env
PORT=4000
BACKEND_BASE_URL=http://localhost:5011
REDIS_URL=redis://localhost:6379
JWT_SECRET=your_secret_key_here
FRONTEND_URL=http://localhost:3000
```

### 3. Start Development Server

```bash
npm run dev
```

The server will start on:
- GraphQL Playground: http://localhost:4000/graphql
- Health Check: http://localhost:4000/health

## GraphQL API

### Mutations

#### Login

```graphql
mutation Login {
  login(
    companyKey: "t1"
    username: "pm_t1"
    password: "password123"
  ) {
    success
    user {
      userId
      username
      tenantSlug
      role
    }
    message
  }
}
```

**Response:**
```json
{
  "data": {
    "login": {
      "success": true,
      "user": {
        "userId": 1,
        "username": "pm_t1",
        "tenantSlug": "tenant_t1",
        "role": "PM"
      },
      "message": "Login successful"
    }
  }
}
```

**Side Effect:** Sets `auth_ref` HttpOnly cookie

#### Logout

```graphql
mutation Logout {
  logout
}
```

### Queries

#### Get Current User

```graphql
query Me {
  me {
    userId
    username
    tenantSlug
    role
  }
}
```

#### Get Projects (Paginated)

```graphql
query GetProjects {
  projects(page: 1, pageSize: 10, search: "web") {
    data {
      id
      name
      description
      status
      createdAt
      updatedAt
    }
    totalCount
    page
    pageSize
    totalPages
    hasPreviousPage
    hasNextPage
  }
}
```

**Note:** You do NOT need to pass `tenantSlug` or `userId`. These are automatically extracted from the authenticated user's context (from the `auth_ref` cookie).

## Authentication Flow

### Login Flow (Detailed)

1. **Frontend** sends login mutation with credentials
2. **Middleware** calls .NET backend `/api/auth/login`
3. **Backend** validates credentials and returns user data
4. **Middleware** creates JWT with user info:
   ```json
   {
     "userId": 1,
     "username": "pm_t1",
     "tenantSlug": "tenant_t1",
     "role": "PM"
   }
   ```
5. **Middleware** generates unique `auth_ref` (UUID)
6. **Middleware** stores in Redis: `auth_ref` → JWT (TTL: 1 hour)
7. **Middleware** sets `auth_ref` as HttpOnly cookie
8. **Frontend** receives user data (but NOT the JWT)

### Authenticated Request Flow

1. **Browser** sends GraphQL request with `auth_ref` cookie
2. **Middleware** reads `auth_ref` from cookie
3. **Middleware** fetches JWT from Redis
4. **Middleware** verifies and decodes JWT
5. **Middleware** extracts user context (userId, tenantSlug, role)
6. **Middleware** forwards request to .NET backend with context
7. **Backend** enforces permissions and returns data
8. **Middleware** returns data to frontend

## Security Model

### What the Browser Stores

```
✅ auth_ref cookie (HttpOnly, Secure, SameSite=lax)
❌ JWT (NEVER exposed to browser)
```

### Redis Storage

```
Key: auth_ref (UUID)
Value: JWT (signed token)
TTL: 3600 seconds (1 hour)
```

### Why This Is Secure

1. **JWT never exposed to browser** → No XSS risk
2. **HttpOnly cookie** → JavaScript cannot access
3. **Redis as single source of truth** → Can revoke instantly
4. **Reference token pattern** → Industry best practice

## Project Structure

```
middleware/
├── src/
│   ├── graphql/
│   │   ├── schema.ts          # GraphQL type definitions
│   │   └── resolvers.ts       # Query & mutation resolvers
│   ├── context/
│   │   └── authContext.ts     # Auth context builder
│   ├── services/
│   │   ├── authService.ts     # JWT + Redis logic
│   │   └── backendClient.ts   # HTTP client to .NET
│   ├── redis/
│   │   └── redisClient.ts     # Redis connection
│   ├── server.ts              # Apollo + Express setup
│   └── index.ts               # Entry point
├── tests/
│   ├── auth.test.ts
│   └── projects.test.ts
├── .env
├── .env.example
├── Dockerfile
├── package.json
├── tsconfig.json
└── README.md
```

## Testing

### Run Tests

```bash
npm test
```

### Run Tests in Watch Mode

```bash
npm run test:watch
```

## Testing with cURL

### Login

```bash
curl -X POST http://localhost:4000/graphql \
  -H "Content-Type: application/json" \
  -d '{
    "query": "mutation { login(companyKey: \"t1\", username: \"pm_t1\", password: \"password123\") { success user { userId username tenantSlug role } } }"
  }' \
  -c cookies.txt
```

### Get Projects (requires login first)

```bash
curl -X POST http://localhost:4000/graphql \
  -H "Content-Type: application/json" \
  -b cookies.txt \
  -d '{
    "query": "query { projects(page: 1, pageSize: 10) { data { id name status } totalCount } }"
  }'
```

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Server port | `4000` |
| `BACKEND_BASE_URL` | .NET backend URL | `http://localhost:5011` |
| `REDIS_URL` | Redis connection string | `redis://localhost:6379` |
| `JWT_SECRET` | Secret for signing JWTs | `demo_secret` |
| `FRONTEND_URL` | Frontend URL for CORS | `http://localhost:3000` |
| `NODE_ENV` | Environment | `development` |

## Building for Production

```bash
# Build TypeScript
npm run build

# Run production server
npm start
```

## Docker

### Build Image

```bash
docker build -t psa-middleware:latest .
```

### Run Container

```bash
docker run -p 4000:4000 \
  -e BACKEND_BASE_URL=http://backend:5011 \
  -e REDIS_URL=redis://redis:6379 \
  -e JWT_SECRET=your_production_secret \
  psa-middleware:latest
```

## Troubleshooting

### Redis Connection Error

**Error:** `ECONNREFUSED localhost:6379`

**Solution:**
```bash
# From project root
docker-compose up -d redis

# Or check if Redis is running
docker ps | grep redis
```

### Backend Connection Error

**Error:** `ECONNREFUSED localhost:5011`

**Solution:**
```bash
# Start .NET backend
cd backend
dotnet run --project PSA.API
```

### Auth Cookie Not Set

**Cause:** CORS misconfiguration

**Solution:** Ensure `credentials: true` in CORS config and frontend uses `credentials: 'include'`

### JWT Verification Failed

**Cause:** JWT_SECRET mismatch or expired token

**Solution:**
- Check JWT_SECRET in .env
- Redis may have expired the token (1 hour TTL)
- Try logging in again

## Development Scripts

```bash
npm run dev          # Start with nodemon
npm run build        # Compile TypeScript
npm start            # Run production build
npm test             # Run Jest tests
npm run test:watch   # Run tests in watch mode
```

## Key Design Principles

1. **No business logic** - All logic in .NET backend
2. **Thin layer** - Just auth + forwarding
3. **Security first** - JWT never exposed
4. **Stateless** - Redis as session store
5. **Simple** - Easy to understand and maintain

## Integration with Other Phases

- **Phase 1 (Infrastructure)**: Uses Redis for session storage
- **Phase 2 (Backend)**: Forwards all requests to .NET API
- **Phase 4 (Frontend)**: Will consume this GraphQL API

## Next Steps

- **Phase 4**: Build React frontend with Apollo Client
- **Phase 5**: End-to-end integration testing
- **Phase 6**: Production deployment

---

**Phase 3 Complete** ✅
