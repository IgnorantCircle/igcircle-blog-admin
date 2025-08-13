import type {
  ArticleImportResponseType,
  ArticleQueryType,
  ArticleStatsType,
  ArticleType,
  BatchArchiveArticleType,
  BatchDeleteArticleType,
  BatchExportArticleType,
  BatchExportResponseType,
  BatchPublishArticleType,
  BatchUpdateArticleType,
  CreateArticleType,
  ImportProgressType,
  PaginatedResponse,
  PublishArticleType,
  StartImportResponseType,
  UpdateArticleType,
} from '@/types';
import { http } from '@/utils';

// 文章相关API
export const articleAPI = {
  // 获取文章列表（包含所有状态）
  getArticles: (
    params?: ArticleQueryType,
  ): Promise<PaginatedResponse<ArticleType>> => {
    return http.get('/admin/articles', params);
  },

  // 获取草稿文章
  getDrafts: (
    params?: ArticleQueryType,
  ): Promise<PaginatedResponse<ArticleType>> => {
    return http.get('/admin/articles/drafts', params);
  },

  // 获取已发布文章
  getPublished: (
    params?: ArticleQueryType,
  ): Promise<PaginatedResponse<ArticleType>> => {
    return http.get('/admin/articles/published', params);
  },

  // 获取归档文章
  getArchived: (
    params?: ArticleQueryType,
  ): Promise<PaginatedResponse<ArticleType>> => {
    return http.get('/admin/articles/archived', params);
  },

  // 获取文章统计信息
  getStatistics: (params?: ArticleQueryType): Promise<ArticleStatsType> => {
    return http.get('/admin/articles/stats', params);
  },

  // 获取文章详情
  getArticle: (id: string): Promise<ArticleType> => {
    return http.get(`/admin/articles/${id}`);
  },

  // 创建文章
  createArticle: (data: CreateArticleType): Promise<ArticleType> => {
    return http.post('/admin/articles', data);
  },

  // 更新文章
  updateArticle: (
    id: string,
    data: UpdateArticleType,
  ): Promise<ArticleType> => {
    return http.put(`/admin/articles/${id}`, data);
  },

  // 发布文章
  publishArticle: (
    id: string,
    data?: PublishArticleType,
  ): Promise<ArticleType> => {
    return http.put(`/admin/articles/${id}/publish`, data || {});
  },

  // 取消发布文章
  unpublishArticle: (id: string): Promise<ArticleType> => {
    return http.put(`/admin/articles/${id}/unpublish`);
  },

  // 归档文章
  archiveArticle: (id: string): Promise<ArticleType> => {
    return http.put(`/admin/articles/${id}/archive`);
  },

  // 切换精选状态
  toggleFeatured: (id: string): Promise<ArticleType> => {
    return http.put(`/admin/articles/${id}/feature`);
  },

  // 切换置顶状态
  toggleTop: (id: string): Promise<ArticleType> => {
    return http.put(`/admin/articles/${id}/top`);
  },

  // 切换可见性状态
  toggleVisible: (id: string): Promise<ArticleType> => {
    return http.put(`/admin/articles/${id}/visible`);
  },

  // 删除文章
  deleteArticle: (id: string): Promise<void> => {
    return http.delete(`/admin/articles/${id}`);
  },

  // 批量删除文章
  batchDeleteArticles: (data: BatchDeleteArticleType): Promise<void> => {
    return http.delete('/admin/articles/batch', { data });
  },

  // 批量发布文章
  batchPublishArticles: (
    data: BatchPublishArticleType,
  ): Promise<{ message: string }> => {
    return http.put('/admin/articles/batch/publish', data);
  },

  // 批量归档文章
  batchArchiveArticles: (
    data: BatchArchiveArticleType,
  ): Promise<{ message: string }> => {
    return http.put('/admin/articles/batch/archive', data);
  },

  // 批量更新文章
  batchUpdateArticles: (
    data: BatchUpdateArticleType,
  ): Promise<{ message: string }> => {
    return http.put('/admin/articles/batch/update', data);
  },

  // 批量导出文章
  batchExportArticles: (
    data: BatchExportArticleType,
  ): Promise<BatchExportResponseType | Blob> => {
    // 如果是多篇markdown文章，返回zip文件
    if (data.format === 'markdown' && data.ids && data.ids.length > 1) {
      return http.post('/admin/articles/batch/export', data, {
        responseType: 'blob',
      }) as Promise<Blob>;
    }
    return http.post('/admin/articles/batch/export', data);
  },

  // 文章导入相关API
  // 同步导入文章
  importArticles: (formData: FormData): Promise<ArticleImportResponseType> => {
    return http.post('/admin/articles/import', formData);
  },

  // 异步导入文章
  importArticlesAsync: (
    formData: FormData,
  ): Promise<StartImportResponseType> => {
    return http.post('/admin/articles/import/async', formData);
  },

  // 获取导入进度
  getImportProgress: (taskId: string): Promise<ImportProgressType> => {
    return http.get(`/admin/articles/import/progress/${taskId}`);
  },

  // 验证文章文件
  validateFiles: (
    files: File[],
  ): Promise<{
    totalFiles: number;
    validFiles: number;
    invalidFiles: number;
    results: {
      filename: string;
      isValid: boolean;
      errors: string[];
      warnings: string[];
      title?: string;
      hasContent: boolean;
    }[];
  }> => {
    const formData = new FormData();
    files.forEach((file) => {
      formData.append('files', file);
    });
    return http.post('/admin/articles/import/validate', formData);
  },
};
