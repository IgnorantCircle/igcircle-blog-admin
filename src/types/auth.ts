import type { UserType } from './user';

export interface LoginType {
  username: string;
  password: string;
}

export interface RegisterType {
  username: string;
  email: string;
  password: string;
  nickname?: string;
  verificationCode: string;
}

export interface SendVerificationCodeType {
  email: string;
}

// 认证响应接口
export interface AuthResponse {
  accessToken: string;
  user: Pick<UserType, 'id' | 'username' | 'email' | 'nickname' | 'role'>;
}
