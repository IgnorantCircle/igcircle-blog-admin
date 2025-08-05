import type {
  Category,
  CategoryQueryDto,
  CategoryStats,
  CreateCategoryDto,
  PaginatedResponse,
  UpdateCategoryDto,
} from '../types';
import { http } from '../utils/request';

// 分类相关API
export const categoryAPI = {
  // 获取分类列表
  getCategories: (
    params?: CategoryQueryDto,
  ): Promise<PaginatedResponse<Category>> => {
    return http.get('/admin/categories', params);
  },

  // 获取分类树形结构
  getCategoryTree: (): Promise<Category[]> => {
    return http.get('/admin/categories/tree');
  },

  // 获取分类统计信息
  getStatistics: (): Promise<CategoryStats> => {
    return http.get('/admin/categories/stats');
  },

  // 根据ID获取分类详情
  getCategory: (id: string): Promise<Category> => {
    return http.get(`/admin/categories/${id}`);
  },

  // 根据slug获取分类详情
  getCategoryBySlug: (slug: string): Promise<Category> => {
    return http.get(`/admin/categories/slug/${slug}`);
  },

  // 创建分类
  createCategory: (data: CreateCategoryDto): Promise<Category> => {
    return http.post('/admin/categories', data);
  },

  // 更新分类
  updateCategory: (id: string, data: UpdateCategoryDto): Promise<Category> => {
    return http.patch(`/admin/categories/${id}`, data);
  },

  // 删除分类
  deleteCategory: (id: string): Promise<void> => {
    return http.delete(`/admin/categories/${id}`);
  },
};
