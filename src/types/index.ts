// 基础实体接口
export interface BaseEntity {
  id: number;
  createdAt: string;
  updatedAt: string;
}

// 分页参数接口
export interface PaginationParams {
  page?: number;
  limit?: number;
  search?: string;
  keyword?: string;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
}

// 分页响应接口
export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

// 统一API响应接口
export interface ApiResponse<T = any> {
  code: number;
  message: string;
  data?: T;
  timestamp: string;
  path: string;
}

// 错误响应接口
export interface ErrorResponse {
  code: number;
  message: string;
  error?: string;
  details?: any[];
  timestamp: string;
  path: string;
}

// 文章相关
export interface Article extends BaseEntity {
  title: string;
  content: string;
  summary?: string;
  slug?: string;
  status: 'draft' | 'published' | 'archived';
  publishedAt?: string;
  coverImage?: string;
  viewCount: number;
  likeCount: number;
  commentCount: number;
  readingTime?: number;
  isTop: boolean;
  isFeatured: boolean;
  weight?: number;
  allowComment: boolean;
  metaDescription?: string;
  metaKeywords?: string[];
  socialImage?: string;
  tags?: Tag[];
  category?: Category;
  author: User;
  authorId: string;
}

export interface CreateArticleDto {
  title: string;
  content: string;
  summary?: string;
  slug?: string;
  coverImage?: string;
  categoryId?: number;
  tagIds?: number[];
  metaDescription?: string;
  metaKeywords?: string[];
  socialImage?: string;
  isFeatured?: boolean;
  isTop?: boolean;
  weight?: number;
  authorId: string;
  allowComment?: boolean;
}

export interface UpdateArticleDto {
  title?: string;
  content?: string;
  summary?: string;
  slug?: string;
  coverImage?: string;
  categoryId?: number;
  tagIds?: number[];
  metaDescription?: string;
  metaKeywords?: string[];
  socialImage?: string;
  isFeatured?: boolean;
  isTop?: boolean;
  weight?: number;
  readingTime?: number;
  allowComment?: boolean;
}

export interface ArticleQueryDto extends PaginationParams {
  status?: 'draft' | 'published' | 'archived';
  authorId?: number;
  categoryId?: number;
  tagId?: number;
  isFeatured?: boolean;
  isTop?: boolean;
  startDate?: string;
  endDate?: string;
  includeTags?: boolean;
  includeCategory?: boolean;
}

export interface PublishArticleDto {
  publishedAt?: string;
}

export interface ArticleStats {
  total: number;
  published: number;
  draft: number;
  archived: number;
  totalViews: number;
  totalLikes: number;
  totalComments: number;
}

// 分类相关
export interface Category extends BaseEntity {
  name: string;
  slug: string;
  description?: string;
  parentId?: number;
  parent?: Category;
  children?: Category[];
  levelShow: number;
  isActive: boolean;
  articleCount: number;
}

export interface CreateCategoryDto {
  name: string;
  slug?: string;
  description?: string;
  parentId?: number;
  levelShow?: number;
  isActive?: boolean;
}

export interface UpdateCategoryDto {
  name?: string;
  slug?: string;
  description?: string;
  parentId?: number;
  levelShow?: number;
  isActive?: boolean;
}

export interface CategoryQueryDto extends PaginationParams {
  parentName?: number;
  isActive?: boolean;
}

export interface CategoryStats {
  total: number;
  active: number;
  inactive: number;
  withArticles: number;
}

// 标签相关
export interface Tag extends BaseEntity {
  name: string;
  slug: string;
  description?: string;
  color?: string;
  isVisible: boolean;
  articleCount: number;
}

export interface CreateTagDto {
  name: string;
  slug?: string;
  description?: string;
  color?: string;
  isVisible?: boolean;
}

export interface UpdateTagDto {
  name?: string;
  slug?: string;
  description?: string;
  color?: string;
  isVisible?: boolean;
}

export interface TagQueryDto extends PaginationParams {
  isVisible?: boolean;
}

export interface PopularTagsDto {
  limit?: number;
  minArticleCount?: number;
}

export interface TagStats {
  total: number;
  visible: number;
  hidden: number;
  popular: number;
}

// 登录相关
export interface LoginDto {
  username: string;
  password: string;
}

// 用户相关
export interface User extends BaseEntity {
  username: string;
  email: string;
  nickname?: string;
  avatar?: string;
  bio?: string;
  role: 'admin' | 'user';
  status: 'active' | 'inactive' | 'banned';
}

export interface UpdateUserDto {
  nickname?: string;
  bio?: string;
  avatar?: string;
}

export interface UserQueryDto extends PaginationParams {
  status?: 'active' | 'inactive' | 'banned';
  role?: 'user' | 'admin';
}

// 认证响应
export interface AuthResponse {
  access_token: string;
  user: Pick<User, 'id' | 'username' | 'email' | 'nickname' | 'role'>;
}

// 仪表板统计
export interface DashboardStats {
  articles: ArticleStats;
  categories: CategoryStats;
  tags: TagStats;
  recentArticles: Article[];
}
