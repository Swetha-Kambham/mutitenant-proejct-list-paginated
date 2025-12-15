# Multi-Tenant Project List (Paginated) - Demo System

A **read-only, multi-tenant PSA-style architecture** demonstrating secure, enterprise-grade project list management with pagination and search capabilities.

## Overview

This system showcases:
- **Multi-tenant architecture** with schema-per-tenant isolation
- **Secure authentication** using JWT in Redis with reference tokens
- **Row-level security** for data access control
- **Pagination and search** for project lists
- **Polyglot architecture** (React + Node.js + .NET + PostgreSQL + Redis)

For detailed system design, see [docs/system-design.md](docs/system-design.md).

## Architecture

```
Browser → React → Node.js (GraphQL) → .NET Backend → PostgreSQL (multi-schema) + Redis
```

## Prerequisites

- Docker Desktop (or Docker Engine + Docker Compose)
- Docker Compose v2.0+
- 4GB+ available RAM

## Phase 1: Infrastructure Setup (CURRENT)

### Quick Start

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd mutitenant-proejct-list-paginated
   ```

2. **Start the infrastructure**
   ```bash
   docker-compose up -d
   ```

3. **Verify services are running**
   ```bash
   docker-compose ps
   ```

   You should see:
   - `psa_postgres` (healthy)
   - `psa_redis` (healthy)

4. **Check database initialization**
   ```bash
   docker-compose logs postgres | grep "NOTICE"
   ```

   Expected output:
   ```
   NOTICE:  Schemas created successfully: tenant_t1, tenant_t2
   NOTICE:  Tables created successfully in both tenant schemas
   NOTICE:  Seed data loaded successfully!
   NOTICE:  Tenant T1: 1 users, 15 projects, 10 access grants
   NOTICE:  Tenant T2: 1 users, 15 projects, 12 access grants
   ```

### Database Details

**Connection Info:**
- Host: `localhost`
- Port: `5432`
- Database: `psa_multitenant`
- Username: `psa_admin`
- Password: `psa_password`

**Schemas:**
- `tenant_t1` - First tenant's schema
- `tenant_t2` - Second tenant's schema

**Tables per schema:**
- `users` - User accounts
- `projects` - Project data
- `project_access` - Row-level access control

### Test Credentials

**Tenant T1:**
- Company Key: `t1`
- Username: `pm_t1`
- Password: `password123`
- Access: 10 out of 15 projects

**Tenant T2:**
- Company Key: `t2`
- Username: `pm_t2`
- Password: `password123`
- Access: 12 out of 15 projects

### Redis Details

**Connection Info:**
- Host: `localhost`
- Port: `6379`
- No password (development only)

### Verify Setup

**Connect to PostgreSQL:**
```bash
docker exec -it psa_postgres psql -U psa_admin -d psa_multitenant
```

**Run queries to verify data:**
```sql
-- Check tenant_t1 data
SELECT COUNT(*) FROM tenant_t1.users;      -- Should return 1
SELECT COUNT(*) FROM tenant_t1.projects;   -- Should return 15

-- Check tenant_t2 data
SELECT COUNT(*) FROM tenant_t2.users;      -- Should return 1
SELECT COUNT(*) FROM tenant_t2.projects;   -- Should return 15

-- Check row-level access for tenant_t1
SELECT pa.user_id, u.username, COUNT(pa.project_id) as accessible_projects
FROM tenant_t1.project_access pa
JOIN tenant_t1.users u ON u.id = pa.user_id
GROUP BY pa.user_id, u.username;
-- Should show pm_t1 has access to 10 projects

\q  -- Exit psql
```

**Connect to Redis:**
```bash
docker exec -it psa_redis redis-cli
```

```redis
PING  # Should return PONG
INFO  # View Redis server info
EXIT
```

### Manage Services

**View logs:**
```bash
docker-compose logs -f           # All services
docker-compose logs -f postgres  # PostgreSQL only
docker-compose logs -f redis     # Redis only
```

**Stop services:**
```bash
docker-compose down
```

**Stop and remove data (fresh start):**
```bash
docker-compose down -v
docker-compose up -d
```

**Restart services:**
```bash
docker-compose restart
```

## Project Structure

```
/
├── docker-compose.yml          # Phase 1: Infrastructure setup
├── database/
│   └── init/                   # Phase 1: Database scripts
│       ├── 001_create_schemas.sql
│       ├── 002_create_tables.sql
│       └── 003_seed_data.sql
├── docs/
│   ├── architecture-instructions.md  # Design requirements
│   └── system-design.md             # Detailed system design
└── README.md                   # This file

# Future phases (not yet implemented):
├── frontend/                   # Phase 4: React application
├── middleware/                 # Phase 3: Node.js + GraphQL
└── backend/                    # Phase 2: .NET C# services
```

## Implementation Status

- [x] **Phase 1: Infrastructure Setup** (CURRENT)
  - [x] Docker Compose configuration
  - [x] PostgreSQL with multi-tenant schemas
  - [x] Redis setup
  - [x] Database schema and seed data
  - [x] Documentation

- [ ] **Phase 2: Backend (.NET)** - Not started
- [ ] **Phase 3: Middleware (Node.js + GraphQL)** - Not started
- [ ] **Phase 4: Frontend (React)** - Not started
- [ ] **Phase 5: Integration & Testing** - Not started
- [ ] **Phase 6: Documentation** - Not started

## Next Steps

Once Phase 1 is verified and approved:
1. Implement .NET backend with layered architecture
2. Build Node.js middleware with GraphQL and authentication
3. Develop React frontend with Apollo Client
4. End-to-end integration testing

## Troubleshooting

**Containers won't start:**
```bash
docker-compose down -v
docker-compose up -d --force-recreate
```

**Port conflicts (5432 or 6379 already in use):**
- Stop other PostgreSQL/Redis instances
- Or modify ports in `docker-compose.yml`

**Database not initializing:**
```bash
docker-compose logs postgres
# Check for SQL errors in the logs
```

**Permission issues:**
```bash
# Ensure Docker has permission to mount volumes
# On Mac/Windows: Check Docker Desktop settings
```

## Security Notes

- **Demo purposes only**: Passwords are MD5 hashed (use bcrypt in production)
- **Default credentials**: Change credentials for any non-local deployment
- **No TLS**: Add TLS termination for production use
- **Redis**: Currently no password (add authentication for production)

## License

MIT

## Contact

For questions or issues, refer to [docs/architecture-instructions.md](docs/architecture-instructions.md).
