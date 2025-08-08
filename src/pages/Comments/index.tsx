import { commentAPI } from '@/services';
import type { AdminUpdateCommentDto, Comment } from '@/types';
import { formatTimestamp } from '@/utils/format';
import {
  BarChartOutlined,
  DeleteOutlined,
  EditOutlined,
  EyeInvisibleOutlined,
  EyeOutlined,
  FileTextOutlined,
  PushpinOutlined,
  UserOutlined,
} from '@ant-design/icons';
import {
  ActionType,
  ModalForm,
  PageContainer,
  ProColumns,
  ProFormSelect,
  ProFormSwitch,
  ProFormTextArea,
  ProTable,
} from '@ant-design/pro-components';
import { history } from '@umijs/max';
import {
  Avatar,
  Badge,
  Button,
  Card,
  Divider,
  Drawer,
  Popconfirm,
  Space,
  Tag,
  Tooltip,
  Typography,
  message,
} from 'antd';
import React, { useRef, useState } from 'react';

const { Text, Paragraph } = Typography;

type CommentItem = Comment;

const CommentList: React.FC = () => {
  const actionRef = useRef<ActionType>();
  const [selectedRowKeys, setSelectedRowKeys] = useState<string[]>([]);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [detailDrawerVisible, setDetailDrawerVisible] = useState(false);
  const [currentComment, setCurrentComment] = useState<CommentItem | null>(
    null,
  );

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

  // 删除评论
  const handleDelete = async (id: string) => {
    try {
      await commentAPI.deleteComment(id);
      message.success('删除成功');
      actionRef.current?.reload();
    } catch (error) {
      message.error('删除失败');
    }
  };

  // 批量删除
  const handleBatchDelete = async () => {
    if (selectedRowKeys.length === 0) {
      message.warning('请选择要删除的评论');
      return;
    }
    try {
      await commentAPI.batchDeleteComments({ ids: selectedRowKeys });
      message.success('批量删除成功');
      setSelectedRowKeys([]);
      actionRef.current?.reload();
    } catch (error) {
      message.error('批量删除失败');
    }
  };

  // 更新评论
  const handleUpdate = async (values: AdminUpdateCommentDto) => {
    if (!currentComment) return false;
    try {
      await commentAPI.updateComment(currentComment.id, values);
      message.success('更新成功');
      setEditModalVisible(false);
      actionRef.current?.reload();
      return true;
    } catch (error) {
      message.error('更新失败');
      return false;
    }
  };

  // 切换置顶状态
  const handleToggleTop = async (id: string) => {
    try {
      await commentAPI.toggleTopComment(id);
      message.success('操作成功');
      actionRef.current?.reload();
    } catch (error) {
      message.error('操作失败');
    }
  };

  // 切换隐藏状态
  const handleToggleHide = async (id: string) => {
    try {
      await commentAPI.toggleHideComment(id);
      message.success('操作成功');
      actionRef.current?.reload();
    } catch (error) {
      message.error('操作失败');
    }
  };
  // 查看详情
  const handleViewDetail = (record: CommentItem) => {
    setCurrentComment(record);
    setDetailDrawerVisible(true);
  };

  const columns: ProColumns<CommentItem>[] = [
    {
      title: '评论内容',
      dataIndex: 'content',
      width: 300,
      ellipsis: true,
      search: {
        transform: (value) => ({
          keyword: value,
        }),
      },
      fieldProps: {
        placeholder: '搜索评论内容',
      },
      render: (text, record) => (
        <div>
          <div style={{ marginBottom: 4 }}>
            {record.isTop && <Tag color="red">置顶</Tag>}
            {record.parentId && <Tag color="blue">回复</Tag>}
          </div>
          <Paragraph
            ellipsis={{ rows: 2, expandable: true, symbol: '展开' }}
            style={{ marginBottom: 0 }}
          >
            {text}
          </Paragraph>
        </div>
      ),
    },
    {
      title: '作者',
      dataIndex: 'author',
      width: 120,
      search: false,
      render: (_, record) => (
        <Space>
          <Avatar
            size="small"
            src={record.author?.avatar}
            icon={<UserOutlined />}
          />
          <span>{record.author?.nickname || record.author?.username}</span>
        </Space>
      ),
    },
    {
      title: '文章',
      dataIndex: 'article',
      width: 200,
      ellipsis: true,
      search: false,
      render: (_, record) => (
        <Tooltip title={record.article?.title}>
          <Space>
            <FileTextOutlined />
            <span>{record.article?.title}</span>
          </Space>
        </Tooltip>
      ),
    },
    {
      title: '状态',
      dataIndex: 'status',
      width: 100,
      valueType: 'select',
      valueEnum: {
        active: { text: '正常', status: 'Success' },
        hidden: { text: '隐藏', status: 'Warning' },
        deleted: { text: '已删除', status: 'Error' },
      },
      render: (_, record) => (
        <Tag
          color={statusColorMap[record.status as keyof typeof statusColorMap]}
        >
          {statusTextMap[record.status as keyof typeof statusTextMap]}
        </Tag>
      ),
    },
    {
      title: '点赞数',
      dataIndex: 'likeCount',
      width: 80,
      search: false,
      render: (count) => <Badge count={count} color="#f50" />,
    },
    {
      title: '回复数',
      dataIndex: 'replyCount',
      width: 80,
      search: false,
      render: (count) => <Badge count={count} color="#108ee9" />,
    },
    {
      title: 'IP地址',
      dataIndex: 'ipAddress',
      width: 120,
      search: false,
      render: (ip) => <Text code>{ip}</Text>,
    },
    {
      title: '创建时间',
      dataIndex: 'createdAt',
      width: 150,
      valueType: 'dateTime',
      search: false,
      render: (_, record) => formatTimestamp(record.createdAt),
    },
    {
      title: '操作',
      valueType: 'option',
      width: 200,
      render: (_, record) => [
        <Button
          key="detail"
          type="link"
          size="small"
          icon={<EyeOutlined />}
          onClick={() => handleViewDetail(record)}
        >
          详情
        </Button>,
        <Button
          key="edit"
          type="link"
          size="small"
          icon={<EditOutlined />}
          onClick={() => {
            setCurrentComment(record);
            setEditModalVisible(true);
          }}
        >
          编辑
        </Button>,
        record.status === 'active' ? (
          <Button
            key="hide"
            type="link"
            size="small"
            icon={<EyeInvisibleOutlined />}
            onClick={() => handleToggleHide(record.id)}
          >
            隐藏
          </Button>
        ) : (
          <Button
            key="show"
            type="link"
            size="small"
            icon={<EyeOutlined />}
            onClick={() => handleToggleHide(record.id)}
          >
            显示
          </Button>
        ),
        <Button
          key="top"
          type="link"
          size="small"
          icon={<PushpinOutlined />}
          onClick={() => handleToggleTop(record.id)}
        >
          {record.isTop ? '取消置顶' : '置顶'}
        </Button>,
        <Popconfirm
          key="delete"
          title="确定要删除这条评论吗？"
          onConfirm={() => handleDelete(record.id)}
          okText="确定"
          cancelText="取消"
        >
          <Button type="link" size="small" danger icon={<DeleteOutlined />}>
            删除
          </Button>
        </Popconfirm>,
      ],
    },
  ];

  return (
    <PageContainer
      extra={[
        <Button
          key="statistics"
          type="default"
          icon={<BarChartOutlined />}
          onClick={() => history.push('/comments/statistics')}
        >
          评论统计
        </Button>,
      ]}
    >
      <ProTable<CommentItem>
        headerTitle="评论管理"
        actionRef={actionRef}
        rowKey="id"
        search={{
          labelWidth: 120,
        }}
        toolBarRender={() => [
          <Popconfirm
            key="batchDelete"
            title={`确定要删除选中的 ${selectedRowKeys.length} 条评论吗？`}
            onConfirm={handleBatchDelete}
            disabled={selectedRowKeys.length === 0}
            okText="确定"
            cancelText="取消"
          >
            <Button
              danger
              disabled={selectedRowKeys.length === 0}
              icon={<DeleteOutlined />}
            >
              批量删除 ({selectedRowKeys.length})
            </Button>
          </Popconfirm>,
        ]}
        request={async (params) => {
          try {
            const response = await commentAPI.getComments({
              page: params.current,
              limit: params.pageSize,
              keyword: params.keyword,
              status: params.status,
              sortBy: 'createdAt',
              sortOrder: 'DESC',
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
        rowSelection={{
          selectedRowKeys,
          onChange: (keys) => setSelectedRowKeys(keys as string[]),
        }}
        pagination={{
          defaultPageSize: 10,
          showSizeChanger: true,
        }}
      />

      {/* 编辑评论弹窗 */}
      <ModalForm
        title="编辑评论"
        width={600}
        open={editModalVisible}
        onOpenChange={setEditModalVisible}
        onFinish={handleUpdate}
        initialValues={currentComment || {}}
        modalProps={{
          destroyOnClose: true,
        }}
      >
        <ProFormTextArea
          name="content"
          label="评论内容"
          placeholder="请输入评论内容"
          rules={[
            { required: true, message: '请输入评论内容' },
            { max: 1000, message: '评论内容不能超过1000个字符' },
          ]}
          fieldProps={{
            rows: 4,
            maxLength: 1000,
            showCount: true,
          }}
        />

        <ProFormSelect
          name="status"
          label="状态"
          options={[
            { label: '正常', value: 'active' },
            { label: '隐藏', value: 'hidden' },
            { label: '已删除', value: 'deleted' },
          ]}
        />

        <ProFormSwitch name="isTop" label="是否置顶" />

        <ProFormTextArea
          name="adminNote"
          label="管理员备注"
          placeholder="请输入管理员备注（可选）"
          fieldProps={{
            rows: 2,
            maxLength: 500,
            showCount: true,
          }}
        />
      </ModalForm>

      {/* 评论详情抽屉 */}
      <Drawer
        title="评论详情"
        width={600}
        open={detailDrawerVisible}
        onClose={() => setDetailDrawerVisible(false)}
      >
        {currentComment && (
          <div>
            <Card title="基本信息" size="small">
              <Space direction="vertical" style={{ width: '100%' }}>
                <div>
                  <Text strong>评论ID：</Text>
                  <Text code>{currentComment.id}</Text>
                </div>
                <div>
                  <Text strong>状态：</Text>
                  <Tag
                    color={
                      statusColorMap[
                        currentComment.status as keyof typeof statusColorMap
                      ]
                    }
                  >
                    {
                      statusTextMap[
                        currentComment.status as keyof typeof statusTextMap
                      ]
                    }
                  </Tag>
                  {currentComment.isTop && <Tag color="red">置顶</Tag>}
                </div>
                <div>
                  <Text strong>创建时间：</Text>
                  <Text>{formatTimestamp(currentComment.createdAt)}</Text>
                </div>
                <div>
                  <Text strong>更新时间：</Text>
                  <Text>{formatTimestamp(currentComment.updatedAt)}</Text>
                </div>
              </Space>
            </Card>

            <Card title="评论内容" size="small" style={{ marginTop: 16 }}>
              <Paragraph>{currentComment.content}</Paragraph>
            </Card>

            <Card title="作者信息" size="small" style={{ marginTop: 16 }}>
              <Space direction="vertical" style={{ width: '100%' }}>
                <div>
                  <Avatar
                    src={currentComment.author?.avatar}
                    icon={<UserOutlined />}
                    style={{ marginRight: 8 }}
                  />
                  <Text strong>
                    {currentComment.author?.nickname ||
                      currentComment.author?.username}
                  </Text>
                </div>
                <div>
                  <Text strong>用户ID：</Text>
                  <Text code>{currentComment.authorId}</Text>
                </div>
                <div>
                  <Text strong>邮箱：</Text>
                  <Text>{currentComment.author?.email}</Text>
                </div>
              </Space>
            </Card>

            <Card title="文章信息" size="small" style={{ marginTop: 16 }}>
              <Space direction="vertical" style={{ width: '100%' }}>
                <div>
                  <Text strong>文章标题：</Text>
                  <Text>{currentComment.article?.title}</Text>
                </div>
                <div>
                  <Text strong>文章ID：</Text>
                  <Text code>{currentComment.articleId}</Text>
                </div>
              </Space>
            </Card>

            <Card title="统计信息" size="small" style={{ marginTop: 16 }}>
              <Space direction="vertical" style={{ width: '100%' }}>
                <div>
                  <Text strong>点赞数：</Text>
                  <Badge count={currentComment.likeCount} color="#f50" />
                </div>
                <div>
                  <Text strong>回复数：</Text>
                  <Badge count={currentComment.replyCount} color="#108ee9" />
                </div>
              </Space>
            </Card>

            <Card title="技术信息" size="small" style={{ marginTop: 16 }}>
              <Space direction="vertical" style={{ width: '100%' }}>
                <div>
                  <Text strong>IP地址：</Text>
                  <Text code>{currentComment.ipAddress}</Text>
                </div>
                <div>
                  <Text strong>用户代理：</Text>
                  <Text code style={{ wordBreak: 'break-all' }}>
                    {currentComment.userAgent}
                  </Text>
                </div>
              </Space>
            </Card>

            {currentComment.adminNote && (
              <Card title="管理员备注" size="small" style={{ marginTop: 16 }}>
                <Paragraph>{currentComment.adminNote}</Paragraph>
              </Card>
            )}

            <Divider />
            <Space>
              <Button
                type="primary"
                icon={<EditOutlined />}
                onClick={() => {
                  setDetailDrawerVisible(false);
                  setEditModalVisible(true);
                }}
              >
                编辑评论
              </Button>
              {currentComment.status === 'active' ? (
                <Button
                  icon={<EyeInvisibleOutlined />}
                  onClick={() => {
                    handleToggleHide(currentComment.id);
                    setDetailDrawerVisible(false);
                  }}
                >
                  隐藏评论
                </Button>
              ) : (
                <Button
                  icon={<EyeOutlined />}
                  onClick={() => {
                    handleToggleHide(currentComment.id);
                    setDetailDrawerVisible(false);
                  }}
                >
                  显示评论
                </Button>
              )}
              <Button
                icon={<PushpinOutlined />}
                onClick={() => {
                  handleToggleTop(currentComment.id);
                  setDetailDrawerVisible(false);
                }}
              >
                {currentComment.isTop ? '取消置顶' : '置顶评论'}
              </Button>
              <Popconfirm
                title="确定要删除这条评论吗？"
                onConfirm={() => {
                  handleDelete(currentComment.id);
                  setDetailDrawerVisible(false);
                }}
                okText="确定"
                cancelText="取消"
              >
                <Button danger icon={<DeleteOutlined />}>
                  删除评论
                </Button>
              </Popconfirm>
            </Space>
          </div>
        )}
      </Drawer>
    </PageContainer>
  );
};

export default CommentList;
