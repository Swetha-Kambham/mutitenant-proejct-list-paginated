export interface Project {
  id: number;
  name: string;
  description: string | null;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export interface ProjectPage {
  data: Project[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface User {
  userId: number;
  username: string;
  tenantSlug: string;
  role: string;
}

export interface LoginResult {
  success: boolean;
  message?: string;
  user?: User;
}

export interface LogoutResult {
  success: boolean;
  message?: string;
}
