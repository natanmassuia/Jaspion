import { UserRole } from '../constants/index.js';

export interface UserSession {
  userId: string;
  name: string;
  email: string;
  role: UserRole;
  department: string;
  mustChangePassword: boolean;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
}
