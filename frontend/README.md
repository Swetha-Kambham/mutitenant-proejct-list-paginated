# PSA Frontend - Multi-Tenant Project Management

React + TypeScript frontend for the PSA multi-tenant system.

## Features

- Cookie-based authentication (HttpOnly cookies)
- Multi-tenant project list with pagination
- Real-time search functionality
- Polaris-inspired minimal UI (green/white theme)
- Role-based access control

## Tech Stack

- React 18
- TypeScript
- Apollo Client (GraphQL)
- React Router
- Vite

## Prerequisites

- Node.js 18+
- npm or yarn
- GraphQL middleware running on `http://localhost:4000/graphql`

## Installation

```bash
npm install
```

## Development

```bash
npm start
```

Runs the app in development mode on [http://localhost:3000](http://localhost:3000).

## Build

```bash
npm run build
```

Builds the app for production to the `dist` folder.

## Project Structure

```
frontend/
├── src/
│   ├── apollo/
│   │   └── client.ts           # Apollo Client setup with cookie auth
│   ├── graphql/
│   │   ├── queries.ts          # GraphQL queries (projects, me)
│   │   └── mutations.ts        # GraphQL mutations (login, logout)
│   ├── pages/
│   │   ├── Login.tsx           # Login page
│   │   └── Projects.tsx        # Project list page
│   ├── components/
│   │   ├── ProjectTable.tsx    # Project table component
│   │   ├── Pagination.tsx      # Pagination controls
│   │   └── SearchBox.tsx       # Search input with debounce
│   ├── routes/
│   │   └── AppRouter.tsx       # React Router setup
│   ├── types.ts                # TypeScript interfaces
│   ├── App.tsx                 # Root component
│   ├── main.tsx                # Entry point
│   └── styles.css              # Global styles
├── package.json
├── tsconfig.json
├── vite.config.ts
└── index.html
```

## Routes

- `/login` - Login page
- `/projects` - Project list (requires authentication)
- `/` - Redirects to login

## Authentication Flow

1. User enters credentials on `/login`
2. Frontend calls `login` GraphQL mutation
3. Backend sets `auth_ref` HttpOnly cookie
4. Frontend redirects to `/projects`
5. All subsequent requests include the cookie automatically
6. JWT is stored only in Redis (server-side)
7. Frontend never sees or handles JWT directly

## Demo Credentials

### Tenant 1
- Company Key: `t1`
- Username: `pm_t1`
- Password: `password123`

### Tenant 2
- Company Key: `t2`
- Username: `pm_t2`
- Password: `password123`

## GraphQL Operations

### Login Mutation
```graphql
mutation Login($companyKey: String!, $username: String!, $password: String!) {
  login(companyKey: $companyKey, username: $username, password: $password) {
    success
    message
    user {
      userId
      username
      tenantSlug
      role
    }
  }
}
```

### Projects Query
```graphql
query GetProjects($page: Int!, $pageSize: Int!, $search: String) {
  projects(page: $page, pageSize: $pageSize, search: $search) {
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
    hasNextPage
    hasPreviousPage
  }
}
```

### Logout Mutation
```graphql
mutation Logout {
  logout {
    success
    message
  }
}
```

## Security

- All authentication handled via HttpOnly cookies
- No JWT storage in frontend
- CSRF protection via SameSite cookie attribute
- Credentials automatically included in all GraphQL requests
- Automatic redirect to login on authentication errors

## Troubleshooting

### Cannot connect to GraphQL server
- Ensure middleware is running on `http://localhost:4000`
- Check Vite proxy configuration in `vite.config.ts`

### Authentication not working
- Verify cookies are enabled in browser
- Check browser console for CORS errors
- Ensure middleware has CORS configured for `http://localhost:3000`

### Projects not loading
- Verify backend API is running
- Check browser network tab for GraphQL errors
- Ensure you're logged in with valid credentials

## License

MIT
