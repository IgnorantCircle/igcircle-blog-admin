import type {
  CreateUserType,
  PaginatedResponse,
  UpdateUserRoleType,
  UpdateUserStatusType,
  UpdateUserType,
  UserQueryType,
  UserStatsType,
  UserType,
} from '@/types';
import { http } from '@/utils';

// 用户管理相关API
export const userAPI = {
  // 获取用户列表
  getUsers: (params?: UserQueryType): Promise<PaginatedResponse<UserType>> => {
    return http.get('/admin/users', params);
  },

  // 获取用户详情
  getUser: (id: string): Promise<UserType> => {
    return http.get(`/admin/users/${id}`);
  },

  // 创建用户
  createUser: (data: CreateUserType): Promise<UserType> => {
    return http.post('/admin/users', data);
  },

  // 更新用户
  updateUser: (id: string, data: UpdateUserType): Promise<UserType> => {
    return http.put(`/admin/users/${id}`, data);
  },

  // 更新用户状态
  updateUserStatus: (
    id: string,
    data: UpdateUserStatusType,
  ): Promise<UserType> => {
    return http.patch(`/admin/users/${id}/status`, data);
  },

  // 更新用户角色
  updateUserRole: (id: string, data: UpdateUserRoleType): Promise<UserType> => {
    return http.patch(`/admin/users/${id}/role`, data);
  },

  // 删除用户
  deleteUser: (id: string): Promise<void> => {
    return http.delete(`/admin/users/${id}`);
  },

  // 获取用户统计
  getUserStats: (): Promise<UserStatsType> => {
    return http.get('/admin/users/stats');
  },

  // 获取用户在线状态
  getUserOnlineStatus: (
    id: string,
  ): Promise<{
    userId: string;
    onlineStatus: string;
    lastActiveAt: number | null;
  }> => {
    return http.get(`/admin/users/${id}/online-status`);
  },

  // 强制用户退出所有设备
  forceLogoutUser: (id: string): Promise<{ message: string }> => {
    return http.post(`/admin/users/${id}/logout-all`);
  },
};
