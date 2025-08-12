import type { UserFormDataType, UserItemType } from '@/types';
import {
  DeleteOutlined,
  EditOutlined,
  PlusOutlined,
  UserOutlined,
} from '@ant-design/icons';
import {
  ActionType,
  PageContainer,
  ProColumns,
  ProTable,
} from '@ant-design/pro-components';
import { Avatar, Button, Form, Popconfirm, Space, Tag, message } from 'antd';
import React, { useRef, useState } from 'react';
import { userAPI } from '../../services';
import EditModal from './EditModal';

const UserList: React.FC = () => {
  const actionRef = useRef<ActionType>();
  const [modalVisible, setModalVisible] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [currentUser, setCurrentUser] = useState<UserItemType | null>(null);

  const [modalForm] = Form.useForm();
  const handleDelete = async (id: string) => {
    try {
      await userAPI.deleteUser(id);
      message.success('删除成功');
      actionRef.current?.reload();
    } catch (error) {
      message.error('删除失败');
    }
  };

  // 处理Modal提交
  const handleModalFinish = async (values: UserFormDataType) => {
    try {
      if (modalMode === 'create') {
        await userAPI.createUser(values);
        message.success('创建成功');
      } else {
        if (!currentUser) return false;
        await userAPI.updateUser(currentUser.id, values);
        message.success('更新成功');
      }

      setModalVisible(false);
      setCurrentUser(null);
      modalForm.resetFields();
      actionRef.current?.reload();
      return true;
    } catch (error) {
      message.error(modalMode === 'create' ? '创建失败' : '更新失败');
      return false;
    }
  };

  // 更新用户状态
  const handleUpdateStatus = async (
    id: string,
    status: 'active' | 'inactive' | 'banned',
  ) => {
    try {
      await userAPI.updateUserStatus(id, { status });
      message.success('状态更新成功');
      actionRef.current?.reload();
    } catch (error) {
      message.error('状态更新失败');
    }
  };
  // 强制用户退出所有设备
  const handleForceLogout = async (id: string) => {
    try {
      await userAPI.forceLogoutUser(id);
      message.success('已强制该用户退出所有设备');
    } catch (error) {
      message.error('操作失败，请重试');
    }
  };

  // 状态颜色映射
  const statusColorMap = {
    active: 'green',
    inactive: 'orange',
    banned: 'red',
  };

  // 状态文本映射
  const statusTextMap = {
    active: '正常',
    inactive: '未激活',
    banned: '已封禁',
  };

  // 角色颜色映射
  const roleColorMap = {
    admin: 'blue',
    user: 'default',
  };

  // 角色文本映射
  const roleTextMap = {
    admin: '管理员',
    user: '普通用户',
  };

  // 在线状态颜色映射
  const onlineStatusColorMap = {
    online: 'green',
    offline: 'default',
    away: 'orange',
  };

  // 在线状态文本映射
  const onlineStatusTextMap = {
    online: '在线',
    offline: '离线',
    away: '离开',
  };

  const columns: ProColumns<UserItemType>[] = [
    {
      title: '用户信息',
      dataIndex: 'username',
      width: 200,
      render: (_, record) => (
        <Space>
          <Avatar src={record.avatar} icon={<UserOutlined />} size="small" />
          <div>
            <div style={{ fontWeight: 500 }}>
              {record.nickname || record.username}
            </div>
            <div style={{ fontSize: '12px', color: '#666' }}>
              @{record.username}
            </div>
          </div>
        </Space>
      ),
    },
    {
      title: '邮箱',
      dataIndex: 'email',
      width: 200,
      copyable: true,
      render: (_, record) => (
        <Space direction="vertical" size={0}>
          <span>{record.email}</span>
          {record.emailVerified !== undefined && (
            <Tag color={record.emailVerified ? 'green' : 'orange'}>
              {record.emailVerified ? '已验证' : '未验证'}
            </Tag>
          )}
        </Space>
      ),
    },
    {
      title: '角色',
      dataIndex: 'role',
      width: 100,
      valueType: 'select',
      valueEnum: {
        admin: { text: '管理员', status: 'Processing' },
        user: { text: '普通用户', status: 'Default' },
      },
      render: (_, record) => (
        <Tag color={roleColorMap[record.role]}>{roleTextMap[record.role]}</Tag>
      ),
    },
    {
      title: '状态',
      dataIndex: 'status',
      width: 120,
      valueType: 'select',
      valueEnum: {
        active: { text: '正常', status: 'Success' },
        inactive: { text: '未激活', status: 'Warning' },
        banned: { text: '已封禁', status: 'Error' },
      },
      render: (_, record) => (
        <Space direction="vertical" size={0}>
          <Tag color={statusColorMap[record.status]}>
            {statusTextMap[record.status]}
          </Tag>
          {record.onlineStatus && (
            <Tag color={onlineStatusColorMap[record.onlineStatus]}>
              {onlineStatusTextMap[record.onlineStatus]}
            </Tag>
          )}
        </Space>
      ),
    },
    {
      title: '创建时间',
      dataIndex: 'createdAt',
      width: 150,
      valueType: 'dateTime',
    },
    {
      title: '操作',
      valueType: 'option',
      width: 200,
      render: (_, record) => [
        <Button
          key="edit"
          type="link"
          size="small"
          icon={<EditOutlined />}
          onClick={() => {
            setCurrentUser(record);
            modalForm.setFieldsValue({
              username: record.username,
              email: record.email,
              nickname: record.nickname,
              role: record.role,
              status: record.status,
            });
            setModalMode('edit');
            setModalVisible(true);
          }}
        >
          编辑
        </Button>,
        <Popconfirm
          key="status"
          title={`确定要${
            record.status === 'active' ? '禁用' : '启用'
          }该用户吗？`}
          onConfirm={() =>
            handleUpdateStatus(
              record.id,
              record.status === 'active' ? 'inactive' : 'active',
            )
          }
          okText="确定"
          cancelText="取消"
        >
          <Button type="link" size="small" danger={record.status === 'active'}>
            {record.status === 'active' ? '禁用' : '启用'}
          </Button>
        </Popconfirm>,
        <Popconfirm
          key="forceLogout"
          title="确定要强制该用户退出所有设备吗？"
          onConfirm={() => handleForceLogout(record.id)}
          okText="确定"
          cancelText="取消"
        >
          <Button type="link" size="small" style={{ color: '#ff7a00' }}>
            强制退出
          </Button>
        </Popconfirm>,
        <Popconfirm
          key="delete"
          title="确定要删除这个用户吗？"
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
    <PageContainer>
      <ProTable<UserItemType>
        headerTitle="用户列表"
        actionRef={actionRef}
        rowKey="id"
        search={{
          labelWidth: 120,
        }}
        toolBarRender={() => [
          <Button
            key="create"
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => {
              setCurrentUser(null);
              modalForm.resetFields();
              setModalMode('create');
              setModalVisible(true);
            }}
          >
            新建用户
          </Button>,
        ]}
        request={async (params) => {
          try {
            const response = await userAPI.getUsers({
              page: params.current,
              limit: params.pageSize,
              ...(params.username && { search: params.username }),
              ...(params.role && { role: params.role as 'user' | 'admin' }),
              ...(params.status && {
                status: params.status as 'active' | 'inactive' | 'banned',
              }),
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
        }}
      />

      <EditModal
        open={modalVisible}
        onOpenChange={setModalVisible}
        onFinish={handleModalFinish}
        currentUser={currentUser}
        mode={modalMode}
        form={modalForm}
      />
    </PageContainer>
  );
};

export default UserList;
