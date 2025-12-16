# Frontend Specification – PSA Multi-Tenant Project List

## Purpose

This document defines the **frontend-only implementation** for a PSA-style, multi-tenant system.
It is intended to be used by **Claude Code** to generate the frontend application.

The system is **read-only** and designed for:
- Architecture demonstration
- Interview walkthrough
- End-to-end flow clarity

---

## System Context

The frontend communicates with a **GraphQL middleware** that:
- Manages authentication via HttpOnly cookies (`auth_ref`)
- Enforces tenant isolation
- Applies role-based and row-level permissions in the backend

The frontend must **not** implement any security logic beyond UI visibility.

---

## Core User Flow

1. User opens Login page
2. User enters:
   - Company Key
   - Username
   - Password
3. User logs in via GraphQL mutation
4. Backend sets `auth_ref` cookie
5. User is redirected to Project List
6. User can:
   - Search projects
   - Paginate results
   - Logout
7. Logout clears session and returns user to Login

---

## Tech Stack (Mandatory)

- React
- TypeScript
- Apollo Client
- GraphQL
- React Router
- Functional Components
- React Hooks

### Explicitly Not Allowed
- Redux
- Class components
- Admin UI
- UI libraries (MUI, AntD, Chakra)
- Token handling in frontend

---

## Authentication Rules

- Frontend never sees JWT
- JWT is stored only in Redis (server-side)
- Frontend relies on HttpOnly cookie
- Apollo Client must use:


---

## Pages & Routes

### `/login`
Login screen with:
- Company Key
- Username
- Password
- Submit button

Behavior:
- Calls `login` GraphQL mutation
- On success → redirect to `/projects`
- On failure → show error message

---

### `/projects`
Project List screen with:
- Table or list view
- Columns:
- Project Name
- Status
- Search box (case-insensitive)
- Pagination controls
- Logout button

Behavior:
- Calls `projects` GraphQL query
- Uses page + pageSize + search
- Backend filters data by:
- Tenant
- Role
- Row-level access

---

## GraphQL Operations (Assumed Existing)

### Mutation: `login`
Inputs:
- companyKey
- username
- password

Returns:
- success
- user:
- userId
- username
- tenantSlug
- role

Auth cookie is set automatically.

---

### Mutation: `logout`
- Invalidates session in Redis
- Clears auth cookie

---

### Query: `projects`
Inputs:
- page
- pageSize
- search

Returns:
- data[]
- totalCount
- page
- pageSize
- hasNextPage
- hasPreviousPage

---

## Apollo Client Setup

- Endpoint: `/graphql`
- Must include cookies
- Handle errors globally
- No manual auth headers

---

## Folder Structure (Required)

frontend/
├── src/
│ ├── apollo/
│ │ └── client.ts
│ ├── graphql/
│ │ ├── queries.ts
│ │ └── mutations.ts
│ ├── pages/
│ │ ├── Login.tsx
│ │ └── Projects.tsx
│ ├── components/
│ │ ├── ProjectTable.tsx
│ │ ├── Pagination.tsx
│ │ └── SearchBox.tsx
│ ├── routes/
│ │ └── AppRouter.tsx
│ ├── App.tsx
│ └── main.tsx
├── package.json


---

## UI Guidelines

- Clean and minimal
- White background
- Green accents (Polaris-inspired)
- Focus on clarity over styling
- Plain CSS is sufficient

---

## Demo Requirements (Critical)

The frontend must support this demo:

1. Login with tenant `t1`
2. View tenant `t1` projects
3. Use search
4. Paginate results
5. Logout
6. Login with tenant `t2`
7. View different project list automatically

---

## Non-Goals

Do NOT implement:
- Project creation
- Project editing
- Admin UI
- Role management
- Token storage
- Advanced state management

---

## Final Instruction for Claude

Generate the **entire frontend application** strictly following this specification.

Do not:
- Change the architecture
- Add extra features
- Simplify authentication
- Move security logic to frontend