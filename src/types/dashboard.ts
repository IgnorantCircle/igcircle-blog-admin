import type { ArticleStatsType, ArticleType } from './article';
import type { CategoryStatsType } from './category';
import type { CommentStatsType } from './comment';
import type { TagStatsType } from './tag';
import type { UserStatsType } from './user';

// 仪表板统计接口
export interface DashboardStatsType {
  articles: ArticleStatsType;
  categories: CategoryStatsType;
  tags: TagStatsType;
  users: UserStatsType;
  comments: CommentStatsType;
  recentArticles: ArticleType[];
}

// 仪表板统计数据类型（用于页面组件）
export interface DashboardStatsDataType {
  totalArticles: number;
  publishedArticles: number;
  draftArticles: number;
  totalViews: number;
  totalLikes: number;
  totalComments: number;
  totalCategories: number;
  totalTags: number;
  totalUsers: number;
  onlineUsers: number;
  activeUsers: number;
  bannerUsers: number;
}

// 最近文章类型（用于页面组件）
export interface RecentArticleType {
  id: number;
  title: string;
  status: string;
  viewCount: number;
  likeCount: number;
  commentCount: number;
  createdAt: string;
  updatedAt: string;
}
