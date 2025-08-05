import { categoryAPI } from '@/services/category';
import type { Category, CreateCategoryDto, UpdateCategoryDto } from '@/types';
import { formatTimestamp } from '@/utils/format';
import { DeleteOutlined, EditOutlined, PlusOutlined } from '@ant-design/icons';
import {
  ActionType,
  ModalForm,
  PageContainer,
  ProColumns,
  ProFormDigit,
  ProFormSelect,
  ProFormSwitch,
  ProFormText,
  ProFormTextArea,
  ProTable,
} from '@ant-design/pro-components';
import { Button, Card, Col, Popconfirm, Row, Space, Tag, Tree } from 'antd';
import type { DataNode } from 'antd/es/tree';
import React, { useRef, useState } from 'react';

const CategoryList: React.FC = () => {
  const actionRef = useRef<ActionType>();
  const [createModalVisible, setCreateModalVisible] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [currentCategory, setCurrentCategory] = useState<Category | null>(null);
  const [categoryTree, setCategoryTree] = useState<Category[]>([]);
  const [viewMode, setViewMode] = useState<'table' | 'tree'>('table');

  // 生成slug
  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9\u4e00-\u9fa5]+/g, '-')
      .replace(/^-+|-+$/g, '');
  };

  // 加载分类树
  const loadCategoryTree = async () => {
    try {
      const categories = await categoryAPI.getCategoryTree();
      setCategoryTree(categories || []);
    } catch (error) {}
  };

  // 删除分类
  const handleDelete = async (id: string) => {
    try {
      await categoryAPI.deleteCategory(id);
      actionRef.current?.reload();
      loadCategoryTree();
    } catch (error) {}
  };

  // 创建分类
  const handleCreate = async (values: CreateCategoryDto) => {
    try {
      await categoryAPI.createCategory({
        ...values,
        slug: values.slug || generateSlug(values.name),
      });
      setCreateModalVisible(false);
      actionRef.current?.reload();
      loadCategoryTree();
      return true;
    } catch (error) {
      return false;
    }
  };

  // 更新分类
  const handleUpdate = async (values: UpdateCategoryDto) => {
    if (!currentCategory) return false;
    try {
      await categoryAPI.updateCategory(currentCategory.id, {
        ...values,
        slug: values.slug || (values.name && generateSlug(values.name)),
      });
      setEditModalVisible(false);
      setCurrentCategory(null);
      actionRef.current?.reload();
      loadCategoryTree();
      return true;
    } catch (error) {
      return false;
    }
  };

  // 转换为树形数据
  const convertToTreeData = (categories: Category[]): DataNode[] => {
    return categories.map((category) => ({
      key: category.id,
      title: (
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <span>
            {category.name}
            {!category.isActive && (
              <Tag color="red" style={{ marginLeft: 8 }}>
                隐藏
              </Tag>
            )}
            <Tag color="blue" style={{ marginLeft: 8 }}>
              {category.articleCount}
            </Tag>
          </span>
          <Space>
            <Button
              type="link"
              size="small"
              icon={<EditOutlined />}
              onClick={() => {
                setCurrentCategory(category);
                setEditModalVisible(true);
              }}
            >
              编辑
            </Button>
            <Popconfirm
              title="确定要删除这个分类吗？"
              onConfirm={() => handleDelete(category.id)}
              okText="确定"
              cancelText="取消"
            >
              <Button type="link" size="small" danger icon={<DeleteOutlined />}>
                删除
              </Button>
            </Popconfirm>
          </Space>
        </div>
      ),
      children: category.children
        ? convertToTreeData(category.children)
        : undefined,
    }));
  };

  const columns: ProColumns<Category>[] = [
    {
      title: '分类名称',
      dataIndex: 'name',
      width: 200,
    },
    {
      title: 'URL别名',
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
      title: '父分类',
      dataIndex: ['parent', 'name'],
      width: 150,
      render: (text) => text || '顶级分类',
    },
    {
      title: '排序',
      dataIndex: 'levelShow',
      width: 80,
      search: false,
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
      width: 100,
      search: false,
      render: (count) => <Tag color="blue">{count}</Tag>,
    },
    {
      title: '创建时间',
      dataIndex: 'createdAt',
      width: 150,
      search: false,
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
            setCurrentCategory(record);
            setEditModalVisible(true);
          }}
        >
          编辑
        </Button>,
        <Popconfirm
          key="delete"
          title="确定要删除这个分类吗？"
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
      <Row gutter={16}>
        <Col span={viewMode === 'tree' ? 12 : 24}>
          <ProTable<Category>
            headerTitle="分类管理"
            actionRef={actionRef}
            rowKey="id"
            scroll={{ x: 'auto' }}
            search={{
              labelWidth: 120,
            }}
            toolBarRender={() => [
              <Button
                key="tree"
                onClick={() => {
                  setViewMode(viewMode === 'tree' ? 'table' : 'tree');
                  if (viewMode === 'table') {
                    loadCategoryTree();
                  }
                }}
              >
                {viewMode === 'tree' ? '列表视图' : '树形视图'}
              </Button>,
              <Button
                key="create"
                type="primary"
                icon={<PlusOutlined />}
                onClick={() => setCreateModalVisible(true)}
              >
                新建分类
              </Button>,
            ]}
            request={async (params = {}) => {
              const { current, pageSize, parent = {}, ...restParams } = params;
              try {
                const response = await categoryAPI.getCategories({
                  page: current,
                  limit: pageSize,
                  parentName: parent.name,
                  ...restParams,
                });
                return {
                  data: response.items || [],
                  success: true,
                  total: response?.total || 0,
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
        </Col>

        {viewMode === 'tree' && (
          <Col span={12}>
            <Card title="分类树形结构">
              <Tree
                showLine
                defaultExpandAll
                treeData={convertToTreeData(categoryTree)}
              />
            </Card>
          </Col>
        )}
      </Row>

      {/* 创建分类弹窗 */}
      <ModalForm
        title="创建分类"
        width={600}
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
          label="分类名称"
          placeholder="请输入分类名称"
          rules={[
            { required: true, message: '请输入分类名称' },
            { max: 50, message: '分类名称不能超过50个字符' },
          ]}
        />

        <ProFormText
          name="slug"
          label="URL别名"
          placeholder="自动生成或手动输入"
          tooltip="用于生成分类的URL，建议使用英文和数字"
        />

        <ProFormTextArea
          name="description"
          label="分类描述"
          placeholder="请输入分类描述（可选）"
          fieldProps={{
            rows: 3,
            maxLength: 200,
            showCount: true,
          }}
        />

        <ProFormSelect
          name="parentId"
          label="父分类"
          placeholder="选择父分类（可选）"
          request={async () => {
            try {
              const response = await categoryAPI.getCategories({ limit: 100 });
              return (response.items || []).map((cat: Category) => ({
                label: cat.name,
                value: cat.id,
              }));
            } catch (error) {
              return [];
            }
          }}
        />

        <ProFormDigit
          name="levelShow"
          label="排序"
          placeholder="请输入排序值"
          min={0}
          max={999}
          initialValue={0}
          tooltip="数值越小排序越靠前"
        />

        <ProFormSwitch name="isActive" label="是否显示" initialValue={true} />
      </ModalForm>

      {/* 编辑分类弹窗 */}
      <ModalForm
        title="编辑分类"
        width={600}
        open={editModalVisible}
        onOpenChange={setEditModalVisible}
        onFinish={handleUpdate}
        initialValues={currentCategory || {}}
        modalProps={{
          destroyOnClose: true,
        }}
      >
        <ProFormText
          name="name"
          label="分类名称"
          placeholder="请输入分类名称"
          rules={[
            { required: true, message: '请输入分类名称' },
            { max: 50, message: '分类名称不能超过50个字符' },
          ]}
        />

        <ProFormText
          name="slug"
          label="URL别名"
          placeholder="自动生成或手动输入"
          tooltip="用于生成分类的URL，建议使用英文和数字"
        />

        <ProFormTextArea
          name="description"
          label="分类描述"
          placeholder="请输入分类描述（可选）"
          fieldProps={{
            rows: 3,
            maxLength: 200,
            showCount: true,
          }}
        />

        <ProFormSelect
          name="parentId"
          label="父分类"
          placeholder="选择父分类（可选）"
          request={async () => {
            try {
              const response = await categoryAPI.getCategories({ limit: 100 });
              return (response.items || [])
                .filter((cat: Category) => cat.id !== currentCategory?.id)
                .map((cat: Category) => ({
                  label: cat.name,
                  value: cat.id,
                }));
            } catch (error) {
              return [];
            }
          }}
        />

        <ProFormDigit
          name="levelShow"
          label="排序"
          placeholder="请输入排序值"
          min={0}
          max={999}
          tooltip="数值越小排序越靠前"
        />

        <ProFormSwitch name="isActive" label="是否显示" />
      </ModalForm>
    </PageContainer>
  );
};

export default CategoryList;
