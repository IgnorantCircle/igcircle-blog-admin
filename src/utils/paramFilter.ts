/**
 * 参数过滤工具函数
 * 用于过滤请求参数中的空值，防止后端验证错误
 */

/**
 * 判断值是否为空
 * @param value 要检查的值
 * @returns 是否为空
 */
export function isEmpty(value: any): boolean {
  // null 或 undefined
  if (value === null || value === undefined) {
    return true;
  }

  // 字符串类型：空字符串或全部空格
  if (typeof value === 'string') {
    return value.trim() === '';
  }

  // 数组类型：空数组
  if (Array.isArray(value)) {
    return value.length === 0;
  }

  // 对象类型：空对象
  if (typeof value === 'object') {
    return Object.keys(value).length === 0;
  }

  return false;
}

/**
 * 过滤对象中的空值参数
 * @param params 要过滤的参数对象
 * @param options 过滤选项
 * @returns 过滤后的参数对象
 */
export function filterEmptyParams<T extends Record<string, any>>(
  params: T,
  options: {
    /** 是否去除字符串首尾空格 */
    trim?: boolean;
    /** 是否保留数字0 */
    keepZero?: boolean;
    /** 是否保留布尔值false */
    keepFalse?: boolean;
    /** 需要保留的字段（即使为空也保留） */
    keepFields?: string[];
    /** 需要排除的字段（即使不为空也移除） */
    excludeFields?: string[];
  } = {},
): Partial<T> {
  const {
    trim = true,
    keepZero = true,
    keepFalse = true,
    keepFields = [],
    excludeFields = [],
  } = options;

  if (!params || typeof params !== 'object') {
    return {};
  }

  const filtered: Partial<T> = {};

  Object.keys(params).forEach((key) => {
    let value = params[key];

    // 如果在排除字段列表中，直接跳过
    if (excludeFields.includes(key)) {
      return;
    }

    // 如果在保留字段列表中，直接保留
    if (keepFields.includes(key)) {
      filtered[key as keyof T] = value;
      return;
    }

    // 字符串类型处理
    if (typeof value === 'string' && trim) {
      value = value.trim();
    }

    // 数字0的处理
    if (value === 0 && keepZero) {
      filtered[key as keyof T] = value;
      return;
    }

    // 布尔值false的处理
    if (value === false && keepFalse) {
      filtered[key as keyof T] = value;
      return;
    }

    // 过滤空值
    if (!isEmpty(value)) {
      filtered[key as keyof T] = value;
    }
  });

  return filtered;
}

/**
 * 过滤查询参数（专门用于GET请求的params）
 * @param params 查询参数对象
 * @returns 过滤后的查询参数
 */
export function filterQueryParams<T extends Record<string, any>>(
  params: T,
): Partial<T> {
  return filterEmptyParams(params, {
    trim: true,
    keepZero: true,
    keepFalse: true,
  });
}

/**
 * 过滤表单数据（专门用于POST/PUT请求的data）
 * @param data 表单数据对象
 * @param keepFields 需要保留的字段（即使为空也保留）
 * @returns 过滤后的表单数据
 */
export function filterFormData<T extends Record<string, any>>(
  data: T,
  keepFields: string[] = [],
): Partial<T> {
  return filterEmptyParams(data, {
    trim: true,
    keepZero: true,
    keepFalse: true,
    keepFields,
  });
}

/**
 * 深度过滤嵌套对象中的空值
 * @param obj 要过滤的对象
 * @param options 过滤选项
 * @returns 过滤后的对象
 */
export function deepFilterEmptyParams<T>(
  obj: T,
  options: {
    trim?: boolean;
    keepZero?: boolean;
    keepFalse?: boolean;
  } = {},
): T {
  const { trim = true, keepZero = true, keepFalse = true } = options;

  if (obj === null || obj === undefined) {
    return obj;
  }

  if (Array.isArray(obj)) {
    return obj
      .map((item) => deepFilterEmptyParams(item, options))
      .filter((item) => !isEmpty(item)) as T;
  }

  if (typeof obj === 'object') {
    const filtered: any = {};

    Object.keys(obj as any).forEach((key) => {
      let value = (obj as any)[key];

      // 字符串类型处理
      if (typeof value === 'string' && trim) {
        value = value.trim();
      }

      // 数字0的处理
      if (value === 0 && keepZero) {
        filtered[key] = value;
        return;
      }

      // 布尔值false的处理
      if (value === false && keepFalse) {
        filtered[key] = value;
        return;
      }

      // 递归处理嵌套对象
      if (typeof value === 'object' && value !== null) {
        const nestedFiltered = deepFilterEmptyParams(value, options);
        if (!isEmpty(nestedFiltered)) {
          filtered[key] = nestedFiltered;
        }
      } else if (!isEmpty(value)) {
        filtered[key] = value;
      }
    });

    return filtered as T;
  }

  return obj;
}

/**
 * 默认导出过滤函数
 */
export default filterEmptyParams;
