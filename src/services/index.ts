// 导入所有API服务

import { authAPI } from './auth';
import { categoryAPI } from './category';
// 导出所有API服务

export { authAPI } from './auth';
export { categoryAPI } from './category';

// 统一导出所有API
export const api = {
  auth: authAPI,
  categoryAPI,
};

export default api;
