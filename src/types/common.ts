// 基础实体接口
export interface BaseEntity {
  id: string;
  createdAt: string;
  updatedAt: string;
}

// 分页参数接口
export interface PaginationParams {
  page?: number;
  limit?: number;
  search?: string;
  keyword?: string;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
}

// 分页响应接口
export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

// 统一API响应接口
export interface ApiResponse<T = any> {
  code: number;
  message: string;
  data?: T;
  timestamp: string;
  path: string;
}

// 错误响应接口
export interface ErrorResponse {
  code: number;
  message: string;
  error?: string;
  details?: any[];
  timestamp: string;
  path: string;
}

// 批量删除接口
export interface BatchDeleteDto {
  ids: string[];
}

// HTTP状态码枚举
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
