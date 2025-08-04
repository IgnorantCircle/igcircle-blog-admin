// 导入所有API服务

import { authAPI } from './auth';
import { categoryAPI } from './category';
import { tagAPI } from './tag';

// 导出所有API服务
export { authAPI } from './auth';
export { categoryAPI } from './category';
export { tagAPI } from './tag';

// 统一导出所有API
export const api = {
  auth: authAPI,
  categoryAPI,
  tag: tagAPI,
};

export default api;
