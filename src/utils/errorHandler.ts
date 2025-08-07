import { message } from 'antd';
import type { ErrorResponse } from '@/types';

/**
 * 错误类型枚举
 */
export enum ErrorType {
  NETWORK = 'NETWORK',
  HTTP = 'HTTP',
  BUSINESS = 'BUSINESS',
  VALIDATION = 'VALIDATION',
  UNKNOWN = 'UNKNOWN',
}

/**
 * 标准化错误接口
 */
export interface StandardError {
  type: ErrorType;
  code: string | number;
  message: string;
  details?: any;
  originalError?: any;
}

/**
 * HTTP客户端层错误处理器
 * 统一处理网络错误、状态码错误
 */
export class HttpErrorHandler {
  /**
   * 处理HTTP响应错误
   */
  static handleHttpError(error: any): StandardError {
    let standardError: StandardError;

    if (error.response) {
      // HTTP状态码错误
      const { status, data } = error.response;
      const errorResponse = data as ErrorResponse;

      standardError = {
        type: ErrorType.HTTP,
        code: status,
        message: this.getHttpErrorMessage(status, errorResponse),
        details: errorResponse?.details,
        originalError: error,
      };

      // 特殊处理401错误
      if (status === 401) {
        this.handleUnauthorized();
      }
    } else if (error.request) {
      // 网络错误
      standardError = {
        type: ErrorType.NETWORK,
        code: 'NETWORK_ERROR',
        message: this.getNetworkErrorMessage(error),
        originalError: error,
      };
    } else {
      // 其他错误
      standardError = {
        type: ErrorType.UNKNOWN,
        code: 'UNKNOWN_ERROR',
        message: error.message || '未知错误',
        originalError: error,
      };
    }

    return standardError;
  }

  /**
   * 获取HTTP错误消息
   */
  private static getHttpErrorMessage(status: number, errorResponse?: ErrorResponse): string {
    if (errorResponse?.message) {
      return errorResponse.message;
    }

    switch (status) {
      case 400:
        return '请求参数错误';
      case 401:
        return '登录已过期，请重新登录';
      case 403:
        return '没有权限访问该资源';
      case 404:
        return '请求的资源不存在';
      case 422:
        return '数据验证失败';
      case 429:
        return '请求过于频繁，请稍后重试';
      case 500:
        return '服务器内部错误';
      case 502:
        return '网关错误';
      case 503:
        return '服务暂时不可用';
      case 504:
        return '网关超时';
      default:
        return `请求失败 (${status})`;
    }
  }

  /**
   * 获取网络错误消息
   */
  private static getNetworkErrorMessage(error: any): string {
    if (error.message) {
      if (error.message.includes('Network Error')) {
        return '网络连接失败，请检查网络';
      }
      if (error.message.includes('timeout')) {
        return '请求超时，请稍后重试';
      }
      if (error.message.includes('ECONNREFUSED')) {
        return '连接被拒绝，服务器可能未启动';
      }
    }
    return '网络连接失败';
  }

  /**
   * 处理401未授权错误
   */
  private static handleUnauthorized(): void {
    // 清除本地存储的认证信息
    localStorage.removeItem('token');
    localStorage.removeItem('userInfo');
    
    // 延迟跳转到登录页，避免立即跳转导致的用户体验问题
    setTimeout(() => {
      window.location.href = '/login';
    }, 1000);
  }
}

/**
 * 业务错误处理器
 * 用于Hook层处理业务逻辑错误
 */
export class BusinessErrorHandler {
  /**
   * 处理业务错误
   */
  static handleBusinessError(error: StandardError, options?: {
    showMessage?: boolean;
    customMessage?: string;
  }): void {
    const { showMessage = true, customMessage } = options || {};
    
    if (showMessage) {
      const errorMessage = customMessage || error.message;
      message.error(errorMessage);
    }
  }

  /**
   * 处理验证错误
   */
  static handleValidationError(error: StandardError, options?: {
    showMessage?: boolean;
  }): void {
    const { showMessage = true } = options || {};
    
    if (showMessage && error.details) {
      if (Array.isArray(error.details)) {
        error.details.forEach((detail: string) => {
          message.error(detail);
        });
      } else {
        message.error(error.message);
      }
    }
  }
}

/**
 * 错误工具函数
 */
export class ErrorUtils {
  /**
   * 判断是否为网络错误
   */
  static isNetworkError(error: StandardError): boolean {
    return error.type === ErrorType.NETWORK;
  }

  /**
   * 判断是否为HTTP错误
   */
  static isHttpError(error: StandardError): boolean {
    return error.type === ErrorType.HTTP;
  }

  /**
   * 判断是否为业务错误
   */
  static isBusinessError(error: StandardError): boolean {
    return error.type === ErrorType.BUSINESS;
  }

  /**
   * 判断是否为验证错误
   */
  static isValidationError(error: StandardError): boolean {
    return error.type === ErrorType.VALIDATION;
  }

  /**
   * 判断是否为401错误
   */
  static isUnauthorizedError(error: StandardError): boolean {
    return error.type === ErrorType.HTTP && error.code === 401;
  }

  /**
   * 判断是否为403错误
   */
  static isForbiddenError(error: StandardError): boolean {
    return error.type === ErrorType.HTTP && error.code === 403;
  }

  /**
   * 判断是否为404错误
   */
  static isNotFoundError(error: StandardError): boolean {
    return error.type === ErrorType.HTTP && error.code === 404;
  }

  /**
   * 判断是否为服务器错误
   */
  static isServerError(error: StandardError): boolean {
    return error.type === ErrorType.HTTP && 
           typeof error.code === 'number' && 
           error.code >= 500;
  }
}