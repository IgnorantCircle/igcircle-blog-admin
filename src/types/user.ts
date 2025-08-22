import type { BaseEntity, PaginationParams } from './common';

// 用户实体接口
export interface UserType extends BaseEntity {
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

// 创建用户
export interface CreateUserType {
  username: string;
  email: string;
  password: string;
  nickname?: string;
}

// 更新用户
export interface UpdateUserType {
  nickname?: string;
  bio?: string;
  avatar?: string;
}

// 用户查询
export interface UserQueryType extends PaginationParams {
  status?: 'active' | 'inactive' | 'banned';
  role?: 'user' | 'admin';
}

// 更新用户状态
export interface UpdateUserStatusType {
  status: 'active' | 'inactive' | 'banned';
}

// 更新用户角色
export interface UpdateUserRoleType {
  role: 'admin' | 'user';
}

// 用户统计接口
export interface UserStatsType {
  total: number;
  activeUsers: number;
  inactiveUsers: number;
  bannedUsers: number;
  adminUsers: number;
  users: number;
  onlineUsers: number;
  emailVerifiedUsers: number;
  recentRegistrations: UserType[];
}

// 用户列表项类型（用于页面组件）
export interface UserItemType {
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
export interface UserFormDataType {
  username: string;
  email: string;
  password: string;
  nickname?: string;
  role: 'user' | 'admin';
  status: 'active' | 'inactive' | 'banned';
}
