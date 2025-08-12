import { commentAPI } from '@/services';
import type { CommentStatsType, CommentType } from '@/types';
import { formatTimestamp } from '@/utils';
import {
  CommentOutlined,
  DeleteOutlined,
  EyeInvisibleOutlined,
  EyeOutlined,
  FileTextOutlined,
  LikeOutlined,
  MessageOutlined,
  UserOutlined,
} from '@ant-design/icons';
import {
  PageContainer,
  ProCard,
  StatisticCard,
} from '@ant-design/pro-components';
import { history } from '@umijs/max';
import {
  Avatar,
  Button,
  Col,
  Empty,
  List,
  Progress,
  Row,
  Space,
  Spin,
  Statistic,
  Tag,
  Timeline,
} from 'antd';
import React, { useEffect, useState } from 'react';

const CommentStatistics: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<CommentStatsType | null>(null);

  // 加载统计数据
  const loadStats = async () => {
    try {
      setLoading(true);
      const data = await commentAPI.getCommentStats();
      setStats(data);
    } catch (error) {
      console.error('加载评论统计失败:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStats();
  }, []);

  if (loading) {
    return (
      <PageContainer>
        <div style={{ textAlign: 'center', padding: '50px 0' }}>
          <Spin size="large" />
        </div>
      </PageContainer>
    );
  }

  if (!stats) {
    return (
      <PageContainer>
        <Empty description="暂无统计数据" />
      </PageContainer>
    );
  }

  // 状态标签颜色映射
  const statusColorMap = {
    active: 'green',
    hidden: 'orange',
    deleted: 'red',
  };

  // 状态文本映射
  const statusTextMap = {
    active: '正常',
    hidden: '隐藏',
    deleted: '已删除',
  };

  return (
    <PageContainer
      extra={[
        <Button
          key="back"
          type="default"
          onClick={() => history.push('/comments/list')}
        >
          返回评论列表
        </Button>,
      ]}
    >
      {/* 统计卡片 */}
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} md={6}>
          <StatisticCard
            statistic={{
              title: '评论总数',
              value: stats.total,
              icon: <MessageOutlined style={{ color: '#1890ff' }} />,
            }}
          />
        </Col>
        <Col xs={24} sm={12} md={6}>
          <StatisticCard
            statistic={{
              title: '正常评论',
              value: stats.active,
              icon: <EyeOutlined style={{ color: '#52c41a' }} />,
            }}
          />
        </Col>
        <Col xs={24} sm={12} md={6}>
          <StatisticCard
            statistic={{
              title: '隐藏评论',
              value: stats.hidden,
              icon: <EyeInvisibleOutlined style={{ color: '#faad14' }} />,
            }}
          />
        </Col>
        <Col xs={24} sm={12} md={6}>
          <StatisticCard
            statistic={{
              title: '已删除',
              value: stats.deleted,
              icon: <DeleteOutlined style={{ color: '#f5222d' }} />,
            }}
          />
        </Col>
      </Row>

      {/* 详细统计 */}
      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        <Col xs={24} md={12}>
          <ProCard title="评论类型分布">
            <Row gutter={[16, 16]}>
              <Col span={12}>
                <Statistic
                  title="顶级评论"
                  value={stats.topLevel}
                  prefix={<CommentOutlined />}
                  suffix={`/ ${stats.total}`}
                />
                <Progress
                  percent={
                    stats.total > 0
                      ? Math.round((stats.topLevel / stats.total) * 100)
                      : 0
                  }
                  strokeColor="#1890ff"
                  size="small"
                />
              </Col>
              <Col span={12}>
                <Statistic
                  title="回复评论"
                  value={stats.replies}
                  prefix={<MessageOutlined />}
                  suffix={`/ ${stats.total}`}
                />
                <Progress
                  percent={
                    stats.total > 0
                      ? Math.round((stats.replies / stats.total) * 100)
                      : 0
                  }
                  strokeColor="#52c41a"
                  size="small"
                />
              </Col>
            </Row>
          </ProCard>
        </Col>

        <Col xs={24} md={12}>
          <ProCard title="评论状态分布">
            <Row gutter={[16, 16]}>
              <Col span={8}>
                <Statistic
                  title="正常"
                  value={stats.active}
                  valueStyle={{ color: '#52c41a' }}
                />
                <Progress
                  percent={
                    stats.total > 0
                      ? Math.round((stats.active / stats.total) * 100)
                      : 0
                  }
                  strokeColor="#52c41a"
                  size="small"
                />
              </Col>
              <Col span={8}>
                <Statistic
                  title="隐藏"
                  value={stats.hidden}
                  valueStyle={{ color: '#faad14' }}
                />
                <Progress
                  percent={
                    stats.total > 0
                      ? Math.round((stats.hidden / stats.total) * 100)
                      : 0
                  }
                  strokeColor="#faad14"
                  size="small"
                />
              </Col>
              <Col span={8}>
                <Statistic
                  title="删除"
                  value={stats.deleted}
                  valueStyle={{ color: '#f5222d' }}
                />
                <Progress
                  percent={
                    stats.total > 0
                      ? Math.round((stats.deleted / stats.total) * 100)
                      : 0
                  }
                  strokeColor="#f5222d"
                  size="small"
                />
              </Col>
            </Row>
          </ProCard>
        </Col>
      </Row>

      {/* 最近评论 */}
      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        <Col span={24}>
          <ProCard
            title="最近评论"
            extra={
              <a onClick={() => history.push('/comments/list')}>查看全部</a>
            }
          >
            {stats.recentComments && stats.recentComments.length > 0 ? (
              <List
                dataSource={stats.recentComments}
                renderItem={(item: CommentType) => (
                  <List.Item
                    actions={[
                      <Tag
                        key="status"
                        color={
                          statusColorMap[
                            item.status as keyof typeof statusColorMap
                          ]
                        }
                      >
                        {
                          statusTextMap[
                            item.status as keyof typeof statusTextMap
                          ]
                        }
                      </Tag>,
                      <Space
                        key="stats"
                        split={<span style={{ color: '#d9d9d9' }}>|</span>}
                      >
                        <span>
                          <LikeOutlined /> {item.likeCount}
                        </span>
                        <span>
                          <MessageOutlined /> {item.replyCount}
                        </span>
                      </Space>,
                    ]}
                  >
                    <List.Item.Meta
                      avatar={
                        <Avatar
                          src={item.author?.avatar}
                          icon={<UserOutlined />}
                        />
                      }
                      title={
                        <div>
                          <Space>
                            <span>
                              {item.author?.nickname || item.author?.username}
                            </span>
                            {item.isTop && <Tag color="red">置顶</Tag>}
                            {item.parentId && <Tag color="blue">回复</Tag>}
                          </Space>
                          <div
                            style={{
                              fontSize: '12px',
                              color: '#999',
                              marginTop: 4,
                            }}
                          >
                            <Space>
                              <FileTextOutlined />
                              <span>{item.article?.title}</span>
                              <span>{formatTimestamp(item.createdAt)}</span>
                            </Space>
                          </div>
                        </div>
                      }
                      description={
                        <div
                          style={{
                            maxHeight: '60px',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            display: '-webkit-box',
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical',
                          }}
                        >
                          {item.content}
                        </div>
                      }
                    />
                  </List.Item>
                )}
              />
            ) : (
              <Empty description="暂无评论" />
            )}
          </ProCard>
        </Col>
      </Row>

      {/* 评论活动时间线 */}
      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        <Col span={24}>
          <ProCard title="评论活动时间线">
            {stats.recentComments && stats.recentComments.length > 0 ? (
              <Timeline>
                {stats.recentComments.slice(0, 10).map((item: any) => (
                  <Timeline.Item
                    key={item.id}
                    color={
                      statusColorMap[item.status as keyof typeof statusColorMap]
                    }
                  >
                    <div>
                      <div style={{ fontWeight: 500, marginBottom: 4 }}>
                        <Space>
                          <Avatar
                            size="small"
                            src={item.author?.avatar}
                            icon={<UserOutlined />}
                          />
                          <span>
                            {item.author?.nickname || item.author?.username}
                          </span>
                          <span style={{ color: '#999' }}>发表了评论</span>
                          {item.isTop && <Tag color="red">置顶</Tag>}
                          {item.parentId && <Tag color="blue">回复</Tag>}
                        </Space>
                      </div>
                      <div style={{ color: '#666', marginBottom: 4 }}>
                        {item.content.length > 100
                          ? `${item.content.substring(0, 100)}...`
                          : item.content}
                      </div>
                      <div style={{ fontSize: '12px', color: '#999' }}>
                        <Space>
                          <FileTextOutlined />
                          <span>{item.article?.title}</span>
                          <span>{formatTimestamp(item.createdAt)}</span>
                        </Space>
                      </div>
                    </div>
                  </Timeline.Item>
                ))}
              </Timeline>
            ) : (
              <Empty description="暂无评论活动" />
            )}
          </ProCard>
        </Col>
      </Row>
    </PageContainer>
  );
};

export default CommentStatistics;
