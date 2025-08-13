import { articleAPI } from '@/services/article';
import type { ArticleStatsType, ArticleType } from '@/types';
import {
  ClockCircleOutlined,
  EyeOutlined,
  FileTextOutlined,
  FireOutlined,
  LikeOutlined,
  MessageOutlined,
  ShareAltOutlined,
  TrophyOutlined,
} from '@ant-design/icons';
import { Column, Line, Pie } from '@ant-design/plots';
import { PageContainer, StatisticCard } from '@ant-design/pro-components';
import {
  Button,
  Card,
  Col,
  DatePicker,
  Progress,
  Row,
  Select,
  Space,
  Statistic,
  Table,
  Tag,
} from 'antd';
import dayjs from 'dayjs';
import React, { useEffect, useState } from 'react';

const { RangePicker } = DatePicker;
const { Option } = Select;

const ArticleStatistics: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<ArticleStatsType | null>(null);
  const [dateRange, setDateRange] = useState<[dayjs.Dayjs, dayjs.Dayjs]>([
    dayjs().subtract(30, 'day'),
    dayjs(),
  ]);
  const [timeRange, setTimeRange] = useState<string>('30d');

  // 加载统计数据
  const loadStatistics = async () => {
    setLoading(true);
    try {
      const response = await articleAPI.getStatistics();
      setStats(response);
    } catch (error) {
      console.error('加载统计数据失败:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStatistics();
  }, [dateRange]);

  // 处理时间范围变化
  const handleTimeRangeChange = (value: string) => {
    setTimeRange(value);
    const now = dayjs();
    switch (value) {
      case '7d':
        setDateRange([now.subtract(7, 'day'), now]);
        break;
      case '30d':
        setDateRange([now.subtract(30, 'day'), now]);
        break;
      case '90d':
        setDateRange([now.subtract(90, 'day'), now]);
        break;
      case '1y':
        setDateRange([now.subtract(1, 'year'), now]);
        break;
      default:
        break;
    }
  };

  // 文章状态分布数据
  const statusData = stats
    ? [
        { type: '已发布', value: stats.published },
        { type: '草稿', value: stats.draft },
        { type: '已归档', value: stats.archived },
      ]
    : [];

  // 分类统计表格列
  const categoryColumns = [
    {
      title: '分类名称',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: '文章数量',
      dataIndex: 'count',
      key: 'count',
      sorter: (a: any, b: any) => a.count - b.count,
    },
    {
      title: '占比',
      dataIndex: 'percentage',
      key: 'percentage',
      render: (value: number) => (
        <Progress
          percent={value}
          size="small"
          format={(percent) => `${percent}%`}
        />
      ),
    },
  ];

  // 热门文章表格列
  const popularColumns = [
    {
      title: '文章标题',
      dataIndex: 'title',
      key: 'title',
      ellipsis: true,
      render: (text: string, record: ArticleType) => (
        <div>
          <div style={{ fontWeight: 500 }}>
            {record.isTop && <Tag color="red">置顶</Tag>}
            {record.isFeatured && <Tag color="gold">精选</Tag>}
            {text}
          </div>
        </div>
      ),
    },
    {
      title: '浏览量',
      dataIndex: 'viewCount',
      key: 'viewCount',
      width: 100,
      sorter: (a: ArticleType, b: ArticleType) => a.viewCount - b.viewCount,
    },
    {
      title: '点赞数',
      dataIndex: 'likeCount',
      key: 'likeCount',
      width: 100,
      sorter: (a: ArticleType, b: ArticleType) => a.likeCount - b.likeCount,
    },
    {
      title: '评论数',
      dataIndex: 'commentCount',
      key: 'commentCount',
      width: 100,
      sorter: (a: ArticleType, b: ArticleType) =>
        a.commentCount - b.commentCount,
    },
    {
      title: '发布时间',
      dataIndex: 'publishedAt',
      key: 'publishedAt',
      width: 150,
      render: (text: string) => (text ? dayjs(text).format('YYYY-MM-DD') : '-'),
    },
  ];

  if (!stats) {
    return (
      <PageContainer>
        <Card loading />
      </PageContainer>
    );
  }

  return (
    <PageContainer
      title="文章统计"
      extra={[
        <Space key="controls">
          <Select
            value={timeRange}
            onChange={handleTimeRangeChange}
            style={{ width: 120 }}
          >
            <Option value="7d">最近7天</Option>
            <Option value="30d">最近30天</Option>
            <Option value="90d">最近90天</Option>
            <Option value="1y">最近1年</Option>
          </Select>
          <RangePicker
            value={dateRange}
            onChange={(dates) => {
              if (dates && dates[0] && dates[1]) {
                setDateRange([dates[0], dates[1]]);
              }
            }}
          />
          <Button onClick={loadStatistics} loading={loading}>
            刷新数据
          </Button>
        </Space>,
      ]}
    >
      {/* 总览统计卡片 */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col span={4}>
          <StatisticCard
            statistic={{
              title: '文章总数',
              value: stats.total,
              icon: <FileTextOutlined style={{ color: '#1890ff' }} />,
            }}
          />
        </Col>
        <Col span={4}>
          <StatisticCard
            statistic={{
              title: '总浏览量',
              value: stats.totalViews,
              icon: <EyeOutlined style={{ color: '#52c41a' }} />,
            }}
          />
        </Col>
        <Col span={4}>
          <StatisticCard
            statistic={{
              title: '总点赞数',
              value: stats.totalLikes,
              icon: <LikeOutlined style={{ color: '#fa541c' }} />,
            }}
          />
        </Col>
        <Col span={4}>
          <StatisticCard
            statistic={{
              title: '总评论数',
              value: stats.totalComments,
              icon: <MessageOutlined style={{ color: '#722ed1' }} />,
            }}
          />
        </Col>
        <Col span={4}>
          <StatisticCard
            statistic={{
              title: '总分享数',
              value: stats.totalShares,
              icon: <ShareAltOutlined style={{ color: '#13c2c2' }} />,
            }}
          />
        </Col>
        <Col span={4}>
          <StatisticCard
            statistic={{
              title: '平均阅读时长',
              value: stats.readingTimeStats
                ? Math.round(stats.readingTimeStats.average)
                : 0,
              suffix: '分钟',
              icon: <ClockCircleOutlined style={{ color: '#eb2f96' }} />,
            }}
          />
        </Col>
      </Row>

      {/* 详细统计 */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col span={8}>
          <Card title="文章状态分布" size="small">
            <Row gutter={16}>
              <Col span={12}>
                <Statistic
                  title="已发布"
                  value={stats.published}
                  valueStyle={{ color: '#52c41a' }}
                />
              </Col>
              <Col span={12}>
                <Statistic
                  title="草稿"
                  value={stats.draft}
                  valueStyle={{ color: '#faad14' }}
                />
              </Col>
            </Row>
            <Row gutter={16} style={{ marginTop: 16 }}>
              <Col span={12}>
                <Statistic
                  title="已归档"
                  value={stats.archived}
                  valueStyle={{ color: '#8c8c8c' }}
                />
              </Col>
              <Col span={12}>
                <Statistic
                  title="发布率"
                  value={
                    stats.total > 0
                      ? ((stats.published / stats.total) * 100).toFixed(1)
                      : 0
                  }
                  suffix="%"
                  valueStyle={{ color: '#1890ff' }}
                />
              </Col>
            </Row>
          </Card>
        </Col>
        <Col span={8}>
          <Card title="特殊标记" size="small">
            <Row gutter={16}>
              <Col span={12}>
                <Statistic
                  title="精选文章"
                  value={stats.featuredCount}
                  prefix={<TrophyOutlined />}
                  valueStyle={{ color: '#faad14' }}
                />
              </Col>
              <Col span={12}>
                <Statistic
                  title="置顶文章"
                  value={stats.topCount}
                  prefix={<FireOutlined />}
                  valueStyle={{ color: '#f5222d' }}
                />
              </Col>
            </Row>
            <Row gutter={16} style={{ marginTop: 16 }}>
              <Col span={12}>
                <Statistic
                  title="平均浏览"
                  value={
                    stats.published > 0
                      ? Math.round(stats.totalViews / stats.published)
                      : 0
                  }
                  valueStyle={{ color: '#13c2c2' }}
                />
              </Col>
              <Col span={12}>
                <Statistic
                  title="发布率"
                  value={
                    stats.total > 0
                      ? ((stats.published / stats.total) * 100).toFixed(1)
                      : 0
                  }
                  suffix="%"
                  valueStyle={{ color: '#1890ff' }}
                />
              </Col>
            </Row>
          </Card>
        </Col>
        <Col span={8}>
          <Card title="文章状态分布" size="small">
            <Pie
              data={statusData}
              angleField="value"
              colorField="type"
              radius={0.8}
              innerRadius={0.4}
              label={{
                type: 'inner',
                offset: '-30%',
                content: ({ percent }: { percent: number }) =>
                  `${(percent * 100).toFixed(0)}%`,
                style: {
                  fontSize: 14,
                  textAlign: 'center',
                },
              }}
              height={200}
            />
          </Card>
        </Col>
      </Row>

      {/* 图表区域 */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col span={8}>
          <Card title="月度文章发布趋势" size="small">
            <Line
              data={stats.monthlyStats}
              xField="month"
              yField="articles"
              height={250}
              point={{
                size: 5,
                shape: 'diamond',
              }}
              label={{
                style: {
                  fill: '#aaa',
                },
              }}
            />
          </Card>
        </Col>
        <Col span={8}>
          <Card title="分类分布" size="small">
            <Pie
              data={stats.categoryStats}
              angleField="count"
              colorField="name"
              radius={0.8}
              height={250}
              label={{
                type: 'outer',
                content: '{name}: {percentage}%',
              }}
              interactions={[{ type: 'element-active' }]}
            />
          </Card>
        </Col>
        <Col span={8}>
          <Card title="阅读时长分布" size="small">
            <Column
              data={stats.readingTimeStats?.distribution || []}
              xField="range"
              yField="count"
              height={250}
              columnStyle={{
                radius: [2, 2, 0, 0],
              }}
              label={{
                position: 'top',
                style: {
                  fill: '#aaa',
                },
              }}
            />
          </Card>
        </Col>
      </Row>

      {/* 表格区域 */}
      <Row gutter={[16, 16]}>
        <Col span={12}>
          <Card title="最新文章" size="small">
            <Table
              dataSource={stats.recentArticles}
              columns={[
                {
                  title: '标题',
                  dataIndex: 'title',
                  key: 'title',
                  ellipsis: true,
                },
                {
                  title: '状态',
                  dataIndex: 'status',
                  key: 'status',
                  render: (status: string) => (
                    <Tag
                      color={
                        status === 'published'
                          ? 'green'
                          : status === 'draft'
                          ? 'orange'
                          : 'red'
                      }
                    >
                      {status === 'published'
                        ? '已发布'
                        : status === 'draft'
                        ? '草稿'
                        : '已归档'}
                    </Tag>
                  ),
                },
                {
                  title: '浏览量',
                  dataIndex: 'views',
                  key: 'views',
                },
              ]}
              pagination={false}
              size="small"
              rowKey="id"
            />
          </Card>
        </Col>
        <Col span={12}>
          <Card title="热门文章" size="small">
            <Table
              dataSource={stats.popularArticles}
              columns={[
                {
                  title: '标题',
                  dataIndex: 'title',
                  key: 'title',
                  ellipsis: true,
                },
                {
                  title: '浏览量',
                  dataIndex: 'views',
                  key: 'views',
                },
                {
                  title: '点赞数',
                  dataIndex: 'likes',
                  key: 'likes',
                },
              ]}
              pagination={false}
              size="small"
              rowKey="id"
            />
          </Card>
        </Col>
      </Row>

      {/* 分类和标签统计 */}
      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        <Col span={12}>
          <Card title="分类统计" size="small">
            <Table
              dataSource={stats.categoryStats}
              columns={categoryColumns}
              pagination={false}
              size="small"
              rowKey="name"
            />
          </Card>
        </Col>
        <Col span={12}>
          <Card title="热门标签" size="small">
            <Space wrap>
              {stats.tagStats.slice(0, 20).map((tag) => (
                <Tag key={tag.name} color="blue" style={{ margin: '4px' }}>
                  {tag.name} ({tag.count})
                </Tag>
              ))}
            </Space>
          </Card>
        </Col>
      </Row>

      {/* 热门文章 */}
      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        <Col span={24}>
          <Card title="热门文章" size="small">
            <Table
              dataSource={stats.popularArticles}
              columns={popularColumns}
              pagination={{ pageSize: 10 }}
              size="small"
              rowKey="id"
            />
          </Card>
        </Col>
      </Row>
    </PageContainer>
  );
};

export default ArticleStatistics;
