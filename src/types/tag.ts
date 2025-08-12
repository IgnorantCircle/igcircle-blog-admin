import type { BaseEntity, PaginationParams } from './common';

// 标签实体接口
export interface TagType extends BaseEntity {
  name: string;
  slug: string;
  description?: string;
  color?: string;
  isActive: boolean;
  articleCount: number;
}

// 创建标签
export interface CreateTagType {
  name: string;
  slug?: string;
  description?: string;
  color?: string;
  isActive?: boolean;
}

// 更新标签
export interface UpdateTagType {
  name?: string;
  slug?: string;
  description?: string;
  color?: string;
  isActive?: boolean;
}

// 标签查询
export interface TagQueryType extends PaginationParams {
  isActive?: boolean;
}

// 热门标签查询
export interface PopularTagsType {
  limit?: number;
  minArticleCount?: number;
}

// 标签统计接口
export interface TagStatsType {
  total: number;
  visible: number;
  hidden: number;
  popular: number;
}

// 标签表单数据类型（用于页面组件）
export type TagFormDataType = CreateTagType & UpdateTagType;
