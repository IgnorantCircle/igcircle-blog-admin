import type {
  CreateTagType,
  PaginatedResponse,
  PopularTagsType,
  TagQueryType,
  TagStatsType,
  TagType,
  UpdateTagType,
} from '@/types';
import { http } from '@/utils';

// 标签相关API
export const tagAPI = {
  // 获取标签列表
  getTags: (params?: TagQueryType): Promise<PaginatedResponse<TagType>> => {
    return http.get('/admin/tags', params);
  },

  // 获取热门标签
  getPopularTags: (params?: PopularTagsType): Promise<TagType[]> => {
    return http.get('/admin/tags/popular', params);
  },

  // 获取标签云
  getTagCloud: (): Promise<TagType[]> => {
    return http.get('/admin/tags/cloud');
  },

  // 获取标签统计信息
  getStatistics: (): Promise<TagStatsType> => {
    return http.get('/admin/tags/stats');
  },

  // 根据ID获取标签详情
  getTag: (id: string): Promise<TagType> => {
    return http.get(`/admin/tags/${id}`);
  },

  // 根据slug获取标签详情
  getTagBySlug: (slug: string): Promise<TagType> => {
    return http.get(`/admin/tags/slug/${slug}`);
  },

  // 创建标签
  createTag: (data: CreateTagType): Promise<TagType> => {
    return http.post('/admin/tags', data);
  },

  // 更新标签
  updateTag: (id: string, data: UpdateTagType): Promise<TagType> => {
    return http.patch(`/admin/tags/${id}`, data);
  },

  // 删除标签
  deleteTag: (id: string): Promise<void> => {
    return http.delete(`/admin/tags/${id}`);
  },
};
