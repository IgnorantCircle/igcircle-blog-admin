import { useState, useCallback, useRef, useEffect } from 'react';
import { useErrorHandler, type ErrorHandlerOptions } from './useErrorHandler';

/**
 * 异步状态接口
 */
export interface AsyncState<T> {
  /** 数据 */
  data: T | null;
  /** 加载状态 */
  loading: boolean;
  /** 错误信息 */
  error: string | null;
  /** 是否已初始化 */
  initialized: boolean;
}

/**
 * 异步操作配置
 */
export interface AsyncOptions extends ErrorHandlerOptions {
  /** 是否立即执行 */
  immediate?: boolean;
  /** 成功回调 */
  onSuccess?: (data: any) => void;
  /** 成功消息 */
  successMessage?: string;
  /** 是否显示成功消息 */
  showSuccessMessage?: boolean;
}

/**
 * 通用异步状态管理Hook
 * Hook层处理业务逻辑错误、状态管理
 */
export const useAsyncState = <T = any>(
  asyncFn?: () => Promise<T>,
  options?: AsyncOptions
) => {
  const {
    immediate = false,
    onSuccess,
    successMessage,
    showSuccessMessage = false,
    ...errorOptions
  } = options || {};

  const { handleAsyncError, showSuccess } = useErrorHandler();
  const [state, setState] = useState<AsyncState<T>>({
    data: null,
    loading: false,
    error: null,
    initialized: false,
  });

  // 用于取消已经不需要的请求
  const cancelRef = useRef<boolean>(false);

  /**
   * 执行异步操作
   */
  const execute = useCallback(
    async (customAsyncFn?: () => Promise<T>) => {
      const fn = customAsyncFn || asyncFn;
      if (!fn) {
        console.warn('useAsyncState: No async function provided');
        return null;
      }

      // 重置取消标志
      cancelRef.current = false;

      setState(prev => ({
        ...prev,
        loading: true,
        error: null,
      }));

      const result = await handleAsyncError(fn, {
        ...errorOptions,
        onError: (error) => {
          if (!cancelRef.current) {
            setState(prev => ({
              ...prev,
              loading: false,
              error: error.message,
              initialized: true,
            }));
          }
          errorOptions.onError?.(error);
        },
      });

      if (!cancelRef.current) {
        if (result !== null) {
          setState(prev => ({
            ...prev,
            data: result,
            loading: false,
            error: null,
            initialized: true,
          }));

          // 显示成功消息
          if (showSuccessMessage && successMessage) {
            showSuccess(successMessage);
          }

          // 执行成功回调
          onSuccess?.(result);
        } else {
          setState(prev => ({
            ...prev,
            loading: false,
            initialized: true,
          }));
        }
      }

      return result;
    },
    [asyncFn, handleAsyncError, errorOptions, onSuccess, successMessage, showSuccessMessage, showSuccess]
  );

  /**
   * 重置状态
   */
  const reset = useCallback(() => {
    cancelRef.current = true;
    setState({
      data: null,
      loading: false,
      error: null,
      initialized: false,
    });
  }, []);

  /**
   * 设置数据
   */
  const setData = useCallback((data: T | null) => {
    setState(prev => ({
      ...prev,
      data,
      error: null,
    }));
  }, []);

  /**
   * 设置错误
   */
  const setError = useCallback((error: string | null) => {
    setState(prev => ({
      ...prev,
      error,
    }));
  }, []);

  /**
   * 取消操作
   */
  const cancel = useCallback(() => {
    cancelRef.current = true;
    setState(prev => ({
      ...prev,
      loading: false,
    }));
  }, []);

  // 立即执行
  useEffect(() => {
    if (immediate && asyncFn) {
      execute();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [immediate]);

  // 组件卸载时取消操作
  useEffect(() => {
    return () => {
      cancelRef.current = true;
    };
  }, []);

  return {
    ...state,
    execute,
    reset,
    setData,
    setError,
    cancel,
    // 便捷方法
    refresh: execute,
    isLoading: state.loading,
    hasError: !!state.error,
    hasData: !!state.data,
  };
};

export default useAsyncState;