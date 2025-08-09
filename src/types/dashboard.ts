import type { Article, ArticleStats } from './article';
import type { CategoryStats } from './category';
import type { CommentStats } from './comment';
import type { TagStats } from './tag';
import type { UserStats } from './user';

// 仪表板统计接口
export interface DashboardStats {
  articles: ArticleStats;
  categories: CategoryStats;
  tags: TagStats;
  users: UserStats;
  comments: CommentStats;
  recentArticles: Article[];
}

// 仪表板统计数据类型（用于页面组件）
export interface DashboardStatsData {
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
}

// 最近文章类型（用于页面组件）
export interface RecentArticle {
  id: number;
  title: string;
  status: string;
  viewCount: number;
  likeCount: number;
  commentCount: number;
  createdAt: string;
  updatedAt: string;
}
