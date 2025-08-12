import { BusinessErrorHandler, ErrorUtils, type StandardError } from '@/utils';
import { message } from 'antd';
import { useCallback } from 'react';

/**
 * 错误处理配置
 */
export interface ErrorHandlerOptions {
  /** 是否显示错误消息 */
  showMessage?: boolean;
  /** 自定义错误消息 */
  customMessage?: string;
  /** 错误回调函数 */
  onError?: (error: StandardError) => void;
  /** 是否静默处理（不显示任何消息） */
  silent?: boolean;
}

/**
 * Hook层错误处理器
 * 处理业务逻辑错误、状态管理
 */
export const useErrorHandler = () => {
  /**
   * 处理错误的通用方法
   */
  const handleError = useCallback(
    (error: any, options?: ErrorHandlerOptions) => {
      const {
        showMessage = true,
        customMessage,
        onError,
        silent = false,
      } = options || {};

      let standardError: StandardError;

      // 检查是否已经是标准化错误
      if (error?.standardError) {
        standardError = error.standardError;
      } else {
        // 转换为标准化错误
        standardError = {
          type: 'BUSINESS' as any,
          code: 'BUSINESS_ERROR',
          message: error?.message || '操作失败',
          originalError: error,
        };
      }

      // 静默模式下不显示任何消息
      if (silent) {
        onError?.(standardError);
        return standardError;
      }

      // 根据错误类型进行不同处理
      if (ErrorUtils.isNetworkError(standardError)) {
        // 网络错误已在HTTP客户端层处理，这里只执行回调
        onError?.(standardError);
      } else if (ErrorUtils.isHttpError(standardError)) {
        // HTTP错误已在HTTP客户端层处理，这里只执行回调
        onError?.(standardError);
      } else if (ErrorUtils.isValidationError(standardError)) {
        // 验证错误特殊处理
        BusinessErrorHandler.handleValidationError(standardError, {
          showMessage,
        });
        onError?.(standardError);
      } else {
        // 业务逻辑错误
        BusinessErrorHandler.handleBusinessError(standardError, {
          showMessage,
          customMessage,
        });
        onError?.(standardError);
      }

      return standardError;
    },
    [],
  );

  /**
   * 处理异步操作错误
   */
  const handleAsyncError = useCallback(
    async <T>(
      asyncFn: () => Promise<T>,
      options?: ErrorHandlerOptions,
    ): Promise<T | null> => {
      try {
        return await asyncFn();
      } catch (error) {
        handleError(error, options);
        return null;
      }
    },
    [handleError],
  );

  /**
   * 创建错误边界处理器
   */
  const createErrorBoundary = useCallback(
    (options?: ErrorHandlerOptions) => {
      return (error: any) => {
        handleError(error, options);
      };
    },
    [handleError],
  );

  /**
   * 显示成功消息
   */
  const showSuccess = useCallback((msg: string) => {
    message.success(msg);
  }, []);

  /**
   * 显示警告消息
   */
  const showWarning = useCallback((msg: string) => {
    message.warning(msg);
  }, []);

  /**
   * 显示信息消息
   */
  const showInfo = useCallback((msg: string) => {
    message.info(msg);
  }, []);

  return {
    handleError,
    handleAsyncError,
    createErrorBoundary,
    showSuccess,
    showWarning,
    showInfo,
  };
};

export default useErrorHandler;
