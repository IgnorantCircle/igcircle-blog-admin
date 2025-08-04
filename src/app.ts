// 运行时配置
import type { ErrorResponse } from '@/types';
import type { AxiosRequestConfig, AxiosResponse } from '@umijs/max';
import { RequestConfig } from '@umijs/max';
import { message } from 'antd';
export async function getInitialState(): Promise<{ name: string }> {
  // 检查是否存在token且未过期
  const token = localStorage.getItem('token');
  const userInfo = localStorage.getItem('userInfo');

  if (token && userInfo) {
    // 简单检查token是否过期（实际项目中可能需要更复杂的验证）
    try {
      // 如果在登录相关页面，不进行跳转
      const { pathname } = window.location;
      if (pathname === '/login' || pathname === '/register') {
        message.success('已登录，正在为您跳转首页～');
        window.location.href = '/';
      }
    } catch (error) {
      // Token无效，清除本地存储
      localStorage.removeItem('token');
      localStorage.removeItem('userInfo');
    }
  }

  return { name: '' };
}

export const layout = () => {
  return {
    logo: 'https://img.alicdn.com/tfs/TB1YHEpwUT1gK0jSZFhXXaAtVXa-28-27.svg',
    menu: {
      locale: false,
    },
  };
};

// 全局请求配置
export const request: RequestConfig = {
  // 请求超时时间
  timeout: 10000,

  // 请求基础URL
  baseURL: process.env.API_BASE_URL || 'http://localhost:7001/api',
  // 请求头配置
  headers: {
    'Content-Type': 'application/json',
  },

  // 请求拦截器
  requestInterceptors: [
    (config: AxiosRequestConfig) => {
      // 添加认证token
      const token = localStorage.getItem('token');
      if (token) {
        config.headers = {
          ...config.headers,
          Authorization: `Bearer ${token}`,
        };
      }
      return config;
    },
  ],

  // 响应拦截器
  responseInterceptors: [
    (response: AxiosResponse) => {
      // 处理成功响应
      const { data } = response;

      // 如果响应数据符合标准格式，直接返回
      if (data && typeof data === 'object' && 'code' in data) {
        return response;
      }

      // 兼容旧格式，包装成标准格式
      return {
        ...response,
        data: {
          code: 200,
          message: '操作成功',
          data: data,
          timestamp: new Date().toISOString(),
          path: response.config?.url || '',
        },
      } as any;
    },
  ],

  // 错误处理
  errorConfig: {
    // 错误抛出
    errorThrower: (res) => {
      const { success, data, errorCode, errorMessage, showMessage } =
        res as any;
      if (!success) {
        const error: any = new Error(errorMessage);
        error.name = 'BizError';
        error.info = { errorCode, errorMessage, showMessage, data };
        throw error;
      }
    },

    // 错误接收及处理
    errorHandler: (error: any, opts: any) => {
      if (opts?.skipErrorHandler) throw error;

      let errorMessage = '请求失败';

      if (error.response) {
        const { status, data } = error.response;
        const errorResponse = data as ErrorResponse;

        switch (status) {
          case 400:
            errorMessage = errorResponse?.message || '请求参数错误';
            if (errorResponse?.details?.length) {
              errorMessage = errorResponse.details.join(', ');
            }
            break;
          case 401:
            errorMessage = '登录已过期，请重新登录';
            // 清除本地存储的认证信息
            localStorage.removeItem('token');
            localStorage.removeItem('userInfo');
            // 跳转到登录页
            setTimeout(() => {
              window.location.href = '/login';
            }, 1000);
            break;
          case 403:
            errorMessage = '没有权限访问该资源';
            break;
          case 404:
            errorMessage = '请求的资源不存在';
            break;
          case 500:
            errorMessage = '服务器内部错误';
            break;
          default:
            errorMessage = errorResponse?.message || `请求失败 (${status})`;
        }
      } else if (error.message) {
        if (error.message.includes('Network Error')) {
          errorMessage = '网络连接失败，请检查网络';
        } else if (error.message.includes('timeout')) {
          errorMessage = '请求超时，请稍后重试';
        } else {
          errorMessage = error.message;
        }
      }

      // 显示错误消息
      message.error(errorMessage);

      throw error;
    },
  },
};
