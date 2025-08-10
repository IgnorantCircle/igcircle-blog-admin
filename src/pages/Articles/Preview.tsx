import { articleAPI } from '@/services/article';
import type { ArticleType } from '@/types';
import {
  ArrowLeftOutlined,
  CalendarOutlined,
  EditOutlined,
  EyeOutlined,
  FolderOutlined,
  TagsOutlined,
  UserOutlined,
} from '@ant-design/icons';
import { PageContainer, ProCard } from '@ant-design/pro-components';
import MarkdownRenderer from '@/components/MarkdownRenderer';
import { history, useParams } from '@umijs/max';
import {
  Alert,
  Button,
  Col,
  Divider,
  Image,
  Row,
  Space,
  Spin,
  Tag,
  Typography,
} from 'antd';
import React, { useEffect, useState } from 'react';

const { Title, Paragraph, Text } = Typography;

const ArticlePreview: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [article, setArticle] = useState<ArticleType | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const fetchArticle = async (articleId: string) => {
    try {
      setLoading(true);
      setError(null);
      const data = await articleAPI.getArticle(articleId);
      setArticle(data);
    } catch (err: any) {
      setError(err.message || '获取文章详情失败');
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    if (id) {
      // 首先检查是否有来自编辑页面的临时数据
      const previewData = sessionStorage.getItem(`article_preview_${id}`);
      if (previewData) {
        try {
          const tempArticle = JSON.parse(previewData);
          setArticle(tempArticle);
          setLoading(false);
          // 清除临时数据
          sessionStorage.removeItem(`article_preview_${id}`);
          return;
        } catch (err) {
          console.error('解析预览数据失败:', err);
        }
      }
      // 如果没有临时数据，则从API获取
      fetchArticle(id);
    }
  }, [id]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'published':
        return 'green';
      case 'draft':
        return 'orange';
      case 'archived':
        return 'red';
      default:
        return 'default';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'published':
        return '已发布';
      case 'draft':
        return '草稿';
      case 'archived':
        return '已归档';
      default:
        return status;
    }
  };

  if (loading) {
    return (
      <PageContainer>
        <div style={{ textAlign: 'center', padding: '50px' }}>
          <Spin size="large" />
        </div>
      </PageContainer>
    );
  }

  if (error) {
    return (
      <PageContainer>
        <Alert
          message="加载失败"
          description={error}
          type="error"
          showIcon
          action={
            <Button size="small" onClick={() => history.back()}>
              返回
            </Button>
          }
        />
      </PageContainer>
    );
  }

  if (!article) {
    return (
      <PageContainer>
        <Alert
          message="文章不存在"
          description="未找到指定的文章"
          type="warning"
          showIcon
          action={
            <Button size="small" onClick={() => history.back()}>
              返回
            </Button>
          }
        />
      </PageContainer>
    );
  }

  return (
    <PageContainer
      header={{
        title: '文章预览',
        breadcrumb: {
          items: [
            { title: '文章管理', path: '/articles' },
            { title: '文章预览' },
          ],
        },
        extra: [
          <Button
            key="back"
            icon={<ArrowLeftOutlined />}
            onClick={() => history.back()}
          >
            返回
          </Button>,
          <Button
            key="edit"
            type="primary"
            icon={<EditOutlined />}
            onClick={() => {
              // 如果是临时文章（新建文章预览），返回新建页面
              if (article.id && article.id.toString().startsWith('temp_')) {
                history.push('/articles/create');
              } else {
                history.push(`/articles/edit/${article.id}`);
              }
            }}
          >
            编辑文章
          </Button>,
        ],
      }}
    >
      <ProCard>
        {/* 文章头部信息 */}
        <div className="article-header">
          <Title level={1} style={{ marginBottom: 16 }}>
            {article.title}
          </Title>

          <Row gutter={[16, 8]} style={{ marginBottom: 24 }}>
            <Col>
              <Space>
                <UserOutlined />
                <Text>
                  {article.author?.nickname || article.author?.username}
                </Text>
              </Space>
            </Col>
            <Col>
              <Space>
                <CalendarOutlined />
                <Text>
                  {article.publishedAt
                    ? new Date(article.publishedAt).toLocaleString()
                    : '未发布'}
                </Text>
              </Space>
            </Col>
            <Col>
              <Space>
                <EyeOutlined />
                <Text>{article.viewCount} 次浏览</Text>
              </Space>
            </Col>
            <Col>
              <Tag color={getStatusColor(article.status)}>
                {getStatusText(article.status)}
              </Tag>
            </Col>
            {article.isFeatured && (
              <Col>
                <Tag color="gold">精选</Tag>
              </Col>
            )}
            {article.isTop && (
              <Col>
                <Tag color="red">置顶</Tag>
              </Col>
            )}
          </Row>

          {/* 文章摘要 */}
          {article.summary && (
            <Paragraph
              style={{
                fontSize: '16px',
                color: '#666',
                fontStyle: 'italic',
                marginBottom: 24,
                padding: '16px',
                backgroundColor: '#f5f5f5',
                borderLeft: '4px solid #1890ff',
              }}
            >
              {article.summary}
            </Paragraph>
          )}

          {/* 封面图片 */}
          {article.coverImage && (
            <div style={{ marginBottom: 24, textAlign: 'center' }}>
              <Image
                src={article.coverImage}
                alt={article.title}
                style={{ maxWidth: '100%', maxHeight: '400px' }}
              />
            </div>
          )}

          {/* 分类和标签 */}
          <Row gutter={16} style={{ marginBottom: 24 }}>
            {article.category && (
              <Col>
                <Space>
                  <FolderOutlined />
                  <Text strong>分类：</Text>
                  <Tag color="blue">{article.category.name}</Tag>
                </Space>
              </Col>
            )}
            {article.tags && article.tags.length > 0 && (
              <Col>
                <Space>
                  <TagsOutlined />
                  <Text strong>标签：</Text>
                  {article.tags.map((tag: any) => (
                    <Tag key={tag.id} color={tag.color || 'default'}>
                      {tag.name}
                    </Tag>
                  ))}
                </Space>
              </Col>
            )}
          </Row>
        </div>

        <Divider />

        {/* 文章内容 */}
        <div className="article-content">
          <MarkdownRenderer
            source={article.content}
            style={{
              lineHeight: '1.8',
              fontSize: '16px',
              color: '#333',
              backgroundColor: 'transparent',
            }}
          />
        </div>

        <Divider />

        {/* 文章元信息 */}
        <div className="article-meta">
          <Row gutter={[16, 16]}>
            <Col span={12}>
              <Text strong>创建时间：</Text>
              <Text>{new Date(article.createdAt).toLocaleString()}</Text>
            </Col>
            <Col span={12}>
              <Text strong>更新时间：</Text>
              <Text>{new Date(article.updatedAt).toLocaleString()}</Text>
            </Col>
            <Col span={12}>
              <Text strong>阅读时间：</Text>
              <Text>{article.readingTime} 分钟</Text>
            </Col>
            <Col span={12}>
              <Text strong>文章权重：</Text>
              <Text>{article.weight}</Text>
            </Col>
            {article.metaDescription && (
              <Col span={24}>
                <Text strong>SEO描述：</Text>
                <Paragraph>{article.metaDescription}</Paragraph>
              </Col>
            )}
            {article.metaKeywords && article.metaKeywords.length > 0 && (
              <Col span={24}>
                <Text strong>SEO关键词：</Text>
                <Space wrap>
                  {article.metaKeywords.map((keyword, index) => (
                    <Tag key={index}>{keyword}</Tag>
                  ))}
                </Space>
              </Col>
            )}
          </Row>
        </div>
      </ProCard>
    </PageContainer>
  );
};

export default ArticlePreview;
