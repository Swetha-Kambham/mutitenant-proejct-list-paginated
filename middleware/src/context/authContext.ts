import { Request, Response } from 'express';
import authService, { JWTPayload } from '../services/authService';

/**
 * GraphQL Context
 * Contains user info extracted from auth_ref cookie
 */
export interface GraphQLContext {
  req: Request;
  res: Response;
  user: JWTPayload | null;
}

/**
 * Create GraphQL context
 * Extracts auth_ref from cookie and validates it
 *
 * Flow:
 * 1. Read auth_ref from cookie
 * 2. Fetch JWT from Redis using auth_ref
 * 3. Verify and decode JWT
 * 4. Attach user to context
 */
export async function createContext({ req, res }: { req: Request; res: Response }): Promise<GraphQLContext> {
  // Extract auth_ref from cookie
  const authRef = req.cookies?.auth_ref;

  if (!authRef) {
    // No auth_ref cookie - user not authenticated
    return { req, res, user: null };
  }

  // Verify auth_ref and get user context
  const user = await authService.verifyAuthRef(authRef);

  if (!user) {
    // auth_ref invalid or expired
    // Clear the invalid cookie
    res.clearCookie('auth_ref');
    return { req, res, user: null };
  }

  // User authenticated successfully
  return { req, res, user };
}

/**
 * Auth guard for GraphQL resolvers
 * Throws error if user not authenticated
 */
export function requireAuth(context: GraphQLContext): asserts context is GraphQLContext & { user: JWTPayload } {
  if (!context.user) {
    throw new Error('Unauthorized: Please login first');
  }
}
