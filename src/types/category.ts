import type { BaseEntity, PaginationParams } from './common';

// 分类实体接口
export interface CategoryType extends BaseEntity {
  name: string;
  slug: string;
  description?: string;
  parentId?: string;
  parent?: CategoryType;
  children?: CategoryType[];
  sortOrder: number;
  isActive: boolean;
  articleCount: number;
}

// 创建分类Type
export interface CreateCategoryType {
  name: string;
  slug?: string;
  description?: string;
  parentId?: string;
  sortOrder?: number;
  isActive?: boolean;
}

// 更新分类Type
export interface UpdateCategoryType {
  name?: string;
  slug?: string;
  description?: string;
  parentId?: string;
  sortOrder?: number;
  isActive?: boolean;
}

// 分类查询Type
export interface CategoryQueryType extends PaginationParams {
  parentId?: string;
  isActive?: boolean;
}

// 分类统计接口
export interface CategoryStatsType {
  total: number;
  active: number;
  inactive: number;
  withArticles: number;
}

// 分类列表项类型（用于页面组件）
export interface CategoryItemType {
  id: string;
  name: string;
  slug: string;
  description?: string;
  parentId?: string;
  parent?: {
    id: string;
    name: string;
  };
  children?: CategoryItemType[];
  sortOrder: number;
  isActive: boolean;
  articleCount: number;
  createdAt: string;
  updatedAt: string;
}

// 分类表单数据类型（用于页面组件）
export interface CategoryFormDataType {
  name: string;
  slug?: string;
  description?: string;
  parentId?: string;
  sortOrder?: number;
  isActive?: boolean;
}
