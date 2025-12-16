import authService from '../services/authService';
import backendClient from '../services/backendClient';
import { GraphQLContext, requireAuth } from '../context/authContext';

/**
 * GraphQL Resolvers
 *
 * These resolvers act as a thin layer that:
 * 1. Handles authentication (login/logout)
 * 2. Validates user context
 * 3. Forwards requests to .NET backend
 * 4. Returns backend responses as-is
 *
 * NO business logic here - everything is delegated to the backend
 */
export const resolvers = {
  Query: {
    /**
     * Get current authenticated user
     * Returns null if not logged in
     */
    me: async (_: any, __: any, context: GraphQLContext) => {
      return context.user;
    },

    /**
     * Get paginated list of projects
     * Requires authentication
     *
     * Flow:
     * 1. Verify user is authenticated
     * 2. Extract tenantSlug and userId from context
     * 3. Forward request to .NET backend
     * 4. Return backend response
     */
    projects: async (
      _: any,
      args: { page?: number; pageSize?: number; search?: string },
      context: GraphQLContext
    ) => {
      // Ensure user is authenticated
      requireAuth(context);

      const { page = 1, pageSize = 10, search } = args;

      // Forward to .NET backend
      // tenantSlug and userId come from auth context (NOT from frontend)
      const response = await backendClient.getProjects({
        tenantSlug: context.user.tenantSlug,
        userId: context.user.userId,
        page,
        pageSize,
        search,
      });

      return response;
    },
  },

  Mutation: {
    /**
     * Login mutation
     *
     * Flow:
     * 1. Call authService.login() which:
     *    - Validates credentials with .NET backend
     *    - Creates JWT
     *    - Stores auth_ref → JWT in Redis
     * 2. Set auth_ref as HttpOnly cookie
     * 3. Return user context
     */
    login: async (
      _: any,
      args: { companyKey: string; username: string; password: string },
      context: GraphQLContext
    ) => {
      const { companyKey, username, password } = args;

      // Call auth service
      const result = await authService.login(companyKey, username, password);

      if (!result.success || !result.authRef) {
        return {
          success: false,
          user: null,
          message: result.message || 'Login failed',
        };
      }

      // Set auth_ref as HttpOnly cookie
      // IMPORTANT: Browser NEVER sees the JWT, only this reference token
      context.res.cookie('auth_ref', result.authRef, {
        httpOnly: true, // JavaScript cannot access this cookie
        secure: process.env.NODE_ENV === 'production', // HTTPS only in production
        sameSite: 'lax',
        maxAge: 3600000, // 1 hour in milliseconds
        path: '/',
      });

      console.log(`✅ Set auth_ref cookie for user: ${result.user?.username}`);

      return {
        success: true,
        user: result.user,
        message: 'Login successful',
      };
    },

    /**
     * Logout mutation
     *
     * Flow:
     * 1. Get auth_ref from cookie
     * 2. Delete auth_ref from Redis
     * 3. Clear cookie
     */
    logout: async (_: any, __: any, context: GraphQLContext) => {
      const authRef = context.req.cookies?.auth_ref;

      if (authRef) {
        // Delete from Redis
        await authService.logout(authRef);
      }

      // Clear cookie
      context.res.clearCookie('auth_ref', { path: '/' });

      console.log('✅ User logged out');

      return true;
    },
  },
};
