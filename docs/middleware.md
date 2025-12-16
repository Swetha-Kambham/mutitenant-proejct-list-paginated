You are implementing Phase 3: GraphQL Middleware for a multi-tenant PSA-style project list system.

Repo name: mutitenant-proejct-list-paginated
We already have:
- Postgres + Redis in docker-compose.yml
- Backend .NET API working:
  - POST http://localhost:5011/api/auth/login
  - GET  http://localhost:5011/api/projects?tenantSlug=tenant_t1&userId=1&page=1&pageSize=10&searchTerm=
Backend returns JSON like:
{ success, userId, tenantSlug, role } for login
{ data:[], totalCount, page, pageSize, totalPages, hasPreviousPage, hasNextPage } for projects

Now implement middleware:
Tech:
- Node.js + Express
- Apollo Server (GraphQL)
- Redis client
- JWT library (jsonwebtoken)
- Use TypeScript
- Use dotenv
- Cookie parser
- CORS configured for future frontend
- All secrets in .env (no hardcoding)

Requirements:
1) GraphQL schema:
- mutation login(companyKey: String!, username: String!, password: String!): LoginResult!
- query me: MeResult! (reads auth_ref from cookie and returns decoded JWT payload)
- query projects(page: Int!, pageSize: Int!, searchTerm: String): ProjectPage!

Types:
LoginResult { success: Boolean!, message: String, authRef: String, userId: Int, tenantSlug: String, role: String }
MeResult { userId: Int!, tenantSlug: String!, role: String! }
Project { id: Int!, name: String!, description: String, status: String!, createdAt: String!, updatedAt: String! }
ProjectPage { data: [Project!]!, totalCount: Int!, page: Int!, pageSize: Int!, totalPages: Int!, hasPreviousPage: Boolean!, hasNextPage: Boolean! }

2) Auth pattern (must match PSA explanation):
- On login success:
  - Middleware creates a JWT { userId, tenantSlug, role } with short expiry
  - Generate auth_ref as UUID
  - Store in Redis: key=auth_ref value=JWT with TTL 1 hour
  - Set HttpOnly cookie "auth_ref" on response (sameSite=Lax, secure=false for local)
  - Return authRef in GraphQL response too (but cookie is the main mechanism)

- For projects/me:
  - Read auth_ref from cookie
  - Fetch JWT from Redis
  - If missing => throw GraphQL auth error
  - Decode JWT and build context

3) Resolvers:
- login resolver calls backend /api/auth/login via fetch/axios
- projects resolver calls backend /api/projects using tenantSlug and userId from context
- Ensure searchTerm is passed through
- Resolver must be async and handle errors cleanly

4) Folder structure:
middleware/
  src/
    server.ts
    graphql/schema.ts
    graphql/resolvers.ts
    auth/auth.ts (helpers: createJwt, setCookie, getContextFromRedis)
    redis/client.ts
    clients/backendClient.ts
    types.ts
  package.json
  tsconfig.json
  Dockerfile (optional but preferred)
  .dockerignore
  README.md

5) Environment variables (middleware/.env.example):
- PORT=4000
- BACKEND_BASE_URL=http://host.docker.internal:5000  (so middleware in docker can call host .NET)
- REDIS_URL=redis://localhost:6379  (or redis://psa_redis:6379 when in docker)
- JWT_SECRET=dev_secret_change_me

6) Update root docker-compose.yml:
Add a middleware service that runs on port 4000.
- It should connect to psa_network
- It should use redis service
- It should support calling backend on host via host.docker.internal
- Provide an alternate profile or clear instructions if backend is not dockerized.
Do NOT dockerize frontend in this phase.

7) Testing instructions:
- how to run middleware locally (npm install, npm run dev)
- how to test GraphQL via Apollo Sandbox / curl
Provide example GraphQL operations for login + projects.

Deliverables:
- All required files created
- Code should be runnable
- No admin-ui. Only middleware + backend.
