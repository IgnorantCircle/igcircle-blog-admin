import { articleAPI } from '@/services/article';
import type { Article } from '@/types';
import { formatTimestamp } from '@/utils/format';
import {
  DeleteOutlined,
  EditOutlined,
  EyeOutlined,
  ImportOutlined,
  MoreOutlined,
  PlusOutlined,
} from '@ant-design/icons';
import {
  ActionType,
  PageContainer,
  ProColumns,
  ProTable,
} from '@ant-design/pro-components';
import { history } from '@umijs/max';
import {
  Button,
  Dropdown,
  MenuProps,
  Popconfirm,
  Space,
  Tag,
  message,
} from 'antd';
import React, { useRef } from 'react';

type ArticleItem = Article;

const ArticleList: React.FC = () => {
  const actionRef = useRef<ActionType>();

  // 状态标签颜色映射
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

  // 删除文章
  const handleDelete = async (id: string) => {
    try {
      await articleAPI.deleteArticle(id);
      message.success('删除成功');
      actionRef.current?.reload();
    } catch (error) {
      message.error('删除失败');
    }
  };

  // 发布/取消发布
  const handlePublish = async (id: string, isPublished: boolean) => {
    try {
      if (isPublished) {
        await articleAPI.unpublishArticle(id);
        message.success('取消发布成功');
      } else {
        await articleAPI.publishArticle(id);
        message.success('发布成功');
      }
      actionRef.current?.reload();
    } catch (error) {
      message.error('操作失败');
    }
  };

  // 设置置顶
  const handleToggleTop = async (id: string) => {
    try {
      await articleAPI.toggleTop(id);
      message.success('操作成功');
      actionRef.current?.reload();
    } catch (error) {
      message.error('操作失败');
    }
  };

  // 设置精选
  const handleToggleFeatured = async (id: string) => {
    try {
      await articleAPI.toggleFeatured(id);
      message.success('操作成功');
      actionRef.current?.reload();
    } catch (error) {
      message.error('操作失败');
    }
  };

  // 切换可见性
  const handleToggleVisible = async (id: string) => {
    try {
      await articleAPI.toggleVisible(id);
      message.success('操作成功');
      actionRef.current?.reload();
    } catch (error) {
      message.error('操作失败');
    }
  };

  // 归档文章
  const handleArchive = async (id: string) => {
    try {
      await articleAPI.archiveArticle(id);
      message.success('归档成功');
      actionRef.current?.reload();
    } catch (error) {
      message.error('归档失败');
    }
  };

  // 更多操作菜单
  const getMoreMenuItems = (record: ArticleItem): MenuProps['items'] => [
    {
      key: 'publish',
      label: record.status === 'published' ? '取消发布' : '发布',
      onClick: () => handlePublish(record.id, record.status === 'published'),
    },
    {
      key: 'sticky',
      label: record.isTop ? '取消置顶' : '设为置顶',
      onClick: () => handleToggleTop(record.id),
    },
    {
      key: 'featured',
      label: record.isFeatured ? '取消精选' : '设为精选',
      onClick: () => handleToggleFeatured(record.id),
    },
    {
      key: 'visible',
      label: record.isVisible ? '隐藏文章' : '显示文章',
      onClick: () => handleToggleVisible(record.id),
    },
    {
      key: 'archive',
      label: '归档',
      onClick: () => handleArchive(record.id),
      disabled: record.status === 'archived',
    },
  ];

  const columns: ProColumns<ArticleItem>[] = [
    {
      title: '标题',
      dataIndex: 'title',
      width: 300,
      search: {
        transform: (value) => ({
          keyword: value,
        }),
      },
      fieldProps: {
        label: '关键词',
      },

      ellipsis: true,
      render: (text, record) => (
        <div>
          <div style={{ fontWeight: 500 }}>
            {record.isTop && <Tag color="red">置顶</Tag>}
            {record.isFeatured && <Tag color="gold">精选</Tag>}
            {!record.isVisible && <Tag color="gray">隐藏</Tag>}
            {text}
          </div>
          {record.summary && (
            <div
              style={{
                color: '#999',
                fontSize: '12px',
                marginTop: '4px',
                maxWidth: '300px',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {record.summary}
            </div>
          )}
        </div>
      ),
    },
    {
      title: '状态',
      dataIndex: 'status',
      width: 100,
      valueType: 'select',
      valueEnum: {
        draft: { text: '草稿', status: 'Default' },
        published: { text: '已发布', status: 'Success' },
        archived: { text: '已归档', status: 'Default' },
      },
      render: (_, record) => (
        <Tag color={statusColorMap[record.status]}>
          {statusTextMap[record.status]}
        </Tag>
      ),
    },
    {
      title: '分类',
      dataIndex: ['category', 'name'],
      width: 120,
      render: (text) => text || '-',
    },
    {
      title: '标签',
      dataIndex: 'tags',
      width: 200,
      render: (_, record) => (
        <Space wrap>
          {record.tags?.map((tag) => (
            <Tag key={tag.id} color={tag.color || 'blue'}>
              {tag.name}
            </Tag>
          )) || '-'}
        </Space>
      ),
    },
    {
      title: '统计',
      width: 120,
      search: false,
      render: (_, record) => (
        <div style={{ fontSize: '12px' }}>
          <div>浏览: {record.viewCount}</div>
          <div>点赞: {record.likeCount}</div>
          <div>评论: {record.commentCount}</div>
        </div>
      ),
    },
    {
      title: '作者',
      dataIndex: ['author', 'username'],
      width: 100,
      search: false,
    },
    {
      title: '创建时间',
      dataIndex: 'createdAt',
      width: 150,
      valueType: 'dateTime',
      render: (_, record) => formatTimestamp(record.createdAt),
    },
    {
      title: '更新时间',
      dataIndex: 'updatedAt',
      width: 150,
      valueType: 'dateTime',
      render: (_, record) => formatTimestamp(record.updatedAt),
    },
    {
      title: '发布时间',
      dataIndex: 'publishedAt',
      width: 150,
      valueType: 'date',
      render: (_, record) => formatTimestamp(record.publishedAt),
    },
    {
      title: '操作',
      valueType: 'option',
      width: 150,
      render: (_, record) => [
        <Button
          key="view"
          type="link"
          size="small"
          icon={<EyeOutlined />}
          onClick={() =>
            window.open(`/articles/preview/${record.id}`, '_blank')
          }
        >
          预览
        </Button>,
        <Button
          key="edit"
          type="link"
          size="small"
          icon={<EditOutlined />}
          onClick={() => history.push(`/articles/edit/${record.id}`)}
        >
          编辑
        </Button>,
        <Popconfirm
          key="delete"
          title="确定要删除这篇文章吗？"
          onConfirm={() => handleDelete(record.id)}
          okText="确定"
          cancelText="取消"
        >
          <Button type="link" size="small" danger icon={<DeleteOutlined />}>
            删除
          </Button>
        </Popconfirm>,
        <Dropdown
          key="more"
          menu={{ items: getMoreMenuItems(record) }}
          trigger={['click']}
        >
          <Button type="link" size="small" icon={<MoreOutlined />}>
            更多
          </Button>
        </Dropdown>,
      ],
    },
  ];

  return (
    <PageContainer>
      <ProTable<ArticleItem>
        headerTitle="文章管理"
        actionRef={actionRef}
        rowKey="id"
        search={{
          labelWidth: 120,
        }}
        scroll={{ x: 'auto' }}
        toolBarRender={() => [
          <Button
            key="create"
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => history.push('/articles/create')}
          >
            新建文章
          </Button>,
          <Button
            key="import"
            icon={<ImportOutlined />}
            onClick={() => history.push('/articles/import')}
          >
            导入文章
          </Button>,
          <Button
            key="statistics"
            onClick={() => history.push('/articles/statistics')}
          >
            文章统计
          </Button>,
        ]}
        request={async (params, sort) => {
          try {
            const response = await articleAPI.getArticles({
              page: params.current,
              limit: params.pageSize,
              keyword: params.keyword,
              status: params.status,
              categoryId: params.categoryId,
              tagId: params.tagId,
              isFeatured: params.isFeatured,
              isTop: params.isTop,
              authorId: params.authorId,
              startDate: params.startDate,
              endDate: params.endDate,
              sortBy: sort && Object.keys(sort)[0],
              sortOrder:
                sort && Object.values(sort)[0] === 'ascend' ? 'ASC' : 'DESC',
            });
            return {
              data: response.items || [],
              success: true,
              total: response.total || 0,
            };
          } catch (error) {
            return {
              data: [],
              success: false,
              total: 0,
            };
          }
        }}
        columns={columns}
        pagination={{
          defaultPageSize: 10,
          showSizeChanger: true,
          showQuickJumper: true,
        }}
      />
    </PageContainer>
  );
};

export default ArticleList;
