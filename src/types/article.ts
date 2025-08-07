import type { Category } from './category';
import type { BaseEntity, PaginationParams } from './common';
import type { Tag } from './tag';
import type { User } from './user';

// 文章实体接口
export interface Article extends BaseEntity {
  title: string;
  content: string;
  summary?: string;
  slug: string;
  status: 'draft' | 'published' | 'archived';
  publishedAt?: string;
  coverImage?: string;
  viewCount: number;
  likeCount: number;
  commentCount: number;
  shareCount: number;
  readingTime?: number;
  isTop: boolean;
  isFeatured: boolean;
  isVisible: boolean;
  weight: number;
  allowComment: boolean;
  metaDescription?: string;
  metaKeywords?: string[];
  socialImage?: string;
  viewHistory?: { date: string; count: number }[];
  tags?: Tag[];
  category?: Category;
  categoryId?: string;
  author: User;
  authorId: string;
}

// 创建文章DTO
export interface CreateArticleDto {
  title: string;
  content: string;
  summary?: string;
  slug?: string;
  coverImage?: string;
  categoryId?: string;
  tagIds?: string[];
  metaDescription?: string;
  metaKeywords?: string[];
  socialImage?: string;
  isFeatured?: boolean;
  isTop?: boolean;
  weight?: number;
  allowComment?: boolean;
}

// 更新文章DTO
export interface UpdateArticleDto {
  title?: string;
  content?: string;
  summary?: string;
  slug?: string;
  coverImage?: string;
  categoryId?: string;
  tagIds?: string[];
  metaDescription?: string;
  metaKeywords?: string[];
  socialImage?: string;
  isFeatured?: boolean;
  isTop?: boolean;
  weight?: number;
  readingTime?: number;
  allowComment?: boolean;
}

// 文章查询DTO
export interface ArticleQueryDto extends PaginationParams {
  status?: 'draft' | 'published' | 'archived';
  authorId?: string;
  categoryId?: string;
  tagId?: string;
  isFeatured?: boolean;
  isTop?: boolean;
  startDate?: string;
  endDate?: string;
  includeTags?: boolean;
  includeCategory?: boolean;
}

// 发布文章DTO
export interface PublishArticleDto {
  publishedAt?: string;
}

// 文章统计接口
export interface ArticleStats {
  total: number;
  published: number;
  draft: number;
  archived: number;
  totalViews: number;
  totalLikes: number;
  totalComments: number;
  totalShares: number;
  featuredCount: number;
  topCount: number;
  recentArticles: Article[];
  popularArticles: Article[];
  categoryStats: { name: string; count: number; percentage: number }[];
  tagStats: { name: string; count: number; percentage: number }[];
  monthlyStats: { month: string; articles: number; views: number }[];
}

// 文章项类型（用于列表显示）
export type ArticleItem = Article;

// 文章导入相关类型
export interface ArticleImportConfigDto {
  /** 默认分类名称 */
  defaultCategory?: string;
  /** 默认标签列表 */
  defaultTags?: string[];
  /** 是否自动发布 */
  autoPublish?: boolean;
  /** 是否覆盖已存在的文章（基于slug） */
  overwriteExisting?: boolean;
  /** 导入模式 */
  importMode?: 'strict' | 'loose';
  /** 是否跳过无效文件 */
  skipInvalidFiles?: boolean;
}

export interface ImportProgressDto {
  /** 任务ID */
  taskId: string;
  /** 导入状态 */
  status: ImportTaskStatus;
  /** 总文件数 */
  totalFiles: number;
  /** 已处理文件数 */
  processedFiles: number;
  /** 成功导入数 */
  successCount: number;
  /** 失败数 */
  failureCount: number;
  /** 跳过数 */
  skippedCount: number;
  /** 当前处理的文件名 */
  currentFile?: string;
  /** 进度百分比 (0-100) */
  progress: number;
  /** 开始时间 */
  startTime: number;
  /** 预计剩余时间（毫秒） */
  estimatedTimeRemaining?: number;
  /** 错误信息（失败时） */
  error?: string;
  /** 详细结果（完成时） */
  results?: ArticleImportResultDto[];
}

export interface ArticleImportResultDto {
  /** 文件路径 */
  filePath: string;
  /** 是否成功 */
  success: boolean;
  /** 是否跳过 */
  skipped?: boolean;
  /** 文章ID（成功时） */
  articleId?: string;
  /** 文章标题 */
  title?: string;
  /** 错误信息（失败时） */
  error?: string;
  /** 警告信息 */
  warnings?: string[];
}

export interface ArticleImportResponseDto {
  /** 总文件数 */
  totalFiles: number;
  /** 成功导入数 */
  successCount: number;
  /** 失败数 */
  failureCount: number;
  /** 跳过数 */
  skippedCount: number;
  /** 详细结果 */
  results: ArticleImportResultDto[];
  /** 导入开始时间 */
  startTime: number;
  /** 导入结束时间 */
  endTime: number;
  /** 耗时（毫秒） */
  duration: number;
}

export interface ArticleImportTaskResponse {
  /** 任务ID */
  taskId: string;
}

export interface StartImportResponseDto {
  /** 任务ID */
  taskId: string;
  /** 导入状态 */
  status: ImportTaskStatus;
  /** 总文件数 */
  totalFiles: number;
  /** 消息 */
  message: string;
}

export interface ImportFileItem {
  /** 文件对象 */
  file: File;
  /** 唯一标识 */
  uid: string;
  /** 文件名 */
  name: string;
  /** 文件大小 */
  size: number;
  /** 上传状态 */
  status: 'uploading' | 'done' | 'error' | 'removed';
  /** 错误信息 */
  error?: string;
}

// 导入任务状态
export type ImportTaskStatus =
  | 'pending'
  | 'processing'
  | 'completed'
  | 'failed';

// 导入任务状态枚举
export enum ImportTaskStatusEnum {
  PENDING = 'pending',
  PROCESSING = 'processing',
  COMPLETED = 'completed',
  FAILED = 'failed',
}

// 导入状态文本映射
export const IMPORT_STATUS_TEXTS: Record<ImportTaskStatus, string> = {
  pending: '等待中',
  processing: '处理中',
  completed: '已完成',
  failed: '失败',
} as const;

// 导入状态颜色映射
export const IMPORT_STATUS_COLORS: Record<ImportTaskStatus, string> = {
  pending: 'orange',
  processing: 'blue',
  completed: 'green',
  failed: 'red',
} as const;
