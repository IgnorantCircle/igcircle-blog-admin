import type { BaseEntity, PaginationParams } from './common';

// 用户实体接口
export interface User extends BaseEntity {
  username: string;
  email: string;
  nickname?: string;
  avatar?: string;
  bio?: string;
  role: 'admin' | 'user';
  status: 'active' | 'inactive' | 'banned';
  onlineStatus?: 'online' | 'offline' | 'away';
  lastActiveAt?: string | null;
  emailVerified?: boolean;
}

// 创建用户DTO
export interface CreateUserDto {
  username: string;
  email: string;
  password: string;
  nickname?: string;
}

// 更新用户DTO
export interface UpdateUserDto {
  nickname?: string;
  bio?: string;
  avatar?: string;
}

// 用户查询DTO
export interface UserQueryDto extends PaginationParams {
  status?: 'active' | 'inactive' | 'banned';
  role?: 'user' | 'admin';
}

// 更新用户状态DTO
export interface UpdateUserStatusDto {
  status: 'active' | 'inactive' | 'banned';
}

// 更新用户角色DTO
export interface UpdateUserRoleDto {
  role: 'admin' | 'user';
}

// 用户统计接口
export interface UserStats {
  total: number;
  active: number;
  inactive: number;
  banned: number;
  admins: number;
  users: number;
  onlineUsers: number;
  emailVerifiedUsers: number;
  recentRegistrations: User[];
}

// 用户列表项类型（用于页面组件）
export interface UserItem {
  id: string;
  username: string;
  email: string;
  nickname?: string;
  avatar?: string;
  role: 'user' | 'admin';
  status: 'active' | 'inactive' | 'banned';
  onlineStatus?: 'online' | 'offline' | 'away';
  lastActiveAt?: string | null;
  emailVerified?: boolean;
  createdAt: string;
  updatedAt: string;
}

// 用户表单数据类型（用于页面组件）
export interface UserFormData {
  username: string;
  email: string;
  password: string;
  nickname?: string;
  role: 'user' | 'admin';
  status: 'active' | 'inactive' | 'banned';
}
