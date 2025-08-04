// 导入所有API服务

import { authAPI } from './auth';

// 导出所有API服务

export { authAPI } from './auth';

// 统一导出所有API
export const api = {
  auth: authAPI,
};

export default api;
