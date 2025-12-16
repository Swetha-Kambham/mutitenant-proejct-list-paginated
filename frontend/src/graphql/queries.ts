import { gql } from '@apollo/client';

export const GET_PROJECTS = gql`
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
`;

export const GET_ME = gql`
  query GetMe {
    me {
      userId
      username
      tenantSlug
      role
    }
  }
`;
