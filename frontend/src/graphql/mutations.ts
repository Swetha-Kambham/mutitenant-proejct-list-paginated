import { gql } from '@apollo/client';

export const LOGIN_MUTATION = gql`
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
`;

export const LOGOUT_MUTATION = gql`
  mutation Logout {
    logout {
      success
      message
    }
  }
`;
