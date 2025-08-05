import dayjs from 'dayjs';
import 'dayjs/locale/zh-cn'; // 引入中文本地化

// 全局设置中文
dayjs.locale('zh-cn');

/**
 * 时间戳转换为日期字符串
 * @param timestamp 毫秒级时间戳（如 1696123200000）
 * @param format 日期格式（默认 'YYYY-MM-DD HH:mm:ss'）
 * @returns 格式化后的日期字符串
 */
export const formatTimestamp = (
  timestamp: number | string | null | undefined,
  format = 'YYYY-MM-DD HH:mm:ss',
): string => {
  if (!timestamp) return '-';

  // 处理字符串类型的时间戳（如后端返回字符串格式）
  const ts = typeof timestamp === 'string' ? Number(timestamp) : timestamp;

  // 无效时间戳返回空或提示
  if (!ts || isNaN(ts)) return '-';

  // 使用dayjs格式化时间
  const date = dayjs(ts);
  if (!date.isValid()) return '-';

  return date.format(format);
};
