# Architecture & Design Instructions
## Multi-Tenant Project List (Paginated) – Demo System

This document defines the **design-first instructions** for this repository.
Claude Code must read and follow this file before writing any code.

---

## Goal of This System

This repository demonstrates a **realistic enterprise PSA-style architecture**
focused on **secure, multi-tenant, read-only access** to a paginated project list.

The system is intentionally minimal and designed for:
- Interview demonstration
- Architecture explanation
- End-to-end flow clarity

---

## HARD RULES (Must Not Be Violated)

1. This is a **READ-ONLY** system
   - No project creation
   - No project update
   - No project deletion
   - No project forms

2. Multi-Tenant Architecture
   - ONE Postgres database
   - Schema per tenant
     - `tenant_t1`
     - `tenant_t2`
   - Tenant resolved using **Company Key** at login

3. Security
   - OAuth-style authentication
   - JWT stored ONLY in Redis
   - Browser stores ONLY a reference key (`auth_ref`) in a cookie
   - Backend enforces ALL security
   - Frontend permission checks are visibility-only

4. Roles
   - Only one role is required: **Project Manager (PM)**
   - PM can view ONLY authorized projects

---

## Tech Stack (Fixed – Do Not Change)

### Frontend
- React
- React Router
- React Hooks
- Apollo Client
- Jest for unit tests

### Middleware
- Node.js
- Express
- Apollo Server (GraphQL)

### Backend
- .NET Framework (C#)
- Entity Framework
- Layered architecture:
  - Contracts
  - Services (Business Logic)
  - DAL / Platform

### Data
- Postgres (shared DB, schema per tenant)
- Redis (authentication & caching)

### Infrastructure
- Docker
- Docker Compose
- No cloud deployment (AWS/Azure) for now

---

## Core Use Case (Most Important)

**Project Manager views a paginated, searchable list of projects**

This flow must include:
1. Login
2. Token issuance
3. Tenant resolution
4. GraphQL context creation
5. Backend permission checks
6. Paginated DB query
7. Secure response to UI

This is the PRIMARY feature of the system.

---

## Project Data Handling

- Project data is **pre-seeded directly into Postgres**
- Each tenant schema has its own data
- The application only READS project data

No project mutations should exist anywhere.

---

## Pagination & Search

- Pagination uses:
  - page
  - pageSize
  - LIMIT / OFFSET
- Search is:
  - Case-insensitive
  - Based on project name

Advanced pagination (DynamoDB tokens) is **out of scope** for implementation.

---

## Authentication Flow (High-Level)

1. User logs in using:
   - Company Key
   - Username
   - Password
2. Backend validates credentials
3. JWT is issued with:
   - userId
   - tenantSlug
   - role
4. JWT is stored in Redis
5. Browser receives ONLY `auth_ref`
6. All requests send `auth_ref`
7. Middleware fetches JWT from Redis

---

## Authorization Model

- UI checks permissions only for visibility
- Backend enforces:
  - Role-level permissions
  - Row-level access
- PM sees only allowed projects

---

## What Claude Code Must Do FIRST

Claude Code must NOT write code immediately.

First, Claude must produce:
1. High-level system architecture explanation
2. Responsibilities of each layer
3. Authentication & authorization explanation
4. Database model (high-level)
5. Folder structure proposal
6. Clear implementation phases

Claude must WAIT for approval before coding.

---

## Success Criteria

The final system must allow:
1. Login as PM for Tenant T1
2. View ONLY T1 projects
3. Paginate project list
4. Search projects by name
5. Explain the flow clearly in an interview
