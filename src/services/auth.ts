import type {
  AuthResponse,
  LoginDto,
  RegisterDto,
  SendVerificationCodeDto,
} from '@/types';
import { http } from '@/utils/request';

// 认证相关API
export const authAPI = {
  // 用户登录
  login: (data: LoginDto): Promise<AuthResponse> => {
    return http.post('/auth/login', data);
  },

  // 管理员登录
  adminLogin: (data: LoginDto): Promise<AuthResponse> => {
    return http.post('/auth/admin/login', data);
  },

  // 发送注册验证码
  sendVerificationCode: (
    data: SendVerificationCodeDto,
  ): Promise<{ message: string }> => {
    return http.post('/auth/send-verification-code', data);
  },

  // 用户注册
  register: (data: RegisterDto): Promise<AuthResponse> => {
    return http.post('/auth/register', data);
  },

  // 退出登录
  logout: (): Promise<{ message: string }> => {
    return http.post('/auth/logout');
  },

  // 强制退出所有设备
  logoutAll: (): Promise<{ message: string }> => {
    return http.post('/auth/logout-all');
  },

  // 刷新token
  refreshToken: (): Promise<AuthResponse> => {
    return http.post('/auth/refresh');
  },

  // 获取当前用户信息
  getCurrentUser: (): Promise<any> => {
    return http.get('/auth/me');
  },

  // 获取RSA公钥
  getRsaPublicKey: (): Promise<{ publicKey: string }> => {
    return http.get('/auth/rsa/public-key');
  },
};
