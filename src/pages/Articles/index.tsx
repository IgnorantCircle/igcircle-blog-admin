import { categoryAPI, tagAPI } from '@/services';
import { articleAPI } from '@/services/article';
import type { ArticleType, CategoryType, TagType } from '@/types';
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
import React, { useEffect, useRef, useState } from 'react';

const ArticleList: React.FC = () => {
  const actionRef = useRef<ActionType>();
  const [categories, setCategories] = useState<CategoryType[]>([]);
  const [tags, setTags] = useState<TagType[]>([]);
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);

  const rowSelection = {
    selectedRowKeys,
    onChange: (newSelectedRowKeys: React.Key[]) => {
      setSelectedRowKeys(newSelectedRowKeys);
    },
  };
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

  // 批量操作
  const handleBatchPublish = async (selectedRowKeys: React.Key[]) => {
    try {
      await articleAPI.batchPublishArticles({
        ids: selectedRowKeys as string[],
      });
      message.success('批量发布成功');
      actionRef.current?.reload();
      setSelectedRowKeys([]);
    } catch (error) {
      message.error('批量发布失败');
    }
  };

  const handleBatchArchive = async (selectedRowKeys: React.Key[]) => {
    try {
      await articleAPI.batchArchiveArticles({
        ids: selectedRowKeys as string[],
      });
      message.success('批量归档成功');
      actionRef.current?.reload();
      setSelectedRowKeys([]);
    } catch (error) {
      message.error('批量归档失败');
    }
  };

  const handleBatchDelete = async (selectedRowKeys: React.Key[]) => {
    try {
      await articleAPI.batchDeleteArticles({
        ids: selectedRowKeys as string[],
      });
      message.success('批量删除成功');
      actionRef.current?.reload();
      setSelectedRowKeys([]);
    } catch (error) {
      message.error('批量删除失败');
    }
  };

  const handleBatchExport = async (
    selectedRowKeys: React.Key[],
    format: 'json' | 'csv' | 'markdown' = 'json',
  ) => {
    try {
      const result = await articleAPI.batchExportArticles({
        ids: selectedRowKeys as string[],
        format,
        includeContent: true,
        includeTags: true,
        includeCategory: true,
      });

      // 如果返回的是Blob（zip文件），直接下载
      if (result instanceof Blob) {
        const url = URL.createObjectURL(result);
        const a = document.createElement('a');
        a.href = url;
        a.download = `articles_export_${
          new Date().toISOString().split('T')[0]
        }.zip`;
        a.click();
        URL.revokeObjectURL(url);
      } else {
        // 处理JSON响应
        const jsonResult = result as any;
        if (format === 'json') {
          const blob = new Blob([JSON.stringify(jsonResult.data, null, 2)], {
            type: 'application/json',
          });
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `articles_export_${
            new Date().toISOString().split('T')[0]
          }.json`;
          a.click();
          URL.revokeObjectURL(url);
        } else {
          const blob = new Blob([jsonResult.data as string], {
            type: format === 'csv' ? 'text/csv' : 'text/markdown',
          });
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download =
            jsonResult.filename ||
            `articles_export_${
              new Date().toISOString().split('T')[0]
            }.${format}`;
          a.click();
          URL.revokeObjectURL(url);
        }
      }

      message.success('导出成功');
      setSelectedRowKeys([]);
    } catch (error) {
      message.error('导出失败');
    }
  };

  // 更多操作菜单
  const getMoreMenuItems = (record: ArticleType): MenuProps['items'] => [
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

  const columns: ProColumns<ArticleType>[] = [
    {
      title: '标题',
      dataIndex: 'title',
      width: 300,
      search: {
        transform: (value) => ({
          keyword: value,
        }),
      },
      formItemProps: {
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
      valueType: 'select',
      width: 120,
      fieldProps: {
        showSearch: true,
        mode: 'multiple',
      },
      search: {
        transform: (value) => ({
          categoryIds: value,
        }),
      },
      valueEnum: categories.reduce((acc, category: CategoryType) => {
        acc[category.id] = category.name;
        return acc;
      }, {} as Record<string, string>),
      render: (text) => text || '-',
    },
    {
      title: '标签',
      dataIndex: 'tags',
      valueType: 'select',
      search: {
        transform: (value) => {
          return { tagIds: value };
        },
      },
      fieldProps: {
        showSearch: true,
        mode: 'multiple',
      },

      width: 200,
      valueEnum: tags.reduce((acc, tag: TagType) => {
        acc[tag.id] = tag.name;
        return acc;
      }, {} as Record<string, string>),
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
      title: '阅读时间',
      dataIndex: 'readingTime',
      width: 100,
      search: {
        transform: (value) => {
          if (Array.isArray(value) && value.length === 2) {
            return {
              minReadingTime: value[0],
              maxReadingTime: value[1],
            };
          }
          return {};
        },
      },
      valueType: 'digitRange',
      fieldProps: {
        placeholder: ['最小时间', '最大时间'],
      },
      render: (_, record) =>
        record.readingTime ? `${record.readingTime}分钟` : '-',
    },
    {
      title: '可见性',
      dataIndex: 'isVisible',
      width: 80,
      valueType: 'select',
      valueEnum: {
        true: { text: '可见', status: 'Success' },
        false: { text: '隐藏', status: 'Default' },
      },
      render: (_, record) => (
        <Tag color={record.isVisible ? 'green' : 'gray'}>
          {record.isVisible ? '可见' : '隐藏'}
        </Tag>
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
    },
    {
      title: '更新时间',
      dataIndex: 'updatedAt',
      width: 150,
      valueType: 'dateTime',
    },
    {
      title: '发布时间',
      dataIndex: 'publishedAt',
      width: 150,
      valueType: 'dateTime',
    },
    {
      title: '操作',
      valueType: 'option',
      width: 280,
      fixed: 'right',
      render: (_, record) => [
        <Button
          key="view"
          type="link"
          size="small"
          icon={<EyeOutlined />}
          onClick={() =>
            history.push(`/articles/preview/${record.id}`, '_blank')
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
          overlayStyle={{ width: 120 }}
        >
          <Button type="link" size="small" icon={<MoreOutlined />} />
        </Dropdown>,
      ],
    },
  ];

  // 加载分类和标签数据
  useEffect(() => {
    const loadData = async () => {
      try {
        const [categoryRes, tagRes] = await Promise.all([
          categoryAPI.getCategories({ limit: 100 }),
          tagAPI.getTags({ limit: 100 }),
        ]);

        setCategories(categoryRes.items || []);
        setTags(tagRes.items || []);
      } catch (error) {
        message.error('加载数据失败');
      }
    };
    loadData();
  }, []);

  return (
    <PageContainer>
      <ProTable<ArticleType>
        headerTitle="文章管理"
        actionRef={actionRef}
        rowKey="id"
        search={{
          labelWidth: 120,
        }}
        scroll={{ x: 1100 }}
        rowSelection={rowSelection}
        tableAlertRender={({ selectedRowKeys, onCleanSelected }) => (
          <Space size={24}>
            <span>
              已选择 <strong>{selectedRowKeys.length}</strong> 项
              <a style={{ marginLeft: 8 }} onClick={onCleanSelected}>
                取消选择
              </a>
            </span>
          </Space>
        )}
        tableAlertOptionRender={({ selectedRowKeys }) => {
          return (
            <Space size={16}>
              <Button
                size="small"
                onClick={() => handleBatchPublish(selectedRowKeys)}
                disabled={selectedRowKeys.length === 0}
              >
                批量发布
              </Button>
              <Button
                size="small"
                onClick={() => handleBatchArchive(selectedRowKeys)}
                disabled={selectedRowKeys.length === 0}
              >
                批量归档
              </Button>
              <Dropdown
                menu={{
                  items: [
                    {
                      key: 'export-json',
                      label: '导出为JSON',
                      onClick: () => handleBatchExport(selectedRowKeys, 'json'),
                    },
                    {
                      key: 'export-csv',
                      label: '导出为CSV',
                      onClick: () => handleBatchExport(selectedRowKeys, 'csv'),
                    },
                    {
                      key: 'export-markdown',
                      label: '导出为Markdown',
                      onClick: () =>
                        handleBatchExport(selectedRowKeys, 'markdown'),
                    },
                  ],
                }}
              >
                <Button size="small" disabled={selectedRowKeys.length === 0}>
                  批量导出
                </Button>
              </Dropdown>
              <Popconfirm
                title="确定要删除选中的文章吗？"
                onConfirm={() => handleBatchDelete(selectedRowKeys)}
                okText="确定"
                cancelText="取消"
              >
                <Button
                  size="small"
                  danger
                  disabled={selectedRowKeys.length === 0}
                >
                  批量删除
                </Button>
              </Popconfirm>
            </Space>
          );
        }}
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
            const { current, pageSize, ...formData } = params;
            const response = await articleAPI.getArticles({
              page: current,
              limit: pageSize,
              ...formData,
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
