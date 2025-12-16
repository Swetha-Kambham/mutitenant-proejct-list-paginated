/**
 * GraphQL Type Definitions
 *
 * This schema defines:
 * 1. Login mutation - authenticates user and returns auth context
 * 2. Projects query - returns paginated list of projects
 */
export const typeDefs = `#graphql
  # User type - returned after successful login
  type User {
    userId: Int!
    username: String!
    tenantSlug: String!
    role: String!
  }

  # Login response
  type LoginResponse {
    success: Boolean!
    user: User
    message: String
  }

  # Project type - matches backend DTO
  type Project {
    id: Int!
    name: String!
    description: String
    status: String!
    createdAt: String!
    updatedAt: String!
  }

  # Paginated projects response
  type PaginatedProjects {
    data: [Project!]!
    totalCount: Int!
    page: Int!
    pageSize: Int!
    totalPages: Int!
    hasPreviousPage: Boolean!
    hasNextPage: Boolean!
  }

  # Queries - read operations
  type Query {
    # Get current user info (if authenticated)
    me: User

    # Get paginated list of projects (requires authentication)
    # Frontend does NOT need to pass tenantSlug or userId
    # These are automatically extracted from auth context
    projects(
      page: Int = 1
      pageSize: Int = 10
      search: String
    ): PaginatedProjects!
  }

  # Mutations - write operations
  type Mutation {
    # Login - validates credentials and creates session
    # Returns auth context, auth_ref is set as HttpOnly cookie
    login(
      companyKey: String!
      username: String!
      password: String!
    ): LoginResponse!

    # Logout - invalidates session
    logout: Boolean!
  }
`;
