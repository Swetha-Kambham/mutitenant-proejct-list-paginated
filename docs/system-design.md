# System Design - Multi-Tenant Project List (Paginated)

## 1. High-Level System Architecture

This is a **read-only, multi-tenant PSA-style system** with the following architecture:

```
┌─────────────┐
│   Browser   │ (stores auth_ref cookie only)
└──────┬──────┘
       │
       ↓
┌─────────────────────────────────┐
│  Frontend (React + Apollo)      │
│  - Login UI                     │
│  - Project List (paginated)     │
│  - Client-side visibility rules │
└──────┬──────────────────────────┘
       │
       ↓
┌─────────────────────────────────┐
│  Middleware (Node.js/Express)   │
│  - Apollo Server (GraphQL)      │
│  - Auth validation via Redis    │
│  - Tenant context resolution    │
│  - Forwards to .NET backend     │
└──────┬──────────────────────────┘
       │
       ↓
┌─────────────────────────────────┐
│  Backend (.NET/C#)              │
│  - Layered architecture         │
│  - Business logic               │
│  - Row-level authorization      │
│  - Entity Framework queries     │
└──────┬──────────────────────────┘
       │
       ├──────────┬─────────────┐
       ↓          ↓             ↓
   ┌─────┐   ┌────────┐   ┌────────┐
   │Redis│   │ tenant │   │ tenant │
   │     │   │   _t1  │   │   _t2  │
   └─────┘   │(schema)│   │(schema)│
             └────────┘   └────────┘
             └────── Postgres ──────┘
```

## 2. Layer Responsibilities

### **Frontend (React)**
- Render login form (Company Key, Username, Password)
- Store `auth_ref` cookie received from middleware
- Send `auth_ref` with every request
- Display paginated project list
- Implement search and pagination controls
- **Visibility-only** permission checks (UI level)

### **Middleware (Node.js + Express + Apollo Server)**
- Expose GraphQL API to frontend
- Receive `auth_ref` from cookie
- Fetch JWT from Redis using `auth_ref`
- Decode JWT to extract: `userId`, `tenantSlug`, `role`
- Create GraphQL context with tenant info
- Forward authenticated requests to .NET backend
- Handle login flow and store JWT in Redis

### **Backend (.NET C#)**
- **Contracts**: Define interfaces and DTOs
- **Services**: Business logic layer
  - Validate user permissions (role + row-level)
  - Enforce authorization rules
  - Coordinate between layers
- **DAL/Platform**: Data access layer
  - Entity Framework models
  - Tenant-aware DB queries
  - Dynamic schema selection based on `tenantSlug`
  - Execute paginated queries with LIMIT/OFFSET

### **Data Layer**
- **Postgres**:
  - Single database instance
  - Multiple schemas: `tenant_t1`, `tenant_t2`
  - Pre-seeded project data per tenant
  - Tables: Users, Projects, RolePermissions, etc.

- **Redis**:
  - Store JWTs (key: `auth_ref`, value: JWT)
  - Session management
  - Optional caching layer

## 3. Authentication & Authorization

### **Authentication Flow**

```
1. User submits login:
   - companyKey: "t1"
   - username: "pm_user"
   - password: "password123"

2. Middleware → Backend: Validate credentials

3. Backend:
   - Look up user in tenant_t1 schema
   - Verify password (hashed)
   - Return user data + tenantSlug

4. Middleware:
   - Generate JWT with payload:
     {
       userId: 123,
       tenantSlug: "tenant_t1",
       role: "PM",
       exp: <expiration>
     }
   - Generate unique auth_ref (UUID)
   - Store in Redis: SET auth_ref → JWT
   - Send cookie to browser: auth_ref

5. Browser:
   - Store auth_ref in HttpOnly cookie
   - Include in all subsequent requests
```

### **Authorization Flow**

```
1. Request arrives with auth_ref cookie

2. Middleware:
   - GET JWT from Redis using auth_ref
   - Decode JWT → extract tenantSlug, userId, role
   - Add to GraphQL context

3. GraphQL Resolver:
   - Forward request to .NET backend
   - Include context (tenantSlug, userId, role)

4. Backend Services:
   - Role check: Is user a PM?
   - Row-level filter: Query only projects where user has access
   - Return filtered, paginated results

5. Response flows back to UI
```

### **Security Principles**
- JWT **never** touches the browser
- Only `auth_ref` is stored client-side
- All permission enforcement in backend
- Frontend checks are for UX only (hiding buttons, etc.)

## 4. Database Model (High-Level)

### Schema: `tenant_t1` (same for `tenant_t2`)

**Users Table**
```
id          | integer (PK)
username    | varchar
password    | varchar (hashed)
role        | varchar (e.g., "PM")
tenant_slug | varchar
created_at  | timestamp
```

**Projects Table**
```
id              | integer (PK)
name            | varchar
description     | text
status          | varchar (e.g., "Active", "Completed")
created_at      | timestamp
updated_at      | timestamp
```

**ProjectAccess Table** (Row-level permissions)
```
id         | integer (PK)
project_id | integer (FK → Projects)
user_id    | integer (FK → Users)
```

### Redis Schema
```
Key: auth_ref (UUID)
Value: JWT (JSON Web Token)
TTL: 1 hour (or session duration)
```

## 5. Folder Structure Proposal

