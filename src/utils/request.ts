import type { ApiResponse, RequestConfig } from '@/types';
import { request as umiRequest } from '@umijs/max';
import { message } from 'antd';
import { HttpErrorHandler, type StandardError } from './errorHandler';
import { filterFormData, filterQueryParams } from './paramFilter';

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
   * HTTP客户端层统一处理网络错误、状态码错误
   */
  private handleError(error: any, config: RequestConfig): never {
    const { showError = true, errorMessage } = config;

    // 使用统一的错误处理器
    const standardError: StandardError =
      HttpErrorHandler.handleHttpError(error);

    // 如果有自定义错误消息，使用自定义消息
    if (errorMessage) {
      standardError.message = errorMessage;
    }

    // 显示错误消息（HTTP客户端层只处理网络层面的错误显示）
    if (showError) {
      message.error(standardError.message);
    }

    // 抛出标准化错误供上层处理
    const error_to_throw = new Error(standardError.message) as any;
    error_to_throw.standardError = standardError;
    throw error_to_throw;
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
      // 根据配置决定是否过滤空值参数
      const { autoFilterParams = true } = config;
      const finalParams =
        params && autoFilterParams ? filterQueryParams(params) : params;

      const response = await umiRequest<ApiResponse<T>>(url, {
        method: 'GET',
        params: finalParams,
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
      // 根据配置决定是否过滤空值参数（仅对普通对象进行过滤，FormData等特殊对象不处理）
      const { autoFilterParams = true } = config;
      const shouldFilter =
        autoFilterParams &&
        data &&
        typeof data === 'object' &&
        !(data instanceof FormData) &&
        !Array.isArray(data);
      const finalData = shouldFilter ? filterFormData(data) : data;

      const response = await umiRequest<ApiResponse<T>>(url, {
        method: 'POST',
        data: finalData,
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
      // 根据配置决定是否过滤空值参数（仅对普通对象进行过滤，FormData等特殊对象不处理）
      const { autoFilterParams = true } = config;
      const shouldFilter =
        autoFilterParams &&
        data &&
        typeof data === 'object' &&
        !(data instanceof FormData) &&
        !Array.isArray(data);
      const finalData = shouldFilter ? filterFormData(data) : data;

      const response = await umiRequest<ApiResponse<T>>(url, {
        method: 'PUT',
        data: finalData,
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
      // 根据配置决定是否过滤空值参数（仅对普通对象进行过滤，FormData等特殊对象不处理）
      const { autoFilterParams = true } = config;
      const shouldFilter =
        autoFilterParams &&
        data &&
        typeof data === 'object' &&
        !(data instanceof FormData) &&
        !Array.isArray(data);
      const finalData = shouldFilter ? filterFormData(data) : data;

      const response = await umiRequest<ApiResponse<T>>(url, {
        method: 'PATCH',
        data: finalData,
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
      // 检查是否有data字段，如果有则作为请求体发送
      const hasData = params && 'data' in params;

      if (hasData) {
        const { data, ...queryParams } = params;
        const response = await umiRequest<ApiResponse<T>>(url, {
          method: 'DELETE',
          data: data,
          params: queryParams,
          ...config,
        });
        return this.handleResponse(response, config);
      } else {
        // 根据配置决定是否过滤空值参数
        const { autoFilterParams = true } = config;
        const finalParams =
          params && autoFilterParams ? filterQueryParams(params) : params;

        const response = await umiRequest<ApiResponse<T>>(url, {
          method: 'DELETE',
          params: finalParams,
          ...config,
        });
        return this.handleResponse(response, config);
      }
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
