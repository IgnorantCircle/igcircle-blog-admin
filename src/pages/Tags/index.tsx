import { useApi } from '@/hooks';
import { tagAPI } from '@/services/tag';
import type { TagFormDataType, TagType } from '@/types';
import { DeleteOutlined, EditOutlined, PlusOutlined } from '@ant-design/icons';
import {
  ActionType,
  PageContainer,
  ProColumns,
  ProTable,
} from '@ant-design/pro-components';
import { Button, Form, Popconfirm, Tag } from 'antd';
import React, { useRef, useState } from 'react';
import EditModal from './EditModal';

const TagList: React.FC = () => {
  const actionRef = useRef<ActionType>();
  const [modalVisible, setModalVisible] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [currentTag, setCurrentTag] = useState<TagType | null>(null);
  const [modalForm] = Form.useForm();

  // 获取标签列表API
  const getTagsApi = useApi(tagAPI.getTags, {
    silent: true,
  });

  // 删除标签API
  const deleteTagApi = useApi(tagAPI.deleteTag, {
    showSuccessMessage: true,
    successMessage: '删除标签成功',
  });

  // 创建标签API
  const createTagApi = useApi(tagAPI.createTag, {
    showSuccessMessage: true,
    successMessage: '创建标签成功',
  });

  // 更新标签API
  const updateTagApi = useApi(tagAPI.updateTag, {
    showSuccessMessage: true,
    successMessage: '更新标签成功',
  });
  // 删除标签 - 页面层专注业务逻辑，无需手动错误处理
  const handleDelete = async (id: string) => {
    const result = await deleteTagApi.request(id);
    if (result) {
      actionRef.current?.reload();
    }
  };

  // 处理Modal提交 - 页面层专注业务逻辑，无需手动错误处理
  const handleModalFinish = async (values: TagFormDataType) => {
    let result;

    if (modalMode === 'create') {
      result = await createTagApi.request(values);
    } else {
      if (!currentTag) return false;
      result = await updateTagApi.request(currentTag.id.toString(), values);
    }

    if (result) {
      setModalVisible(false);
      setCurrentTag(null);
      modalForm.resetFields();
      actionRef.current?.reload();
      return true;
    }
    return false;
  };

  const columns: ProColumns<TagType>[] = [
    {
      title: '标签名称',
      dataIndex: 'name',
      width: 120,
      search: {
        transform: (value) => ({
          keyword: value,
        }),
      },
      render: (text) => <Tag color="blue">{text}</Tag>,
    },
    {
      title: 'URL别名',
      dataIndex: 'slug',
      width: 150,
      copyable: true,
      search: false,
    },
    {
      title: '描述',
      dataIndex: 'description',
      minWidth: 120,
      ellipsis: true,
      search: false,
      render: (text) => text || '-',
    },
    {
      title: '颜色',
      dataIndex: 'color',
      search: false,
      width: 120,
      render: (color) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div
            style={{
              width: 20,
              height: 20,
              backgroundColor: (color as string) || '#1890ff',
              borderRadius: 4,
              border: '1px solid #d9d9d9',
            }}
          />
          <span>{color || '#1890ff'}</span>
        </div>
      ),
    },
    {
      title: '状态',
      dataIndex: 'isActive',
      width: 80,
      valueType: 'select',
      valueEnum: {
        true: { text: '显示', status: 'Success' },
        false: { text: '隐藏', status: 'Default' },
      },
      render: (_, record) => (
        <Tag color={record.isActive ? 'green' : 'red'}>
          {record.isActive ? '显示' : '隐藏'}
        </Tag>
      ),
    },
    {
      title: '文章数量',
      dataIndex: 'articleCount',
      tooltip: '已发布的可见文章',
      search: false,
      width: 100,
      render: (count) => <Tag color="blue">{count}</Tag>,
    },
    {
      title: '创建时间',
      dataIndex: 'createdAt',
      search: false,
      width: 150,
      valueType: 'dateTime',
    },
    {
      title: '操作',
      valueType: 'option',
      search: false,
      fixed: 'right',
      width: 200,
      render: (_, record) => [
        <Button
          key="edit"
          type="link"
          size="small"
          icon={<EditOutlined />}
          onClick={() => {
            setCurrentTag(record);
            modalForm.setFieldsValue(record);
            setModalMode('edit');
            setModalVisible(true);
          }}
        >
          编辑
        </Button>,
        <Popconfirm
          key="delete"
          title="确定要删除这个标签吗？"
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
      <ProTable<TagType>
        headerTitle="标签管理"
        actionRef={actionRef}
        rowKey="id"
        search={{
          labelWidth: 120,
        }}
        scroll={{ x: 1100 }}
        toolBarRender={() => [
          <Button
            key="create"
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => {
              setCurrentTag(null);
              modalForm.resetFields();
              setModalMode('create');
              setModalVisible(true);
            }}
          >
            新建标签
          </Button>,
        ]}
        request={async (params) => {
          const { current, pageSize, ...formData } = params;
          const response = await getTagsApi.request({
            page: current,
            limit: pageSize,
            ...formData,
          });

          if (response) {
            return {
              data: response.items || [],
              success: true,
              total: response.total || 0,
            };
          }

          return {
            data: [],
            success: false,
            total: 0,
          };
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
        currentTag={currentTag}
        mode={modalMode}
        form={modalForm}
      />
    </PageContainer>
  );
};

export default TagList;
