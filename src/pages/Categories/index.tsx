import { categoryAPI } from '@/services/category';
import type { CategoryFormDataType, CategoryItemType } from '@/types';
import { DeleteOutlined, EditOutlined, PlusOutlined } from '@ant-design/icons';
import {
  ActionType,
  PageContainer,
  ProColumns,
  ProTable,
} from '@ant-design/pro-components';
import { Button, Card, Col, Popconfirm, Row, Space, Tag, Tree } from 'antd';
import type { DataNode } from 'antd/es/tree';
import React, { useRef, useState } from 'react';
import EditModal from './EditModal';

const CategoryList: React.FC = () => {
  const actionRef = useRef<ActionType>();
  const [modalVisible, setModalVisible] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [currentCategory, setCurrentCategory] =
    useState<CategoryItemType | null>(null);
  const [categoryTree, setCategoryTree] = useState<CategoryItemType[]>([]);
  const [viewMode, setViewMode] = useState<'table' | 'tree'>('table');
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

  // 处理Modal提交
  const handleModalFinish = async (values: CategoryFormDataType) => {
    try {
      if (modalMode === 'create') {
        await categoryAPI.createCategory(values);
      } else {
        if (!currentCategory) return false;
        await categoryAPI.updateCategory(currentCategory.id, values);
      }
      setModalVisible(false);
      setCurrentCategory(null);
      actionRef.current?.reload();
      loadCategoryTree();
      return true;
    } catch (error) {
      return false;
    }
  };

  // 转换为树形数据
  const convertToTreeData = (categories: CategoryItemType[]): DataNode[] => {
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
                setModalMode('edit');
                setModalVisible(true);
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

  const columns: ProColumns<CategoryItemType>[] = [
    {
      title: '分类名称',
      dataIndex: 'name',
      minWidth: 200,
      search: {
        transform: (value) => ({
          keyword: value,
        }),
      },
    },
    {
      title: 'URL别名',
      dataIndex: 'slug',
      minWidth: 150,
      copyable: true,
      search: false,
    },
    {
      title: '描述',
      dataIndex: 'description',
      minWidth: 200,
      ellipsis: true,
      search: false,
      render: (text) => text || '-',
    },
    {
      title: '父分类',
      dataIndex: ['parent', 'name'],
      minWidth: 90,
      search: false,
      render: (text) => text || '顶级分类',
    },
    {
      title: '排序',
      dataIndex: 'sortOrder',
      width: 80,
      sorter: true,
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
      tooltip: '已发布的可见文章',
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
            setModalMode('edit');
            setModalVisible(true);
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
        <Col span={viewMode === 'tree' ? 16 : 24}>
          <ProTable<CategoryItemType>
            headerTitle="分类管理"
            actionRef={actionRef}
            rowKey="id"
            scroll={{ x: 1100 }}
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
                onClick={() => {
                  setCurrentCategory(null);
                  setModalMode('create');
                  setModalVisible(true);
                }}
              >
                新建分类
              </Button>,
            ]}
            request={async (params) => {
              try {
                const { current, pageSize, ...formData } = params;

                const response = await categoryAPI.getCategories({
                  page: current,
                  limit: pageSize,
                  ...formData,
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
          <Col span={8}>
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

      <EditModal
        open={modalVisible}
        onOpenChange={setModalVisible}
        onFinish={handleModalFinish}
        currentCategory={currentCategory}
        mode={modalMode}
      />
    </PageContainer>
  );
};

export default CategoryList;
