import type {
  CategoryQueryType,
  CategoryStatsType,
  CategoryType,
  CreateCategoryType,
  PaginatedResponse,
  UpdateCategoryType,
} from '@/types';
import { http } from '../utils/request';

// 分类相关API
export const categoryAPI = {
  // 获取分类列表
  getCategories: (
    params?: CategoryQueryType,
  ): Promise<PaginatedResponse<CategoryType>> => {
    return http.get('/admin/categories', params);
  },

  // 获取分类树形结构
  getCategoryTree: (): Promise<CategoryType[]> => {
    return http.get('/admin/categories/tree');
  },

  // 获取分类统计信息
  getStatistics: (): Promise<CategoryStatsType> => {
    return http.get('/admin/categories/stats');
  },

  // 根据ID获取分类详情
  getCategory: (id: string): Promise<CategoryType> => {
    return http.get(`/admin/categories/${id}`);
  },

  // 根据slug获取分类详情
  getCategoryBySlug: (slug: string): Promise<CategoryType> => {
    return http.get(`/admin/categories/slug/${slug}`);
  },

  // 创建分类
  createCategory: (data: CreateCategoryType): Promise<CategoryType> => {
    return http.post('/admin/categories', data);
  },

  // 更新分类
  updateCategory: (
    id: string,
    data: UpdateCategoryType,
  ): Promise<CategoryType> => {
    return http.patch(`/admin/categories/${id}`, data);
  },

  // 删除分类
  deleteCategory: (id: string): Promise<void> => {
    return http.delete(`/admin/categories/${id}`);
  },
};