```
/
├── frontend/                    # React application
│   ├── src/
│   │   ├── components/
│   │   │   ├── Login/
│   │   │   │   ├── Login.tsx
│   │   │   │   └── Login.test.tsx
│   │   │   └── ProjectList/
│   │   │       ├── ProjectList.tsx
│   │   │       ├── ProjectList.test.tsx
│   │   │       └── Pagination.tsx
│   │   ├── graphql/
│   │   │   ├── queries.ts
│   │   │   └── client.ts
│   │   ├── App.tsx
│   │   └── index.tsx
│   ├── package.json
│   └── Dockerfile
│
├── middleware/                  # Node.js + Express + Apollo
│   ├── src/
│   │   ├── graphql/
│   │   │   ├── schema.ts       # GraphQL type definitions
│   │   │   └── resolvers.ts    # GraphQL resolvers
│   │   ├── services/
│   │   │   ├── authService.ts  # JWT creation, Redis storage
│   │   │   └── backendClient.ts # HTTP client to .NET
│   │   ├── middleware/
│   │   │   └── authMiddleware.ts # auth_ref → JWT validation
│   │   ├── redis/
│   │   │   └── redisClient.ts
│   │   └── server.ts
│   ├── package.json
│   └── Dockerfile
│
├── backend/                     # .NET C# application
│   ├── PSA.Contracts/
│   │   ├── DTOs/
│   │   │   ├── ProjectDto.cs
│   │   │   ├── LoginRequestDto.cs
│   │   │   └── PaginatedResponseDto.cs
│   │   └── Interfaces/
│   │       ├── IProjectService.cs
│   │       └── IAuthService.cs
│   ├── PSA.Services/
│   │   ├── ProjectService.cs   # Business logic
│   │   ├── AuthService.cs
│   │   └── PermissionService.cs
│   ├── PSA.DAL/
│   │   ├── DbContext/
│   │   │   └── TenantDbContext.cs # EF context with schema selection
│   │   ├── Entities/
│   │   │   ├── User.cs
│   │   │   ├── Project.cs
│   │   │   └── ProjectAccess.cs
│   │   └── Repositories/
│   │       ├── ProjectRepository.cs
│   │       └── UserRepository.cs
│   ├── PSA.API/
│   │   ├── Controllers/
│   │   │   ├── AuthController.cs
│   │   │   └── ProjectController.cs
│   │   └── Startup.cs
│   ├── PSA.sln
│   └── Dockerfile
│
├── database/
│   ├── migrations/
│   │   ├── 001_create_schemas.sql
│   │   ├── 002_create_tables.sql
│   │   └── 003_seed_data.sql
│   └── init.sql
│
├── docker-compose.yml
├── docs/
│   ├── architecture-instructions.md
│   └── system-design.md
└── README.md
```

## 6. Implementation Phases

### **Phase 1: Infrastructure Setup**
- Docker Compose configuration
  - Postgres container with schema initialization
  - Redis container
  - Network configuration
- Database setup
  - Create schemas: `tenant_t1`, `tenant_t2`
  - Create tables: Users, Projects, ProjectAccess
  - Seed test data

### **Phase 2: Backend (.NET)**
- Set up .NET solution structure
  - Contracts (interfaces + DTOs)
  - Services (business logic)
  - DAL (Entity Framework + repositories)
  - API (controllers)
- Implement authentication endpoint
  - `/api/auth/login` → validate credentials
- Implement project query endpoint
  - `/api/projects` → paginated, filtered by user permissions
- Tenant-aware EF context
  - Dynamic schema selection

### **Phase 3: Middleware (Node.js)**
- Set up Express + Apollo Server
- Implement authentication flow
  - Login mutation → create JWT → store in Redis → return auth_ref
- Implement auth middleware
  - Extract auth_ref from cookie → fetch JWT from Redis → decode → add to context
- Create GraphQL schema
  - Query: `projects(page, pageSize, search)`
  - Mutation: `login(companyKey, username, password)`
- Implement resolvers
  - Forward to .NET backend with tenant context

### **Phase 4: Frontend (React)**
- Set up React app with React Router
- Apollo Client configuration
  - Include auth_ref cookie with requests
- Login component
  - Form: Company Key, Username, Password
  - On success: store auth_ref, redirect to project list
- Project List component
  - GraphQL query with pagination params
  - Display projects in table/grid
  - Search input (debounced)
  - Pagination controls (Previous/Next, page numbers)

### **Phase 5: Integration & Testing**
- End-to-end flow testing
  - Login as T1 PM → see only T1 projects
  - Login as T2 PM → see only T2 projects
- Unit tests
  - Frontend: Jest tests for components
  - Backend: Service layer tests
- Permission validation
  - Verify row-level security works
  - Attempt cross-tenant access (should fail)

### **Phase 6: Documentation**
- API documentation
- Architecture diagrams
- Deployment guide
- Demo script for interviews

---

## Key Design Decisions

1. **Why schema-per-tenant?**
   - Strong data isolation
   - Easier to scale per tenant
   - Clear tenant boundaries

2. **Why JWT in Redis (not browser)?**
   - Security: JWT cannot be stolen via XSS
   - Revocation: Can invalidate sessions instantly
   - Reference token pattern is industry best practice

3. **Why GraphQL middleware?**
   - Modern API pattern
   - Efficient data fetching (no over-fetching)
   - Single endpoint for frontend
   - Easier to extend

4. **Why .NET backend?**
   - Enterprise-grade for business logic
   - Strong typing with C#
   - Entity Framework for ORM
   - Demonstrates polyglot architecture

5. **Why read-only?**
   - Simplifies demo scope
   - Focuses on auth/authz patterns
   - Avoids CRUD complexity for interview clarity

---

## Next Steps

Awaiting approval to proceed with Phase 1 implementation.