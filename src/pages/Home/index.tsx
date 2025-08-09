import React, { useState, useEffect } from 'react';
import {
  PageContainer,
  ProCard,
  StatisticCard,
} from '@ant-design/pro-components';
import {
  Row,
  Col,
  Card,
  List,
  Tag,
  Avatar,
  Space,
  Button,
  Statistic,
  Progress,
} from 'antd';
import {
  FileTextOutlined,
  EyeOutlined,
  LikeOutlined,
  MessageOutlined,
  TagOutlined,
  FolderOutlined,
  TrophyOutlined,
  ClockCircleOutlined,
  EditOutlined,
  UserOutlined,
  TeamOutlined,
} from '@ant-design/icons';
import { articleAPI } from '@/services/article';
import { categoryAPI } from '@/services/category';
import { tagAPI } from '@/services/tag';
import { userAPI } from '@/services/user';
import { history } from '@umijs/max';
import type { DashboardStatsData, RecentArticle } from '@/types';
import dayjs from 'dayjs';

const Dashboard: React.FC = () => {
  const [stats, setStats] = useState<DashboardStatsData>({
    totalArticles: 0,
    publishedArticles: 0,
    draftArticles: 0,
    totalViews: 0,
    totalLikes: 0,
    totalComments: 0,
    totalCategories: 0,
    totalTags: 0,
    totalUsers: 0,
    onlineUsers: 0,
    activeUsers: 0,
  });
  const [recentArticles, setRecentArticles] = useState<RecentArticle[]>([]);
  const [loading, setLoading] = useState(true);

  // 加载统计数据
  const loadStats = async () => {
    try {
      setLoading(true);
      const [articleStats, categoryStats, tagStats, userStats, recentRes] = await Promise.all([
        articleAPI.getStatistics(),
        categoryAPI.getStatistics(),
        tagAPI.getStatistics(),
        userAPI.getUserStats(),
        articleAPI.getArticles({ limit: 10, page: 1 }),
      ]);

      setStats({
        totalArticles: articleStats?.total || 0,
        publishedArticles: articleStats?.published || 0,
        draftArticles: articleStats?.draft || 0,
        totalViews: articleStats?.totalViews || 0,
        totalLikes: articleStats?.totalLikes || 0,
        totalComments: articleStats?.totalComments || 0,
        totalCategories: categoryStats?.total || 0,
        totalTags: tagStats?.total || 0,
        totalUsers: userStats?.total || 0,
        onlineUsers: userStats?.onlineUsers || 0,
        activeUsers: userStats?.active || 0,
      });

      setRecentArticles((recentRes?.items || []).map(article => ({
        id: parseInt(article.id) || 0,
        title: article.title,
        status: article.status,
        viewCount: article.viewCount,
        likeCount: article.likeCount,
        commentCount: article.commentCount,
        createdAt: article.createdAt,
        updatedAt: article.updatedAt,
      })));
    } catch (error) {
      console.error('加载统计数据失败:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStats();
  }, []);

  // 状态颜色映射
  const statusColorMap = {
    draft: 'orange',
    published: 'green',
    archived: 'gray',
  };

  // 状态文本映射
  const statusTextMap = {
    draft: '草稿',
    published: '已发布',
    archived: '已归档',
  };

  // 计算发布率
  const publishRate = stats.totalArticles > 0 
    ? Math.round((stats.publishedArticles / stats.totalArticles) * 100)
    : 0;

  return (
    <PageContainer
      title="仪表板"
      subTitle="博客管理概览"
      extra={[
        <Button
          key="refresh"
          onClick={loadStats}
          loading={loading}
        >
          刷新数据
        </Button>,
        <Button
          key="create"
          type="primary"
          icon={<EditOutlined />}
          onClick={() => history.push('/articles/create')}
        >
          写文章
        </Button>,
      ]}
    >
      {/* 统计卡片 */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} md={6}>
          <StatisticCard
            statistic={{
              title: '总文章数',
              value: stats.totalArticles,
              icon: <FileTextOutlined style={{ color: '#1890ff' }} />,
            }}
            loading={loading}
          />
        </Col>
        <Col xs={24} sm={12} md={6}>
          <StatisticCard
            statistic={{
              title: '已发布',
              value: stats.publishedArticles,
              icon: <TrophyOutlined style={{ color: '#52c41a' }} />,
            }}
            loading={loading}
          />
        </Col>
        <Col xs={24} sm={12} md={6}>
          <StatisticCard
            statistic={{
              title: '草稿',
              value: stats.draftArticles,
              icon: <ClockCircleOutlined style={{ color: '#faad14' }} />,
            }}
            loading={loading}
          />
        </Col>
        <Col xs={24} sm={12} md={6}>
          <StatisticCard
            statistic={{
              title: '总浏览量',
              value: stats.totalViews,
              icon: <EyeOutlined style={{ color: '#722ed1' }} />,
            }}
            loading={loading}
          />
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} md={6}>
          <StatisticCard
            statistic={{
              title: '总点赞数',
              value: stats.totalLikes,
              icon: <LikeOutlined style={{ color: '#eb2f96' }} />,
            }}
            loading={loading}
          />
        </Col>
        <Col xs={24} sm={12} md={6}>
          <StatisticCard
            statistic={{
              title: '总评论数',
              value: stats.totalComments,
              icon: <MessageOutlined style={{ color: '#13c2c2' }} />,
            }}
            loading={loading}
          />
        </Col>
        <Col xs={24} sm={12} md={6}>
          <StatisticCard
            statistic={{
              title: '分类数',
              value: stats.totalCategories,
              icon: <FolderOutlined style={{ color: '#f5222d' }} />,
            }}
            loading={loading}
          />
        </Col>
        <Col xs={24} sm={12} md={6}>
          <StatisticCard
            statistic={{
              title: '标签数',
              value: stats.totalTags,
              icon: <TagOutlined style={{ color: '#fa8c16' }} />,
            }}
            loading={loading}
          />
        </Col>
      </Row>

      {/* 用户统计 */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} md={8}>
          <StatisticCard
            statistic={{
              title: '总用户数',
              value: stats.totalUsers,
              icon: <TeamOutlined style={{ color: '#1890ff' }} />,
            }}
            loading={loading}
          />
        </Col>
        <Col xs={24} sm={12} md={8}>
          <StatisticCard
            statistic={{
              title: '在线用户',
              value: stats.onlineUsers,
              icon: <UserOutlined style={{ color: '#52c41a' }} />,
            }}
            loading={loading}
          />
        </Col>
        <Col xs={24} sm={12} md={8}>
          <StatisticCard
            statistic={{
              title: '活跃用户',
              value: stats.activeUsers,
              icon: <UserOutlined style={{ color: '#faad14' }} />,
            }}
            loading={loading}
          />
        </Col>
      </Row>

      <Row gutter={[16, 16]}>
        {/* 发布统计 */}
        <Col xs={24} lg={8}>
          <ProCard title="发布统计" loading={loading}>
            <div style={{ textAlign: 'center' }}>
              <Progress
                type="circle"
                percent={publishRate}
                format={() => `${publishRate}%`}
                strokeColor={{
                  '0%': '#108ee9',
                  '100%': '#87d068',
                }}
                size={120}
              />
              <div style={{ marginTop: 16 }}>
                <Statistic
                  title="发布率"
                  value={publishRate}
                  suffix="%"
                  valueStyle={{ fontSize: 16 }}
                />
              </div>
              <div style={{ marginTop: 16, color: '#666' }}>
                已发布 {stats.publishedArticles} / 总计 {stats.totalArticles}
              </div>
            </div>
          </ProCard>
        </Col>

        {/* 最近文章 */}
        <Col xs={24} lg={16}>
          <ProCard
            title="最近文章"
            loading={loading}
            extra={
              <Button
                type="link"
                onClick={() => history.push('/articles')}
              >
                查看全部
              </Button>
            }
          >
            <List
              itemLayout="horizontal"
              dataSource={recentArticles.slice(0, 6)}
              renderItem={(item) => (
                <List.Item
                  actions={[
                    <Button
                      key="edit"
                      type="link"
                      size="small"
                      onClick={() => history.push(`/articles/edit/${item.id}`)}
                    >
                      编辑
                    </Button>,
                  ]}
                >
                  <List.Item.Meta
                    avatar={
                      <Avatar
                        icon={<FileTextOutlined />}
                        style={{
                          backgroundColor: statusColorMap[item.status as keyof typeof statusColorMap] || '#1890ff'
                        }}
                      />
                    }
                    title={
                      <div>
                        <span style={{ marginRight: 8 }}>{item.title}</span>
                        <Tag color={statusColorMap[item.status as keyof typeof statusColorMap]}>
                          {statusTextMap[item.status as keyof typeof statusTextMap]}
                        </Tag>
                      </div>
                    }
                    description={
                      <Space split={<span style={{ color: '#d9d9d9' }}>|</span>}>
                        <span>
                          <EyeOutlined /> {item.viewCount}
                        </span>
                        <span>
                          <LikeOutlined /> {item.likeCount}
                        </span>
                        <span>
                          <MessageOutlined /> {item.commentCount}
                        </span>
                        <span>
                          {dayjs(item.updatedAt).format('MM-DD HH:mm')}
                        </span>
                      </Space>
                    }
                  />
                </List.Item>
              )}
            />
          </ProCard>
        </Col>
      </Row>

      {/* 快速操作 */}
      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        <Col span={24}>
          <ProCard title="快速操作">
            <Row gutter={[16, 16]}>
              <Col xs={24} sm={12} md={6}>
                <Card
                  hoverable
                  onClick={() => history.push('/articles/create')}
                  style={{ textAlign: 'center', cursor: 'pointer' }}
                >
                  <EditOutlined style={{ fontSize: 32, color: '#1890ff', marginBottom: 8 }} />
                  <div>写新文章</div>
                </Card>
              </Col>
              <Col xs={24} sm={12} md={6}>
                <Card
                  hoverable
                  onClick={() => history.push('/articles?status=draft')}
                  style={{ textAlign: 'center', cursor: 'pointer' }}
                >
                  <ClockCircleOutlined style={{ fontSize: 32, color: '#faad14', marginBottom: 8 }} />
                  <div>管理草稿</div>
                </Card>
              </Col>
              <Col xs={24} sm={12} md={6}>
                <Card
                  hoverable
                  onClick={() => history.push('/categories')}
                  style={{ textAlign: 'center', cursor: 'pointer' }}
                >
                  <FolderOutlined style={{ fontSize: 32, color: '#f5222d', marginBottom: 8 }} />
                  <div>管理分类</div>
                </Card>
              </Col>
              <Col xs={24} sm={12} md={6}>
                <Card
                  hoverable
                  onClick={() => history.push('/tags')}
                  style={{ textAlign: 'center', cursor: 'pointer' }}
                >
                  <TagOutlined style={{ fontSize: 32, color: '#fa8c16', marginBottom: 8 }} />
                  <div>管理标签</div>
                </Card>
              </Col>
              <Col xs={24} sm={12} md={6}>
                <Card
                  hoverable
                  onClick={() => history.push('/comments/list')}
                  style={{ textAlign: 'center', cursor: 'pointer' }}
                >
                  <MessageOutlined style={{ fontSize: 32, color: '#52c41a', marginBottom: 8 }} />
                  <div>管理评论</div>
                </Card>
              </Col>
              <Col xs={24} sm={12} md={6}>
                <Card
                  hoverable
                  onClick={() => history.push('/articles/statistics')}
                  style={{ textAlign: 'center', cursor: 'pointer' }}
                >
                  <TrophyOutlined style={{ fontSize: 32, color: '#722ed1', marginBottom: 8 }} />
                  <div>文章统计</div>
                </Card>
              </Col>
            </Row>
          </ProCard>
        </Col>
      </Row>
    </PageContainer>
  );
};

export default Dashboard;