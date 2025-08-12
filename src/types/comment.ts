import type { ArticleType } from './article';
import type { BaseEntity, PaginationParams } from './common';
import type { UserType } from './user';

// 评论实体接口
export interface CommentType extends BaseEntity {
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
  article?: ArticleType;
  authorId: string;
  author: UserType;
  ipAddress?: string;
  userAgent?: string;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string;
}

// 创建评论
export interface CreateCommentType {
  id: string;
  content: string;
  articleId: string;
  parentId?: string;
}

// 更新评论
export interface UpdateCommentType {
  id: string;
  content: string;
}

// 管理员更新评论
export interface AdminUpdateCommentType extends UpdateCommentType {
  status?: 'active' | 'hidden' | 'deleted';
  isTop?: boolean;
  adminNote?: string;
}

// 评论查询
export interface CommentQueryType extends PaginationParams {
  articleId?: string;
  authorId?: string;
  status?: 'active' | 'hidden' | 'deleted';
  parentId?: string;
  topLevelOnly?: boolean;
}

// 评论统计接口
export interface CommentStatsType {
  total: number;
  active: number;
  hidden: number;
  deleted: number;
  topLevel: number;
  replies: number;
  recentComments: Comment[];
}
