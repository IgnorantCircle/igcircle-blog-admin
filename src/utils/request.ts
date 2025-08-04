import type { RequestOptions } from '@umijs/max';
import { request as umiRequest } from '@umijs/max';
import { message } from 'antd';
import type { ApiResponse, ErrorResponse } from '../types';

/**
 * 请求配置接口
 */
interface RequestConfig extends RequestOptions {
  /** 是否显示错误消息 */
  showError?: boolean;
  /** 是否显示成功消息 */
  showSuccess?: boolean;
  /** 自定义成功消息 */
  successMessage?: string;
  /** 自定义错误消息 */
  errorMessage?: string;
}

/**
 * HTTP状态码枚举
 */
export enum HttpStatus {
  OK = 200,
  CREATED = 201,
  NO_CONTENT = 204,
  BAD_REQUEST = 400,
  UNAUTHORIZED = 401,
  FORBIDDEN = 403,
  NOT_FOUND = 404,
  INTERNAL_SERVER_ERROR = 500,
}

/**
 * 统一的HTTP请求工具类
 */
class HttpClient {
  /**
   * 处理响应数据
   */
  private handleResponse<T>(
    response: ApiResponse<T>,
    config: RequestConfig,
  ): T {
    const { showSuccess = false, successMessage } = config;

    // 显示成功消息
    if (showSuccess) {
      const msg = successMessage || response.message || '操作成功';
      message.success(msg);
    }

    return response.data as T;
  }

  /**
   * 处理错误响应
   */
  private handleError(error: any, config: RequestConfig): never {
    const { showError = true, errorMessage } = config;
    let errorMsg = errorMessage || '请求失败';

    if (error?.response) {
      const { status, data } = error.response;
      const errorResponse = data as ErrorResponse;

      switch (status) {
        case HttpStatus.BAD_REQUEST:
          errorMsg = errorResponse?.message || '请求参数错误';
          if (errorResponse?.details?.length) {
            errorMsg = errorResponse.details.join(', ');
          }
          break;
        case HttpStatus.UNAUTHORIZED:
          errorMsg = '登录已过期，请重新登录';
          // 可以在这里处理登录跳转
          setTimeout(() => {
            window.location.href = '/login';
          }, 1000);
          break;
        case HttpStatus.FORBIDDEN:
          errorMsg = '没有权限访问该资源';
          break;
        case HttpStatus.NOT_FOUND:
          errorMsg = '请求的资源不存在';
          break;
        case HttpStatus.INTERNAL_SERVER_ERROR:
          errorMsg = '服务器内部错误';
          break;
        default:
          errorMsg = errorResponse?.message || `请求失败 (${status})`;
      }
    } else if (error?.message) {
      if (error.message.includes('Network Error')) {
        errorMsg = '网络连接失败，请检查网络';
      } else if (error.message.includes('timeout')) {
        errorMsg = '请求超时，请稍后重试';
      } else {
        errorMsg = error.message;
      }
    }

    // 显示错误消息
    if (showError) {
      message.error(errorMsg);
    }

    throw new Error(errorMsg);
  }

  /**
   * GET请求
   */
  async get<T = any>(
    url: string,
    params?: Record<string, any>,
    config: RequestConfig = {},
  ): Promise<T> {
    try {
      const response = await umiRequest<ApiResponse<T>>(url, {
        method: 'GET',
        params,
        ...config,
      });
      return this.handleResponse(response, config);
    } catch (error) {
      return this.handleError(error, config);
    }
  }

  /**
   * POST请求
   */
  async post<T = any>(
    url: string,
    data?: any,
    config: RequestConfig = {},
  ): Promise<T> {
    try {
      const response = await umiRequest<ApiResponse<T>>(url, {
        method: 'POST',
        data,
        ...config,
      });
      return this.handleResponse(response, config);
    } catch (error) {
      return this.handleError(error, config);
    }
  }

  /**
   * PUT请求
   */
  async put<T = any>(
    url: string,
    data?: any,
    config: RequestConfig = {},
  ): Promise<T> {
    try {
      const response = await umiRequest<ApiResponse<T>>(url, {
        method: 'PUT',
        data,
        ...config,
      });
      return this.handleResponse(response, config);
    } catch (error) {
      return this.handleError(error, config);
    }
  }

  /**
   * PATCH请求
   */
  async patch<T = any>(
    url: string,
    data?: any,
    config: RequestConfig = {},
  ): Promise<T> {
    try {
      const response = await umiRequest<ApiResponse<T>>(url, {
        method: 'PATCH',
        data,
        ...config,
      });
      return this.handleResponse(response, config);
    } catch (error) {
      return this.handleError(error, config);
    }
  }

  /**
   * DELETE请求
   */
  async delete<T = any>(
    url: string,
    params?: Record<string, any>,
    config: RequestConfig = {},
  ): Promise<T> {
    try {
      const response = await umiRequest<ApiResponse<T>>(url, {
        method: 'DELETE',
        params,
        ...config,
      });
      return this.handleResponse(response, config);
    } catch (error) {
      return this.handleError(error, config);
    }
  }

  /**
   * 上传文件
   */
  async upload<T = any>(
    url: string,
    file: File,
    config: RequestConfig = {},
  ): Promise<T> {
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await umiRequest<ApiResponse<T>>(url, {
        method: 'POST',
        data: formData,
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        ...config,
      });
      return this.handleResponse(response, config);
    } catch (error) {
      return this.handleError(error, config);
    }
  }
}

// 导出HTTP客户端实例
export const http = new HttpClient();

// 导出默认实例
export default http;
