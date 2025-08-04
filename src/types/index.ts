// 通用类型定义
export interface BaseEntity {
  id: string;
  createdAt: string;
  updatedAt: string;
}

// API响应类型
export interface ApiResponse<T = any> {
  /** 状态码 */
  code: number;
  /** 响应消息 */
  message: string;
  /** 响应数据 */
  data?: T;
  /** 时间戳 */
  timestamp: string;
  /** 请求路径 */
  path: string;
}

/**
 * 错误响应数据格式接口
 */
export interface ErrorResponse {
  /** 错误状态码 */
  code: number;
  /** 错误消息 */
  message: string;
  /** 错误详情 */
  error?: string;
  /** 验证错误详情 */
  details?: any[];
  /** 时间戳 */
  timestamp: string;
  /** 请求路径 */
  path: string;
}
