import type {
  BatchDeleteDto,
  CreateUserDto,
  PaginatedResponse,
  UpdateUserDto,
  UpdateUserRoleDto,
  UpdateUserStatusDto,
  User,
  UserQueryDto,
  UserStats,
} from '@/types';
import { http } from '@/utils/request';

// 用户管理相关API
export const userAPI = {
  // 获取用户列表
  getUsers: (params?: UserQueryDto): Promise<PaginatedResponse<User>> => {
    return http.get('/admin/users', params);
  },

  // 获取用户详情
  getUser: (id: string): Promise<User> => {
    return http.get(`/admin/users/${id}`);
  },

  // 创建用户
  createUser: (data: CreateUserDto): Promise<User> => {
    return http.post('/admin/users', data);
  },

  // 更新用户
  updateUser: (id: string, data: UpdateUserDto): Promise<User> => {
    return http.put(`/admin/users/${id}`, data);
  },

  // 更新用户状态
  updateUserStatus: (id: string, data: UpdateUserStatusDto): Promise<User> => {
    return http.patch(`/admin/users/${id}/status`, data);
  },

  // 更新用户角色
  updateUserRole: (id: string, data: UpdateUserRoleDto): Promise<User> => {
    return http.patch(`/admin/users/${id}/role`, data);
  },

  // 删除用户
  deleteUser: (id: string): Promise<void> => {
    return http.delete(`/admin/users/${id}`);
  },

  // 批量删除用户
  batchDeleteUsers: (data: BatchDeleteDto): Promise<void> => {
    return http.delete('/admin/users/batch', data);
  },

  // 获取用户统计
  getUserStats: (): Promise<UserStats> => {
    return http.get('/admin/users/stats');
  },

  // 强制用户退出所有设备
  forceLogoutUser: (id: string): Promise<{ message: string }> => {
    return http.post(`/admin/users/${id}/logout-all`);
  },
};
