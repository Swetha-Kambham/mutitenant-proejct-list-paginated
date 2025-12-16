import axios, { AxiosInstance } from 'axios';

/**
 * HTTP client for communicating with .NET backend
 * Base URL: http://localhost:5011 (from .env)
 */
class BackendClient {
  private client: AxiosInstance;

  constructor() {
    const baseURL = process.env.BACKEND_BASE_URL || 'http://localhost:5011';

    this.client = axios.create({
      baseURL,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Log requests in development
    if (process.env.NODE_ENV !== 'production') {
      this.client.interceptors.request.use((config) => {
        console.log(`📤 Backend Request: ${config.method?.toUpperCase()} ${config.url}`);
        return config;
      });

      this.client.interceptors.response.use(
        (response) => {
          console.log(`📥 Backend Response: ${response.status} ${response.config.url}`);
          return response;
        },
        (error) => {
          console.error(`❌ Backend Error: ${error.message}`);
          return Promise.reject(error);
        }
      );
    }
  }

  /**
   * Call .NET backend login endpoint
   * POST /api/auth/login
   */
  async login(companyKey: string, username: string, password: string): Promise<any> {
    try {
      const response = await this.client.post('/api/auth/login', {
        companyKey,
        username,
        password,
      });

      return response.data;
    } catch (error: any) {
      console.error('Backend login error:', error.response?.data || error.message);
      throw new Error('Backend login failed');
    }
  }

  /**
   * Call .NET backend projects endpoint
   * GET /api/projects?tenantSlug=...&userId=...&page=...&pageSize=...&search=...
   */
  async getProjects(params: {
    tenantSlug: string;
    userId: number;
    page?: number;
    pageSize?: number;
    search?: string;
  }): Promise<any> {
    try {
      const response = await this.client.get('/api/projects', {
        params: {
          tenantSlug: params.tenantSlug,
          userId: params.userId,
          page: params.page || 1,
          pageSize: params.pageSize || 10,
          search: params.search || undefined,
        },
      });

      return response.data;
    } catch (error: any) {
      console.error('Backend projects error:', error.response?.data || error.message);
      throw new Error('Failed to fetch projects from backend');
    }
  }
}

// Export singleton instance
export default new BackendClient();
