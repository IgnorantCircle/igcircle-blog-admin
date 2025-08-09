import { authAPI } from '@/services';
import type { User } from '@/types';
import { LogoutOutlined, UserOutlined } from '@ant-design/icons';
import type {
  AxiosRequestConfig,
  AxiosResponse,
  RequestConfig,
} from '@umijs/max';
import { history } from '@umijs/max';
import { Avatar, Dropdown, message, Space } from 'antd';
import React from 'react';
const baseUrl = process.env.REACT_APP_API_BASE_URL;
// 运行时配置

// 全局初始化数据配置，用于 Layout 用户信息和权限初始化
// 更多信息见文档：https://umijs.org/docs/api/runtime-config#getinitialstate
export async function getInitialState(): Promise<{ userInfo?: User } | null> {
  // 检查是否存在token
  const token = localStorage.getItem('token');
  const userInfo = localStorage.getItem('userInfo') ?? '';

  if (token && userInfo) {
    try {
      // 如果在登录相关页面，不进行跳转
      const { pathname } = window.location;
      if (pathname === '/login' || pathname === '/register') {
        window.location.href = '/';
      }
    } catch (error) {
      // Token无效，清除本地存储
      localStorage.removeItem('token');
      localStorage.removeItem('userInfo');
    }
  }

  return { userInfo: JSON.parse(userInfo) };
}

export const layout = () => {
  // 退出登录处理函数
  const handleLogout = async () => {
    try {
      await authAPI.logout();
      message.success('退出登录成功');
    } catch (error) {
      console.error('退出登录失败:', error);
    } finally {
      // 清除本地存储
      localStorage.removeItem('token');
      localStorage.removeItem('userInfo');
      // 跳转到登录页
      history.push('/login');
    }
  };

  // 获取用户信息
  const userInfo = localStorage.getItem('userInfo');
  const user = userInfo ? JSON.parse(userInfo) : null;

  // 用户菜单项
  const userMenuItems = [
    {
      key: 'logout',
      icon: React.createElement(LogoutOutlined),
      label: '退出登录',
      onClick: handleLogout,
    },
  ];

  return {
    logo: 'https://img.alicdn.com/tfs/TB1YHEpwUT1gK0jSZFhXXaAtVXa-28-27.svg',
    menu: {
      locale: false,
    },
    rightContentRender: () => {
      if (!user) return null;

      return React.createElement(
        Space,
        { size: 'middle' },
        React.createElement(
          Dropdown,
          {
            menu: { items: userMenuItems },
            placement: 'topRight',
            arrow: true,
          },
          React.createElement(
            Space,
            { style: { cursor: 'pointer' } },
            React.createElement(Avatar, {
              size: 'small',
              icon: React.createElement(UserOutlined),
            }),
            React.createElement('span', null, user.username || '管理员'),
          ),
        ),
      );
    },
  };
};

// 全局请求配置
export const request: RequestConfig = {
  // 请求超时时间1分钟
  timeout: 60000,

  // 请求基础URL
  baseURL: process.env.NODE_ENV === 'development' ? baseUrl : '',

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

  // 错误处理配置（简化版，主要错误处理已移至HTTP客户端层和Hook层）
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

    // 错误接收及处理（简化版，主要用于兜底）
    errorHandler: (error: any, opts: any) => {
      if (opts?.skipErrorHandler) throw error;

      // 如果错误已经被HTTP客户端层处理过，直接抛出
      if (error?.standardError) {
        throw error;
      }

      // 兜底错误处理
      message.error('系统错误，请稍后重试');
      throw error;
    },
  },
};
