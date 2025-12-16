import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import { storeAuthRef, getAuthRef, deleteAuthRef } from '../redis/redisClient';
import backendClient from './backendClient';

/**
 * JWT Payload structure
 */
export interface JWTPayload {
  userId: number;
  username: string;
  tenantSlug: string;
  role: string;
  iat?: number;
  exp?: number;
}

/**
 * Login response structure
 */
export interface LoginResponse {
  success: boolean;
  authRef?: string;
  user?: {
    userId: number;
    username: string;
    tenantSlug: string;
    role: string;
  };
  message?: string;
}

/**
 * Auth Service
 * Handles JWT creation, Redis storage, and authentication
 */
class AuthService {
  private jwtSecret: string;

  constructor() {
    this.jwtSecret = process.env.JWT_SECRET || 'demo_secret';
    if (this.jwtSecret === 'demo_secret') {
      console.warn('⚠️  WARNING: Using default JWT secret. Set JWT_SECRET in .env for production!');
    }
  }

  /**
   * Login flow:
   * 1. Call .NET backend to validate credentials
   * 2. If successful, create JWT
   * 3. Generate auth_ref (UUID)
   * 4. Store auth_ref → JWT in Redis
   * 5. Return auth_ref to be set as cookie
   */
  async login(companyKey: string, username: string, password: string): Promise<LoginResponse> {
    try {
      // Call .NET backend
      const backendResponse = await backendClient.login(companyKey, username, password);

      if (!backendResponse.success) {
        return {
          success: false,
          message: backendResponse.message || 'Login failed',
        };
      }

      // Create JWT payload
      const payload: JWTPayload = {
        userId: backendResponse.userId,
        username: backendResponse.username,
        tenantSlug: backendResponse.tenantSlug,
        role: backendResponse.role,
      };

      // Sign JWT (expires in 1 hour)
      const token = jwt.sign(payload, this.jwtSecret, { expiresIn: '1h' });

      // Generate unique auth_ref
      const authRef = uuidv4();

      // Store in Redis (auth_ref → JWT)
      await storeAuthRef(authRef, token);

      console.log(`✅ Login successful: ${username} (${backendResponse.tenantSlug})`);

      return {
        success: true,
        authRef,
        user: {
          userId: payload.userId,
          username: payload.username,
          tenantSlug: payload.tenantSlug,
          role: payload.role,
        },
      };
    } catch (error: any) {
      console.error('Login error:', error.message);
      return {
        success: false,
        message: 'Login failed',
      };
    }
  }

  /**
   * Verify auth_ref and return user context
   * 1. Fetch JWT from Redis using auth_ref
   * 2. Verify and decode JWT
   * 3. Return user context
   */
  async verifyAuthRef(authRef: string): Promise<JWTPayload | null> {
    try {
      // Get JWT from Redis
      const token = await getAuthRef(authRef);

      if (!token) {
        console.warn('❌ auth_ref not found in Redis or expired');
        return null;
      }

      // Verify and decode JWT
      const decoded = jwt.verify(token, this.jwtSecret) as JWTPayload;

      return decoded;
    } catch (error: any) {
      if (error.name === 'TokenExpiredError') {
        console.warn('❌ JWT expired');
      } else if (error.name === 'JsonWebTokenError') {
        console.warn('❌ Invalid JWT');
      } else {
        console.error('Auth verification error:', error.message);
      }
      return null;
    }
  }

  /**
   * Logout - delete auth_ref from Redis
   */
  async logout(authRef: string): Promise<void> {
    await deleteAuthRef(authRef);
    console.log('✅ User logged out, auth_ref deleted');
  }
}

// Export singleton instance
export default new AuthService();
