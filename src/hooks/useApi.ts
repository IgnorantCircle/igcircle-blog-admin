import { useCallback } from 'react';
import { useAsyncState, type AsyncOptions } from './useAsyncState';

/**
 * API请求配置
 */
export interface ApiOptions extends AsyncOptions {
  /** 是否自动重试 */
  autoRetry?: boolean;
  /** 重试次数 */
  retryCount?: number;
  /** 重试延迟（毫秒） */
  retryDelay?: number;
}

/**
 * API请求Hook
 * 专门用于处理API请求的状态管理
 */
export const useApi = <T = any>(
  apiFunction?: (...args: any[]) => Promise<T>,
  options?: ApiOptions
) => {
  const {
    autoRetry = false,
    retryCount = 3,
    retryDelay = 1000,
    ...asyncOptions
  } = options || {};

  /**
   * 带重试机制的API调用
   */
  const executeWithRetry = useCallback(
    async (fn: () => Promise<any>, currentRetry = 0): Promise<any> => {
      try {
        return await fn();
      } catch (error) {
        if (autoRetry && currentRetry < retryCount) {
          // 延迟后重试
          await new Promise(resolve => setTimeout(resolve, retryDelay));
          return executeWithRetry(fn, currentRetry + 1);
        }
        throw error;
      }
    },
    [autoRetry, retryCount, retryDelay]
  );

  const asyncState = useAsyncState<T>(undefined, asyncOptions);

  /**
   * 执行API请求
   */
  const request = useCallback(
    async (...args: any[]) => {
      if (!apiFunction) {
        console.warn('useApi: No API function provided');
        return null;
      }

      const apiCall = () => apiFunction(...args);
      
      return asyncState.execute(() => executeWithRetry(apiCall));
    },
    [apiFunction, asyncState.execute, executeWithRetry]
  );

  /**
   * 执行自定义API请求
   */
  const customRequest = useCallback(
    async <R = any>(customApiFunction: (...args: any[]) => Promise<R>, ...args: any[]) => {
      const apiCall = () => customApiFunction(...args);
      
      return asyncState.execute(() => executeWithRetry(apiCall)) as Promise<R>;
    },
    [asyncState.execute, executeWithRetry]
  );

  return {
    ...asyncState,
    request,
    customRequest,
    // 别名
    call: request,
    fetch: request,
  };
};

/**
 * 创建API Hook的工厂函数
 */
export const createApiHook = <T = any>(
  apiFunction: (...args: any[]) => Promise<T>,
  defaultOptions?: ApiOptions
) => {
  return (options?: ApiOptions) => {
    const mergedOptions = { ...defaultOptions, ...options };
    return useApi(apiFunction, mergedOptions);
  };
};

/**
 * 批量API请求Hook
 */
export const useBatchApi = <T = any>(options?: ApiOptions) => {
  const asyncState = useAsyncState<T[]>(undefined, options);

  /**
   * 并行执行多个API请求
   */
  const batchRequest = useCallback(
    async (apiCalls: (() => Promise<any>)[]) => {
      return asyncState.execute(async () => {
        const results = await Promise.all(apiCalls.map(call => call()));
        return results;
      });
    },
    [asyncState.execute]
  );

  /**
   * 串行执行多个API请求
   */
  const sequentialRequest = useCallback(
    async (apiCalls: (() => Promise<any>)[]) => {
      return asyncState.execute(async () => {
        const results: any[] = [];
        
        for (let i = 0; i < apiCalls.length; i++) {
          const result = await apiCalls[i]();
          results.push(result);
        }
        
        return results;
      });
    },
    [asyncState.execute]
  );

  return {
    ...asyncState,
    batchRequest,
    sequentialRequest,
  };
};

export default useApi;