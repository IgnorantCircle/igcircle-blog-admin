import type {
  Article,
  ArticleQueryDto,
  ArticleStats,
  CreateArticleDto,
  PaginatedResponse,
  PublishArticleDto,
  UpdateArticleDto,
} from '@/types';
import { http } from '@/utils/request';

// 文章相关API
export const articleAPI = {
  // 获取文章列表（包含所有状态）
  getArticles: (
    params?: ArticleQueryDto,
  ): Promise<PaginatedResponse<Article>> => {
    return http.get('/admin/articles', params);
  },

  // 获取草稿文章
  getDrafts: (
    params?: ArticleQueryDto,
  ): Promise<PaginatedResponse<Article>> => {
    return http.get('/admin/articles/drafts', params);
  },

  // 获取已发布文章
  getPublished: (
    params?: ArticleQueryDto,
  ): Promise<PaginatedResponse<Article>> => {
    return http.get('/admin/articles/published', params);
  },

  // 获取归档文章
  getArchived: (
    params?: ArticleQueryDto,
  ): Promise<PaginatedResponse<Article>> => {
    return http.get('/admin/articles/archived', params);
  },

  // 获取文章统计信息
  getStatistics: (params?: ArticleQueryDto): Promise<ArticleStats> => {
    return http.get('/admin/articles/stats', params);
  },

  // 获取文章详情
  getArticle: (id: string): Promise<Article> => {
    return http.get(`/admin/articles/${id}`);
  },

  // 创建文章
  createArticle: (data: CreateArticleDto): Promise<Article> => {
    return http.post('/admin/articles', data);
  },

  // 更新文章
  updateArticle: (id: string, data: UpdateArticleDto): Promise<Article> => {
    return http.put(`/admin/articles/${id}`, data);
  },

  // 发布文章
  publishArticle: (id: string, data?: PublishArticleDto): Promise<Article> => {
    return http.put(`/admin/articles/${id}/publish`, data || {});
  },

  // 取消发布文章
  unpublishArticle: (id: string): Promise<Article> => {
    return http.put(`/admin/articles/${id}/unpublish`);
  },

  // 归档文章
  archiveArticle: (id: string): Promise<Article> => {
    return http.put(`/admin/articles/${id}/archive`);
  },

  // 切换精选状态
  toggleFeatured: (id: string): Promise<Article> => {
    return http.put(`/admin/articles/${id}/feature`);
  },

  // 切换置顶状态
  toggleTop: (id: string): Promise<Article> => {
    return http.put(`/admin/articles/${id}/top`);
  },

  // 删除文章
  deleteArticle: (id: string): Promise<void> => {
    return http.delete(`/admin/articles/${id}`);
  },

  // 批量删除文章
  batchDeleteArticles: (ids: string[]): Promise<void> => {
    return http.delete('/admin/articles/batch', { ids });
  },
};
