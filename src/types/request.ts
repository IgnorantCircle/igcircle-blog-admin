import type { StandardError } from '@/utils';
import type { RequestOptions } from '@umijs/max';

// 请求配置接口
export interface RequestConfig extends RequestOptions {
  /** 是否显示错误消息 */
  showError?: boolean;
  /** 是否显示成功消息 */
  showSuccess?: boolean;
  /** 自定义成功消息 */
  successMessage?: string;
  /** 自定义错误消息 */
  errorMessage?: string;
  /** 是否启用自动参数过滤，默认为true */
  autoFilterParams?: boolean;
}

// 异步操作状态接口
export interface AsyncOperationState<T = any> {
  /** 数据 */
  data: T | null;
  /** 加载状态 */
  loading: boolean;
  /** 错误信息 */
  error: string | null;
  /** 是否已初始化 */
  initialized: boolean;
}

// API响应包装器
export interface ApiResponseWrapper<T = any> {
  /** 响应数据 */
  data: T | null;
  /** 是否成功 */
  success: boolean;
  /** 错误信息 */
  error: StandardError | null;
  /** 原始响应 */
  originalResponse?: any;
}

// 错误处理配置
export interface ErrorHandlingConfig {
  /** 是否显示错误消息 */
  showMessage?: boolean;
  /** 自定义错误消息 */
  customMessage?: string;
  /** 错误回调函数 */
  onError?: (error: StandardError) => void;
  /** 是否静默处理（不显示任何消息） */
  silent?: boolean;
  /** 是否自动重试 */
  autoRetry?: boolean;
  /** 重试次数 */
  retryCount?: number;
  /** 重试延迟（毫秒） */
  retryDelay?: number;
}
