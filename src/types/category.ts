import type { BaseEntity, PaginationParams } from './common';

// 分类实体接口
export interface Category extends BaseEntity {
  name: string;
  slug: string;
  description?: string;
  parentId?: string;
  parent?: Category;
  children?: Category[];
  sortOrder: number;
  isActive: boolean;
  articleCount: number;
}

// 创建分类DTO
export interface CreateCategoryDto {
  name: string;
  slug?: string;
  description?: string;
  parentId?: string;
  sortOrder?: number;
  isActive?: boolean;
}

// 更新分类DTO
export interface UpdateCategoryDto {
  name?: string;
  slug?: string;
  description?: string;
  parentId?: string;
  sortOrder?: number;
  isActive?: boolean;
}

// 分类查询DTO
export interface CategoryQueryDto extends PaginationParams {
  parentId?: string;
  isActive?: boolean;
}

// 分类统计接口
export interface CategoryStats {
  total: number;
  active: number;
  inactive: number;
  withArticles: number;
}

// 分类列表项类型（用于页面组件）
export interface CategoryItem {
  id: string;
  name: string;
  slug: string;
  description?: string;
  parentId?: string;
  parent?: {
    id: string;
    name: string;
  };
  children?: CategoryItem[];
  sortOrder: number;
  isActive: boolean;
  articleCount: number;
  createdAt: string;
  updatedAt: string;
}

// 分类表单数据类型（用于页面组件）
export interface CategoryFormData {
  name: string;
  slug?: string;
  description?: string;
  parentId?: string;
  sortOrder?: number;
  isActive?: boolean;
}
