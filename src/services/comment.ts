import type {
  AdminUpdateCommentType,
  CommentQueryType,
  CommentStatsType,
  CommentType,
  CreateCommentType,
  PaginatedResponse,
} from '@/types';
import { http } from '@/utils';

export const commentAPI = {
  // 获取评论列表（管理员）
  getComments: (
    params?: CommentQueryType,
  ): Promise<PaginatedResponse<CommentType>> => {
    return http.get('/admin/comments', params);
  },

  // 获取评论详情
  getComment: (id: string): Promise<CommentType> => {
    return http.get(`/admin/comments/${id}`);
  },

  // 创建评论（管理员）
  createComment: (data: CreateCommentType): Promise<CommentType> => {
    return http.post('/admin/comments', data);
  },

  // 更新评论（管理员）
  updateComment: (
    id: string,
    data: AdminUpdateCommentType,
  ): Promise<CommentType> => {
    return http.put(`/admin/comments/${id}`, data);
  },

  // 删除评论
  deleteComment: (id: string): Promise<void> => {
    return http.delete(`/admin/comments/${id}`);
  },

  // 批量删除评论
  batchDeleteComments: (data: { ids: string[] }): Promise<void> => {
    return http.post('/admin/comments/batch-delete', { commentIds: data.ids });
  },

  // 审核评论（通过/拒绝）
  approveComment: (id: string): Promise<CommentType> => {
    return http.put(`/admin/comments/${id}/approve`);
  },

  rejectComment: (id: string): Promise<CommentType> => {
    return http.put(`/admin/comments/${id}/reject`);
  },

  // 置顶/取消置顶评论
  toggleTopComment: (id: string): Promise<CommentType> => {
    return http.put(`/admin/comments/${id}/top`);
  },

  // 隐藏/显示评论
  toggleHideComment: (id: string): Promise<CommentType> => {
    return http.put(`/admin/comments/${id}/hide`);
  },

  // 获取评论统计
  getCommentStats: (): Promise<CommentStatsType> => {
    return http.get('/admin/comments/stats');
  },

  // 获取文章的评论列表
  getArticleComments: (
    articleId: string,
    params?: CommentQueryType,
  ): Promise<PaginatedResponse<CommentType>> => {
    return http.get(`/admin/articles/${articleId}/comments`, params);
  },

  // 获取用户的评论列表
  getUserComments: (
    userId: string,
    params?: CommentQueryType,
  ): Promise<PaginatedResponse<CommentType>> => {
    return http.get(`/admin/users/${userId}/comments`, params);
  },
};
