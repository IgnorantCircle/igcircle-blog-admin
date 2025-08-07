import type { BaseEntity, PaginationParams } from './common';

// 标签实体接口
export interface Tag extends BaseEntity {
  name: string;
  slug: string;
  description?: string;
  color?: string;
  isActive: boolean;
  articleCount: number;
}

// 创建标签DTO
export interface CreateTagDto {
  name: string;
  slug?: string;
  description?: string;
  color?: string;
  isActive?: boolean;
}

// 更新标签DTO
export interface UpdateTagDto {
  name?: string;
  slug?: string;
  description?: string;
  color?: string;
  isActive?: boolean;
}

// 标签查询DTO
export interface TagQueryDto extends PaginationParams {
  isActive?: boolean;
}

// 热门标签查询DTO
export interface PopularTagsDto {
  limit?: number;
  minArticleCount?: number;
}

// 标签统计接口
export interface TagStats {
  total: number;
  visible: number;
  hidden: number;
  popular: number;
}

// 标签表单数据类型（用于页面组件）
export type TagFormData = CreateTagDto & UpdateTagDto;
