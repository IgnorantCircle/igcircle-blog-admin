import type { AuthResponse, LoginDto, User } from '../types';
import { http } from '../utils/request';

// 认证相关API
export const authAPI = {
  // 管理员登录
  login: (data: LoginDto): Promise<AuthResponse> => {
    return http.post('/auth/admin/login', data);
  },

  // 登出
  logout: (): Promise<void> => {
    return http.post('/auth/logout');
  },

  // 获取当前用户信息
  getCurrentUser: (): Promise<User> => {
    return http.get('/auth/me');
  },

  // 刷新token
  refreshToken: (): Promise<AuthResponse> => {
    return http.post('/auth/refresh');
  },

  // 修改密码
  changePassword: (data: {
    oldPassword: string;
    newPassword: string;
  }): Promise<void> => {
    return http.post('/auth/change-password', data);
  },
};
