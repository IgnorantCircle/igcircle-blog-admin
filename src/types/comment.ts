import type { Article } from './article';
import type { BaseEntity, PaginationParams } from './common';
import type { User } from './user';

// 评论实体接口
export interface Comment extends BaseEntity {
  id: string;
  content: string;
  likeCount: number;
  replyCount: number;
  status: 'active' | 'hidden' | 'deleted';
  isTop: boolean;
  adminNote?: string;
  parentId?: string;
  parent?: Comment;
  replies?: Comment[];
  articleId: string;
  article?: Article;
  authorId: string;
  author: User;
  ipAddress?: string;
  userAgent?: string;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string;
}

// 创建评论DTO
export interface CreateCommentDto {
  content: string;
  articleId: string;
  parentId?: string;
}

// 更新评论DTO
export interface UpdateCommentDto {
  content: string;
}

// 管理员更新评论DTO
export interface AdminUpdateCommentDto extends UpdateCommentDto {
  status?: 'active' | 'hidden' | 'deleted';
  isTop?: boolean;
  adminNote?: string;
}

// 评论查询DTO
export interface CommentQueryDto extends PaginationParams {
  articleId?: string;
  authorId?: string;
  status?: 'active' | 'hidden' | 'deleted';
  parentId?: string;
  topLevelOnly?: boolean;
}

// 评论统计接口
export interface CommentStats {
  total: number;
  active: number;
  hidden: number;
  deleted: number;
  topLevel: number;
  replies: number;
  recentComments: Comment[];
}

// 评论列表项类型（用于页面组件）
export type CommentItem = Comment;
