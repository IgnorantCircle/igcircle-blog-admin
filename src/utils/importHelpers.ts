import type { ArticleImportConfigType } from '@/types';

/**
 * 构建文章导入的FormData
 * @param files 要导入的文件列表
 * @param config 导入配置
 * @returns 构建好的FormData对象
 */
export const buildImportFormData = (
  files: File[],
  config: ArticleImportConfigType,
): FormData => {
  const formData = new FormData();

  // 添加文件
  files.forEach((file) => {
    formData.append('files', file);
  });

  // 处理配置参数
  if (config.defaultCategory) {
    formData.append('defaultCategory', config.defaultCategory);
  }
  if (config.defaultTags && config.defaultTags.length > 0) {
    formData.append('defaultTags', config.defaultTags.join(','));
  }
  if (config.autoPublish !== undefined) {
    formData.append('autoPublish', String(config.autoPublish));
  }
  if (config.overwriteExisting !== undefined) {
    formData.append('overwriteExisting', String(config.overwriteExisting));
  }
  if (config.importMode) {
    formData.append('importMode', config.importMode);
  }
  if (config.skipInvalidFiles !== undefined) {
    formData.append('skipInvalidFiles', String(config.skipInvalidFiles));
  }

  return formData;
};

/**
 * 计算轮询超时次数
 * @param timeoutMinutes 超时时间（分钟）
 * @param intervalSeconds 轮询间隔（秒）
 * @returns 最大轮询次数
 */
export const calculateMaxPollingAttempts = (
  timeoutMinutes: number,
  intervalSeconds: number,
): number => {
  return Math.floor((timeoutMinutes * 60) / intervalSeconds);
};
