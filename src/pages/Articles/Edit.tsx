import { articleAPI, categoryAPI, tagAPI } from '@/services';
import type { CreateArticleType } from '@/types';
import { EyeOutlined } from '@ant-design/icons';
import {
  PageContainer,
  ProForm,
  ProFormDateTimePicker,
  ProFormDigit,
  ProFormSelect,
  ProFormSwitch,
  ProFormText,
  ProFormTextArea,
  ProFormUploadButton,
} from '@ant-design/pro-components';
import MDEditor from '@uiw/react-md-editor';
import { history, useModel, useParams } from '@umijs/max';
import { Button, Card, Col, Divider, message, Row } from 'antd';
import React, { useEffect, useState } from 'react';
const ArticleEdit: React.FC = () => {
  const { id } = useParams<{ id?: string }>();
  const isEdit = !!id;
  const [form] = ProForm.useForm();
  const [content, setContent] = useState('');
  const [categories, setCategories] = useState<any[]>([]);
  const [tags, setTags] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(isEdit);
  const [article, setArticle] = useState<any>(null);

  const { initialState = {} } = useModel('@@initialState');

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

  // 加载文章数据（编辑模式）
  useEffect(() => {
    // 首先检查是否有保存的编辑状态
    const savedEditState = sessionStorage.getItem('article_edit_state');
    if (savedEditState) {
      try {
        const editState = JSON.parse(savedEditState);
        // 检查是否是当前文章的编辑状态（5分钟内有效）
        if (
          editState.articleId === id &&
          Date.now() - editState.timestamp < 5 * 60 * 1000
        ) {
          form.setFieldsValue(editState.formValues);
          setContent(editState.content);
          setInitialLoading(false);
          // 清除保存的状态
          sessionStorage.removeItem('article_edit_state');
          return;
        }
      } catch (error) {
        console.error('恢复编辑状态失败:', error);
      }
      // 清除过期或无效的状态
      sessionStorage.removeItem('article_edit_state');
    }

    if (isEdit && id) {
      const loadArticle = async () => {
        try {
          const articleData = await articleAPI.getArticle(id);
          setArticle(articleData);

          form.setFieldsValue({
            categoryId: articleData.category?.id,
            tagIds: articleData.tags?.map((tag: any) => tag.id) || [],
            ...articleData,
          });

          setContent(articleData.content || '');
        } catch (error) {
          message.error('加载文章失败');
          history.back();
        } finally {
          setInitialLoading(false);
        }
      };
      loadArticle();
    } else {
      setInitialLoading(false);
    }
  }, [isEdit, id, form]);

  // 提交表单
  const handleSubmit = async (values: CreateArticleType) => {
    if (!content.trim()) {
      message.error('请输入文章内容');
      return;
    }

    setLoading(true);
    try {
      // 获取所有表单字段的值
      const allFormValues = await form.validateFields();

      const commitData = { ...allFormValues, ...values };
      const submitData = {
        ...commitData,
        content,
        slug: commitData.slug,
        // 确保数值类型字段正确转换
        weight: commitData.weight ? Number(commitData.weight) : undefined,
        // 确保布尔类型字段正确处理
        isTop: Boolean(commitData.isTop),
        isFeatured: Boolean(commitData.isFeatured),
        allowComment: commitData.allowComment !== false, // 默认为true
      };
      if (isEdit && id) {
        await articleAPI.updateArticle(id, submitData);
        message.success('文章更新成功');
      } else {
        await articleAPI.createArticle(submitData);
        message.success('文章创建成功');
      }

      history.push('/articles');
    } catch (error) {
    } finally {
      setLoading(false);
    }
  };

  // 保存草稿
  const handleSaveDraft = async () => {
    try {
      const values = await form.validateFields(['title']);

      await handleSubmit({ ...values, status: 'draft' });
    } catch (error) {
      console.error('保存草稿失败:', error);
    }
  };

  // 发布文章
  const handlePublish = async () => {
    try {
      const values = await form.validateFields();
      await handleSubmit({ ...values, status: 'published' });
    } catch (error) {
      console.error('发布文章失败:', error);
    }
  };

  if (initialLoading) {
    return (
      <PageContainer>
        <Card loading />
      </PageContainer>
    );
  }

  return (
    <PageContainer
      title={isEdit ? '编辑文章' : '创建文章'}
      extra={[
        <Button key="cancel" onClick={() => history.back()}>
          取消
        </Button>,
        <Button
          key="preview"
          icon={<EyeOutlined />}
          onClick={async () => {
            try {
              // 获取当前表单数据
              const formValues = await form.validateFields();
              const userInfo = initialState?.userInfo;

              // 为新建文章生成临时ID
              const previewId = isEdit ? id : `temp_${Date.now()}`;

              // 保存当前编辑状态到sessionStorage
              const editState = {
                formValues,
                content,
                isEdit,
                articleId: id,
                timestamp: Date.now(),
              };
              sessionStorage.setItem(
                'article_edit_state',
                JSON.stringify(editState),
              );

              // 构造预览数据
              const previewData = {
                id: previewId,
                ...formValues,
                content,
                author: {
                  id: userInfo?.id || '',
                  username: userInfo?.username || '',
                  nickname: userInfo?.nickname || userInfo?.username || '',
                },
                createdAt: article?.createdAt || new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                viewCount: article?.viewCount || 0,
                likeCount: article?.likeCount || 0,
                shareCount: article?.shareCount || 0,
                readingTime:
                  article?.readingTime ||
                  Math.ceil((content?.length || 0) / 200),
                status: formValues.status || 'draft',
              };

              // 保存预览数据到sessionStorage
              sessionStorage.setItem(
                `article_preview_${previewId}`,
                JSON.stringify(previewData),
              );

              // 使用路由跳转而不是新窗口
              history.push(`/articles/preview/${previewId}`);
            } catch (error) {
              console.error('预览失败:', error);
              message.error('请先完善必填信息');
            }
          }}
        >
          预览
        </Button>,
        <Button key="draft" onClick={handleSaveDraft} loading={loading}>
          保存草稿
        </Button>,
        <Button
          key="publish"
          type="primary"
          onClick={handlePublish}
          loading={loading}
        >
          {isEdit ? '更新并发布' : '发布文章'}
        </Button>,
      ].filter(Boolean)}
    >
      <Row gutter={24}>
        <Col span={18}>
          <Card title="基本信息">
            <ProForm
              form={form}
              layout="vertical"
              submitter={false}
              onFinish={handleSubmit}
            >
              <ProFormText
                name="title"
                label="文章标题"
                placeholder="请输入文章标题"
                rules={[
                  { required: true, message: '请输入文章标题' },
                  { max: 100, message: '标题不能超过100个字符' },
                ]}
              />

              <ProFormText
                name="slug"
                label="URL别名"
                placeholder="自动生成或手动输入"
                tooltip="用于生成文章的URL，建议使用英文和数字"
              />

              <ProFormTextArea
                name="summary"
                label="文章摘要"
                placeholder="请输入文章摘要（可选）"
                fieldProps={{
                  rows: 3,
                  maxLength: 500,
                  showCount: true,
                }}
              />
            </ProForm>
          </Card>

          <Card title="文章内容" style={{ marginTop: 16 }}>
            <MDEditor
              value={content}
              onChange={(val) => setContent(val || '')}
              height={400}
              preview="edit"
              data-color-mode="light"
            />
          </Card>
        </Col>

        <Col span={6}>
          <Card title="发布设置" size="small">
            <ProForm form={form} layout="vertical" submitter={false}>
              <ProFormSelect
                name="status"
                label="文章状态"
                placeholder="选择状态"
                options={[
                  { label: '草稿', value: 'draft' },
                  { label: '已发布', value: 'published' },
                  { label: '已归档', value: 'archived' },
                ]}
                initialValue="draft"
              />

              <ProFormDateTimePicker
                name="publishedAt"
                label="发布时间"
                placeholder="选择发布时间"
                tooltip="留空则使用当前时间"
              />

              <ProFormSelect
                name="categoryId"
                label="分类"
                placeholder="选择分类"
                options={categories.map((cat) => ({
                  label: cat.name,
                  value: cat.id,
                }))}
              />

              <ProFormSelect
                name="tagIds"
                label="标签"
                placeholder="选择标签"
                mode="multiple"
                options={tags.map((tag) => ({
                  label: tag.name,
                  value: tag.id,
                }))}
              />

              <Divider />

              <ProFormSwitch
                name="isVisible"
                label="文章可见"
                tooltip="不可见的文章不会在前台显示"
                initialValue={true}
              />

              <ProFormSwitch
                name="isTop"
                label="置顶文章"
                tooltip="置顶的文章会显示在列表顶部"
              />

              <ProFormSwitch
                name="isFeatured"
                label="精选文章"
                tooltip="精选文章会在首页特殊展示"
              />
            </ProForm>
          </Card>

          <Card title="特色图片" size="small" style={{ marginTop: 16 }}>
            <ProForm form={form} layout="vertical" submitter={false}>
              <ProFormUploadButton
                name="coverImage"
                label="上传图片"
                max={1}
                fieldProps={{
                  name: 'file',
                  listType: 'picture-card',
                }}
                action="/api/upload"
                extra="支持 jpg、png 格式，建议尺寸 16:9"
              />
            </ProForm>
          </Card>

          <Card title="SEO设置" size="small" style={{ marginTop: 16 }}>
            <ProForm form={form} layout="vertical" submitter={false}>
              <ProFormText
                name="seoTitle"
                label="SEO标题"
                placeholder="请输入SEO标题（留空使用文章标题）"
                fieldProps={{
                  maxLength: 60,
                  showCount: true,
                }}
              />

              <ProFormTextArea
                name="seoDescription"
                label="SEO描述"
                placeholder="请输入SEO描述"
                fieldProps={{
                  rows: 2,
                  maxLength: 160,
                  showCount: true,
                }}
              />

              <ProFormText
                name="seoKeywords"
                label="SEO关键词"
                placeholder="请输入SEO关键词，用逗号分隔"
              />

              <ProFormTextArea
                name="metaDescription"
                label="Meta描述"
                placeholder="请输入Meta描述"
                fieldProps={{
                  rows: 2,
                  maxLength: 160,
                  showCount: true,
                }}
              />

              <ProFormSelect
                name="metaKeywords"
                label="Meta关键词"
                placeholder="输入关键词后按回车添加"
                mode="tags"
                fieldProps={{
                  tokenSeparators: [',', ' '],
                }}
              />

              <ProFormText
                name="socialImage"
                label="社交分享图片"
                placeholder="请输入图片URL"
              />
            </ProForm>
          </Card>

          <Card title="高级设置" size="small" style={{ marginTop: 16 }}>
            <ProForm form={form} layout="vertical" submitter={false}>
              <ProFormDigit
                name="readingTime"
                label="阅读时间（分钟）"
                placeholder="预计阅读时间"
                tooltip="留空则自动计算"
                fieldProps={{
                  min: 1,
                  max: 999,
                  precision: 0,
                }}
              />

              <ProFormDigit
                name="weight"
                label="权重"
                placeholder="0-999，数值越大排序越靠前"
                fieldProps={{
                  min: 0,
                  max: 999,
                  precision: 0,
                }}
              />

              <ProFormSwitch
                name="allowComment"
                label="允许评论"
                tooltip="是否允许用户对此文章进行评论"
                initialValue={true}
              />
            </ProForm>
          </Card>
        </Col>
      </Row>
    </PageContainer>
  );
};

export default ArticleEdit;
