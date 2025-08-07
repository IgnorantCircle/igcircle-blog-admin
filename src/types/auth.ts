import type { User } from './user';

// 登录DTO
export interface LoginDto {
  username: string;
  password: string;
}

// 注册DTO
export interface RegisterDto {
  username: string;
  email: string;
  password: string;
  nickname?: string;
  verificationCode: string;
}

// 发送验证码DTO
export interface SendVerificationCodeDto {
  email: string;
}

// 认证响应接口
export interface AuthResponse {
  access_token: string;
  user: Pick<User, 'id' | 'username' | 'email' | 'nickname' | 'role'>;
}
