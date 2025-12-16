# PSA Multi-Tenant Backend (.NET)

## Phase 2: .NET Backend Implementation

This is the backend API for the multi-tenant project management system.

## Architecture

```
PSA.API         → Controllers + Startup
PSA.Services    → Business logic
PSA.DAL         → Entity Framework + Repositories
PSA.Contracts   → DTOs + Interfaces
```

## Prerequisites

- .NET 10 SDK
- PostgreSQL database (from Phase 1)

## Project Structure

```
backend/
├── PSA.Contracts/
│   ├── DTOs/
│   │   ├── LoginRequestDto.cs
│   │   ├── LoginResponseDto.cs
│   │   ├── ProjectDto.cs
│   │   └── PaginatedResponseDto.cs
│   └── Interfaces/
│       ├── IAuthService.cs
│       └── IProjectService.cs
│
├── PSA.DAL/
│   ├── Entities/
│   │   ├── User.cs
│   │   ├── Project.cs
│   │   └── ProjectAccess.cs
│   ├── DbContext/
│   │   ├── TenantDbContext.cs
│   │   └── TenantDbContextFactory.cs
│   └── Repositories/
│       ├── UserRepository.cs
│       └── ProjectRepository.cs
│
├── PSA.Services/
│   ├── AuthService.cs
│   └── ProjectService.cs
│
└── PSA.API/
    ├── Controllers/
    │   ├── AuthController.cs
    │   └── ProjectsController.cs
    ├── Program.cs
    └── appsettings.json
```

## Running the Backend

### 1. Ensure PostgreSQL is running

```bash
# From project root
cd ../
docker-compose up -d postgres
```

### 2. Run the API

```bash
cd backend
dotnet run --project PSA.API
```

The API will start on:
- HTTP: `http://localhost:5000`
- HTTPS: `https://localhost:5001`
- Swagger UI: `http://localhost:5000/swagger`

## API Endpoints

### Authentication

#### POST /api/auth/login
Validate user credentials and return user information.

**Request:**
```json
{
  "companyKey": "t1",
  "username": "pm_t1",
  "password": "password123"
}
```

**Response (Success):**
```json
{
  "success": true,
  "userId": 1,
  "username": "pm_t1",
  "tenantSlug": "tenant_t1",
  "role": "PM",
  "message": "Login successful"
}
```

**Response (Failure):**
```json
{
  "success": false,
  "userId": 0,
  "username": "",
  "tenantSlug": "",
  "role": "",
  "message": "Invalid username or password"
}
```

### Projects

#### GET /api/projects
Get paginated list of projects with row-level security.

**Query Parameters:**
- `tenantSlug` (required): Tenant schema (e.g., "tenant_t1")
- `userId` (required): User ID for row-level security
- `page` (optional, default: 1): Page number
- `pageSize` (optional, default: 10, max: 100): Items per page
- `search` (optional): Search term for project name (case-insensitive)

**Example Request:**
```
GET /api/projects?tenantSlug=tenant_t1&userId=1&page=1&pageSize=10&search=web
```

**Response:**
```json
{
  "data": [
    {
      "id": 1,
      "name": "Website Redesign",
      "description": "Complete overhaul of company website",
      "status": "Active",
      "createdAt": "2025-12-15T00:00:00",
      "updatedAt": "2025-12-15T00:00:00"
    }
  ],
  "totalCount": 10,
  "page": 1,
  "pageSize": 10,
  "totalPages": 1,
  "hasPreviousPage": false,
  "hasNextPage": false
}
```

## Testing with cURL

### Login as Tenant T1 User

```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "companyKey": "t1",
    "username": "pm_t1",
    "password": "password123"
  }'
```

### Get Projects for Tenant T1

```bash
curl "http://localhost:5000/api/projects?tenantSlug=tenant_t1&userId=1&page=1&pageSize=10"
```

### Search Projects

```bash
curl "http://localhost:5000/api/projects?tenantSlug=tenant_t1&userId=1&page=1&pageSize=10&search=web"
```

### Login as Tenant T2 User

```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "companyKey": "t2",
    "username": "pm_t2",
    "password": "password123"
  }'
```

### Get Projects for Tenant T2

```bash
curl "http://localhost:5000/api/projects?tenantSlug=tenant_t2&userId=1&page=1&pageSize=10"
```

## Testing with Swagger UI

1. Start the API: `dotnet run --project PSA.API`
2. Open browser: `http://localhost:5000/swagger`
3. Try the endpoints directly from the Swagger interface

## Key Features

### Multi-Tenancy
- **Schema-per-tenant**: Each tenant has its own PostgreSQL schema
- **Dynamic schema selection**: `TenantDbContext` switches schemas based on `tenantSlug`
- **Data isolation**: Tenants cannot access each other's data

### Row-Level Security
- **ProjectAccess table**: Defines which users can see which projects
- **Enforced in repository**: `ProjectRepository` filters projects by user ID
- **Tenant T1 PM**: Can see 10 out of 15 projects
- **Tenant T2 PM**: Can see 12 out of 15 projects

### Pagination
- Uses LIMIT/OFFSET SQL pattern
- Default page size: 10
- Maximum page size: 100
- Returns total count and page metadata

### Search
- Case-insensitive project name search
- Uses PostgreSQL `ILIKE` for pattern matching
- Combines with pagination and row-level security

## Security Notes

- **Password Hashing**: Currently uses MD5 for demo purposes
  - ⚠️ **Production**: Replace with bcrypt or Argon2
  - Located in: `PSA.Services/AuthService.cs:72`

- **No JWT**: Phase 2 returns user info directly
  - JWT implementation is in Phase 3 (middleware)

- **Connection String**: Stored in `appsettings.json`
  - ⚠️ **Production**: Use environment variables or Azure Key Vault

## Database Connection

**Default connection string:**
```
Host=localhost;Port=5432;Database=psa_multitenant;Username=psa_admin;Password=psa_password
```

**Update in:** `PSA.API/appsettings.json`

## Building for Production

```bash
dotnet publish -c Release -o ./publish
```

## Docker Build

```bash
cd backend
docker build -t psa-backend:latest .
```

## Troubleshooting

### Database Connection Error

**Error:** `Npgsql.NpgsqlException: Connection refused`

**Solution:**
```bash
# Ensure PostgreSQL is running
docker-compose ps postgres

# If not running, start it
docker-compose up -d postgres
```

### Schema Not Found

**Error:** `schema "tenant_t1" does not exist`

**Solution:**
```bash
# Verify schemas were created
docker exec -it psa_postgres psql -U psa_admin -d psa_multitenant -c "\dn"

# If missing, re-run initialization
docker-compose down -v
docker-compose up -d postgres
```

### No Projects Returned

**Cause:** User has no project access grants

**Solution:**
```bash
# Check project_access table
docker exec -it psa_postgres psql -U psa_admin -d psa_multitenant \
  -c "SELECT * FROM tenant_t1.project_access WHERE user_id = 1;"
```

## Next Steps

- **Phase 3**: Node.js middleware with GraphQL and JWT authentication
- **Phase 4**: React frontend with Apollo Client
- **Phase 5**: Integration testing

## Development Notes

- Solution uses .NET 10
- EF Core 10.0.1
- Npgsql.EntityFrameworkCore.PostgreSQL 10.0.0
- Swashbuckle.AspNetCore 10.0.1

---

**Phase 2 Complete** ✅
