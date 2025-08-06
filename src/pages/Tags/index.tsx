import { tagAPI } from '@/services';
import type { CreateTagDto, Tag as TagItem, UpdateTagDto } from '@/types';
import { formatTimestamp } from '@/utils/format';
import { DeleteOutlined, EditOutlined, PlusOutlined } from '@ant-design/icons';
import {
  ActionType,
  ModalForm,
  PageContainer,
  ProColumns,
  ProFormSwitch,
  ProFormText,
  ProFormTextArea,
  ProTable,
} from '@ant-design/pro-components';
import { Button, ColorPicker, Form, Popconfirm, Tag } from 'antd';
import type { Color } from 'antd/es/color-picker';
import React, { useRef, useState } from 'react';
const TagList: React.FC = () => {
  const actionRef = useRef<ActionType>();
  const [createModalVisible, setCreateModalVisible] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [currentTag, setCurrentTag] = useState<TagItem | null>(null);
  const [createForm] = Form.useForm();
  const [editForm] = Form.useForm();

  // 预设颜色
  const presetColors = [
    '#f50',
    '#2db7f5',
    '#87d068',
    '#108ee9',
    '#f56a00',
    '#722ed1',
    '#eb2f96',
    '#52c41a',
    '#13c2c2',
    '#1890ff',
    '#faad14',
    '#a0d911',
  ];

  // 生成slug
  const generateSlug = (name: string) => {
    if (!name) return '';
    return name
      .toLowerCase()
      .replace(/[^a-z0-9\u4e00-\u9fa5]+/g, '-')
      .replace(/^-+|-+$/g, '');
  };

  // 删除标签
  const handleDelete = async (id: string) => {
    try {
      await tagAPI.deleteTag(id);
      actionRef.current?.reload();
    } catch (error) {}
  };

  // 创建标签
  const handleCreate = async (values: CreateTagDto) => {
    try {
      await tagAPI.createTag({
        ...values,
        slug: values.slug || (values.name && generateSlug(values.name)),
      });
      setCreateModalVisible(false);
      createForm.resetFields();
      actionRef.current?.reload();
      return true;
    } catch (error) {
      return false;
    }
  };

  // 更新标签
  const handleUpdate = async (values: UpdateTagDto) => {
    if (!currentTag) return false;
    try {
      await tagAPI.updateTag(currentTag.id, {
        ...values,
        slug: values.slug || (values.name && generateSlug(values.name)),
      });
      setEditModalVisible(false);
      setCurrentTag(null);
      editForm.resetFields();
      actionRef.current?.reload();
      return true;
    } catch (error) {
      return false;
    }
  };

  const columns: ProColumns<TagItem>[] = [
    {
      title: '标签名称',
      dataIndex: 'name',
      width: 200,
      render: (text) => <div>{text}</div>,
    },
    {
      title: 'Url别名',
      dataIndex: 'slug',
      width: 150,
      copyable: true,
    },
    {
      title: '描述',
      dataIndex: 'description',
      width: 300,
      ellipsis: true,
      render: (text) => text || '-',
    },
    {
      title: '颜色',
      dataIndex: 'color',
      search: false,
      width: 100,
      render: (color) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div
            style={{
              width: 20,
              height: 20,
              backgroundColor: typeof color === 'string' ? color : '#1890ff',
              borderRadius: 4,
              border: '1px solid #d9d9d9',
            }}
          />
          <span>{color}</span>
        </div>
      ),
    },
    {
      title: '状态',
      dataIndex: 'isActive',
      width: 100,
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
      search: false,
      width: 100,
      render: (count) => <Tag color="blue">{count}</Tag>,
    },
    {
      title: '创建时间',
      search: false,
      dataIndex: 'createdAt',
      width: 150,
      valueType: 'dateTime',
      render: (_, record) => formatTimestamp(record.updatedAt),
    },
    {
      title: '操作',
      valueType: 'option',
      width: 150,
      render: (_, record) => [
        <Button
          key="edit"
          type="link"
          size="small"
          icon={<EditOutlined />}
          onClick={() => {
            setCurrentTag(record);
            editForm.setFieldsValue(record);
            setEditModalVisible(true);
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
      <ProTable<TagItem>
        headerTitle="标签管理"
        actionRef={actionRef}
        rowKey="id"
        scroll={{ x: 'auto' }}
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
            新建标签
          </Button>,
        ]}
        request={async (params = {}) => {
          try {
            const { current, pageSize, ...restParams } = params;

            const response = await tagAPI.getTags({
              page: current,
              limit: pageSize,
              ...restParams,
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

      {/* 创建标签弹窗 */}
      <ModalForm
        title="创建标签"
        width={600}
        form={createForm}
        open={createModalVisible}
        onOpenChange={setCreateModalVisible}
        onFinish={handleCreate}
        modalProps={{
          destroyOnClose: true,
          maskClosable: false,
        }}
      >
        <ProFormText
          name="name"
          label="标签名称"
          placeholder="请输入标签名称"
          rules={[
            { required: true, message: '请输入标签名称' },
            { max: 30, message: '标签名称不能超过30个字符' },
          ]}
        />

        <ProFormText
          name="slug"
          label="URL别名"
          placeholder="自动生成或手动输入"
          tooltip="用于生成标签的URL，建议使用英文和数字"
        />

        <ProFormTextArea
          name="description"
          label="标签描述"
          placeholder="请输入标签描述（可选）"
          fieldProps={{
            rows: 3,
            maxLength: 200,
            showCount: true,
          }}
        />

        <Form.Item name="color" label="标签颜色" tooltip="选择标签的显示颜色">
          <ColorPicker
            presets={[
              {
                label: '推荐',
                colors: presetColors,
              },
            ]}
            onChange={(color: Color) => {
              createForm.setFieldValue('color', color.toHexString());
            }}
          />
        </Form.Item>

        <ProFormSwitch name="isActive" label="是否显示" initialValue={true} />
      </ModalForm>

      {/* 编辑标签弹窗 */}
      <ModalForm
        title="编辑标签"
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
          name="name"
          label="标签名称"
          placeholder="请输入标签名称"
          rules={[
            { required: true, message: '请输入标签名称' },
            { max: 30, message: '标签名称不能超过30个字符' },
          ]}
          fieldProps={{
            onChange: (e) => {
              const name = e.target.value;
              if (name && !editForm.getFieldValue('slug')) {
                editForm.setFieldValue('slug', generateSlug(name));
              }
            },
          }}
        />

        <ProFormText
          name="slug"
          label="URL别名"
          placeholder="自动生成或手动输入"
          tooltip="用于生成标签的URL，建议使用英文和数字"
        />

        <ProFormTextArea
          name="description"
          label="标签描述"
          placeholder="请输入标签描述（可选）"
          fieldProps={{
            rows: 3,
            maxLength: 200,
            showCount: true,
          }}
        />

        <Form.Item name="color" label="标签颜色" tooltip="选择标签的显示颜色">
          <ColorPicker
            presets={[
              {
                label: '推荐',
                colors: presetColors,
              },
            ]}
            onChange={(color: Color) => {
              editForm.setFieldValue('color', color.toHexString());
            }}
          />
        </Form.Item>

        <ProFormSwitch name="isActive" label="是否显示" />
      </ModalForm>
    </PageContainer>
  );
};

export default TagList;
