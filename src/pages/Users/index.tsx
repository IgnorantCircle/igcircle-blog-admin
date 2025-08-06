import {
  DeleteOutlined,
  EditOutlined,
  PlusOutlined,
  UserOutlined,
} from '@ant-design/icons';
import {
  ActionType,
  ModalForm,
  PageContainer,
  ProColumns,
  ProFormSelect,
  ProFormText,
  ProTable,
} from '@ant-design/pro-components';
import { Avatar, Button, Form, Popconfirm, Space, Tag, message } from 'antd';
import dayjs from 'dayjs';
import React, { useRef, useState } from 'react';
import { userAPI } from '../../services';

interface UserItem {
  id: string;
  username: string;
  email: string;
  nickname?: string;
  avatar?: string;
  role: 'user' | 'admin';
  status: 'active' | 'inactive' | 'banned';
  createdAt: string;
  updatedAt: string;
}

interface UserFormData {
  username: string;
  email: string;
  password: string;
  nickname?: string;
  role: 'user' | 'admin';
  status: 'active' | 'inactive' | 'banned';
}

const UserList: React.FC = () => {
  const actionRef = useRef<ActionType>();
  const [createModalVisible, setCreateModalVisible] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [currentUser, setCurrentUser] = useState<UserItem | null>(null);
  const [selectedRowKeys, setSelectedRowKeys] = useState<string[]>([]);
  const [createForm] = Form.useForm();
  const [editForm] = Form.useForm();

  // 删除用户
  const handleDelete = async (id: string) => {
    try {
      await userAPI.deleteUser(id);
      message.success('删除成功');
      actionRef.current?.reload();
    } catch (error) {
      message.error('删除失败');
    }
  };

  // 批量删除用户
  const handleBatchDelete = async () => {
    try {
      await userAPI.batchDeleteUsers({ ids: selectedRowKeys });
      message.success('批量删除成功');
      setSelectedRowKeys([]);
      actionRef.current?.reload();
    } catch (error) {
      message.error('批量删除失败');
    }
  };

  // 创建用户
  const handleCreate = async (values: UserFormData) => {
    try {
      await userAPI.createUser(values);
      message.success('创建成功');
      setCreateModalVisible(false);
      createForm.resetFields();
      actionRef.current?.reload();
      return true;
    } catch (error) {
      message.error('创建失败');
      return false;
    }
  };

  // 更新用户
  const handleUpdate = async (values: Partial<UserFormData>) => {
    if (!currentUser) return false;

    try {
      await userAPI.updateUser(currentUser.id, values);
      message.success('更新成功');
      setEditModalVisible(false);
      setCurrentUser(null);
      editForm.resetFields();
      actionRef.current?.reload();
      return true;
    } catch (error) {
      message.error('更新失败');
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

  const columns: ProColumns<UserItem>[] = [
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
      width: 100,
      valueType: 'select',
      valueEnum: {
        active: { text: '正常', status: 'Success' },
        inactive: { text: '未激活', status: 'Warning' },
        banned: { text: '已封禁', status: 'Error' },
      },
      render: (_, record) => (
        <Tag color={statusColorMap[record.status]}>
          {statusTextMap[record.status]}
        </Tag>
      ),
    },
    {
      title: '创建时间',
      dataIndex: 'createdAt',
      width: 150,
      valueType: 'dateTime',
      render: (text) => dayjs(text as string).format('YYYY-MM-DD HH:mm'),
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
            editForm.setFieldsValue({
              username: record.username,
              email: record.email,
              nickname: record.nickname,
              role: record.role,
              status: record.status,
            });
            setEditModalVisible(true);
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
      <ProTable<UserItem>
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
            onClick={() => setCreateModalVisible(true)}
          >
            新建用户
          </Button>,
          selectedRowKeys.length > 0 && (
            <Popconfirm
              key="batchDelete"
              title={`确定要删除选中的 ${selectedRowKeys.length} 个用户吗？`}
              onConfirm={handleBatchDelete}
              okText="确定"
              cancelText="取消"
            >
              <Button danger>批量删除</Button>
            </Popconfirm>
          ),
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
        rowSelection={{
          selectedRowKeys,
          onChange: (keys) => setSelectedRowKeys(keys as string[]),
        }}
        pagination={{
          defaultPageSize: 10,
          showSizeChanger: true,
        }}
      />

      {/* 创建用户弹窗 */}
      <ModalForm
        title="新建用户"
        width={600}
        form={createForm}
        open={createModalVisible}
        onOpenChange={setCreateModalVisible}
        onFinish={handleCreate}
        modalProps={{
          destroyOnClose: true,
        }}
      >
        <ProFormText
          name="username"
          label="用户名"
          placeholder="请输入用户名"
          rules={[
            { required: true, message: '请输入用户名' },
            { min: 3, max: 20, message: '用户名长度为3-20个字符' },
            {
              pattern: /^[a-zA-Z0-9_]+$/,
              message: '用户名只能包含字母、数字和下划线',
            },
          ]}
        />

        <ProFormText
          name="email"
          label="邮箱"
          placeholder="请输入邮箱"
          rules={[
            { required: true, message: '请输入邮箱' },
            { type: 'email', message: '请输入有效的邮箱地址' },
          ]}
        />

        <ProFormText.Password
          name="password"
          label="密码"
          placeholder="请输入密码"
          rules={[
            { required: true, message: '请输入密码' },
            { min: 6, message: '密码长度至少6个字符' },
          ]}
        />

        <ProFormText
          name="nickname"
          label="昵称"
          placeholder="请输入昵称（可选）"
        />

        <ProFormSelect
          name="role"
          label="角色"
          placeholder="请选择角色"
          initialValue="user"
          options={[
            { label: '普通用户', value: 'user' },
            { label: '管理员', value: 'admin' },
          ]}
          rules={[{ required: true, message: '请选择角色' }]}
        />

        <ProFormSelect
          name="status"
          label="状态"
          placeholder="请选择状态"
          initialValue="active"
          options={[
            { label: '正常', value: 'active' },
            { label: '未激活', value: 'inactive' },
            { label: '已封禁', value: 'banned' },
          ]}
          rules={[{ required: true, message: '请选择状态' }]}
        />
      </ModalForm>

      {/* 编辑用户弹窗 */}
      <ModalForm
        title="编辑用户"
        width={600}
        form={editForm}
        open={editModalVisible}
        onOpenChange={setEditModalVisible}
        onFinish={handleUpdate}
        modalProps={{
          destroyOnClose: true,
        }}
      >
        <ProFormText
          name="username"
          label="用户名"
          placeholder="请输入用户名"
          disabled
          rules={[
            { required: true, message: '请输入用户名' },
            { min: 3, max: 20, message: '用户名长度为3-20个字符' },
            {
              pattern: /^[a-zA-Z0-9_]+$/,
              message: '用户名只能包含字母、数字和下划线',
            },
          ]}
        />

        <ProFormText
          name="email"
          label="邮箱"
          placeholder="请输入邮箱"
          rules={[
            { required: true, message: '请输入邮箱' },
            { type: 'email', message: '请输入有效的邮箱地址' },
          ]}
        />

        <ProFormText
          name="nickname"
          label="昵称"
          placeholder="请输入昵称（可选）"
        />

        <ProFormSelect
          name="role"
          label="角色"
          placeholder="请选择角色"
          options={[
            { label: '普通用户', value: 'user' },
            { label: '管理员', value: 'admin' },
          ]}
          rules={[{ required: true, message: '请选择角色' }]}
        />

        <ProFormSelect
          name="status"
          label="状态"
          placeholder="请选择状态"
          options={[
            { label: '正常', value: 'active' },
            { label: '未激活', value: 'inactive' },
            { label: '已封禁', value: 'banned' },
          ]}
          rules={[{ required: true, message: '请选择状态' }]}
        />
      </ModalForm>
    </PageContainer>
  );
};

export default UserList;
