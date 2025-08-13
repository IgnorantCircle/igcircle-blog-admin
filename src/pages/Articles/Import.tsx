import { articleAPI, categoryAPI, tagAPI } from '@/services';
import type {
  ArticleImportConfigType,
  ArticleImportResponseType,
  ImportProgressType,
  StartImportResponseType,
} from '@/types';
import { IMPORT_STATUS_COLORS, IMPORT_STATUS_TEXTS } from '@/types';
import { buildImportFormData, calculateMaxPollingAttempts } from '@/utils';
import {
  ArrowLeftOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  ExclamationCircleOutlined,
  InboxOutlined,
} from '@ant-design/icons';
import {
  PageContainer,
  ProCard,
  ProForm,
  ProFormSelect,
  ProFormSwitch,
} from '@ant-design/pro-components';
import { history } from '@umijs/max';
import {
  Alert,
  Button,
  message,
  Modal,
  Progress,
  Radio,
  Space,
  Table,
  Tag,
  Typography,
  Upload,
} from 'antd';
import React, { useEffect, useRef, useState } from 'react';

const { Dragger } = Upload;
const { Text, Title } = Typography;

const ArticleImport: React.FC = () => {
  const [fileList, setFileList] = useState<File[]>([]);
  const [importing, setImporting] = useState(false);
  const [progress, setProgress] = useState<ImportProgressType | null>(null);
  const [result, setResult] = useState<ArticleImportResponseType | null>(null);
  const [resultModalVisible, setResultModalVisible] = useState(false);
  const [categories, setCategories] = useState<any[]>([]);
  const [tags, setTags] = useState<any[]>([]);
  const [uploadMode, setUploadMode] = useState<'file' | 'folder'>('file'); // 上传模式
  const formRef = useRef<any>(null);
  const progressTimer = useRef<NodeJS.Timeout>();
  const pollingAttempts = useRef<number>(0);
  const maxPollingAttempts = useRef<number>(0);

  // 获取分类和标签数据
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [categoriesRes, tagsRes] = await Promise.all([
          categoryAPI.getCategories({ limit: 100 }),
          tagAPI.getTags({ limit: 100 }),
        ]);

        setCategories(
          categoriesRes.items.map((cat: any) => ({
            label: cat.name,
            value: cat.name,
          })),
        );

        setTags(
          tagsRes.items.map((tag: any) => ({
            label: tag.name,
            value: tag.name,
          })),
        );
      } catch (error) {
        console.error('获取分类和标签失败:', error);
      }
    };

    fetchData();
  }, []);

  // 文件上传配置
  const uploadProps = {
    name: 'files',
    multiple: true,
    accept: '.md',
    ...(uploadMode === 'folder' ? { directory: true } : {}), // 根据模式决定是否支持文件夹上传
    beforeUpload: (file: File) => {
      // 检查文件类型（只支持.md格式）
      const isMarkdownFile =
        file.name.endsWith('.md') || file.type === 'text/markdown';

      if (!isMarkdownFile) {
        message.error(`${file.name} 不是支持的文件格式，只支持 .md 格式`);
        return false;
      }

      // 检查文件大小
      const isLt10M = file.size / 1024 / 1024 < 10;
      if (!isLt10M) {
        message.error(`${file.name} 文件大小不能超过 10MB`);
        return false;
      }

      // 检查文件数量限制（最多100个文件）
      if (fileList.length >= 100) {
        message.error('最多只能上传100个文件');
        return false;
      }

      // 检查是否已存在同名文件
      const existingFile = fileList.find((f) => f.name === file.name);
      if (existingFile) {
        message.warning(`文件 ${file.name} 已存在，将跳过`);
        return false;
      }

      setFileList((prev) => [...prev, file]);
      return false; // 阻止自动上传
    },
    onRemove: (file: any) => {
      setFileList((prev) => prev.filter((f) => f.name !== file.name));
    },
    fileList: fileList.map((file, index) => {
      let status: 'uploading' | 'done' | 'error' = 'done';

      if (importing) {
        if (progress?.currentFile === file.name) {
          status = 'uploading';
        } else if (progress && progress.processedFiles > 0) {
          // 检查该文件是否已处理完成
          const processedIndex = fileList.findIndex(
            (f) => f.name === file.name,
          );
          if (processedIndex < progress.processedFiles) {
            status = 'done'; // 使用'done'代替'success'
          } else {
            status = 'uploading';
          }
        } else {
          status = 'uploading';
        }
      }

      return {
        uid: file.name + '_' + index,
        name: file.name,
        status,
        size: file.size,
        percent:
          importing && progress?.currentFile === file.name
            ? progress.progress
            : undefined,
      };
    }),
  };

  // 重置状态
  const handleReset = () => {
    setFileList([]);
    setImporting(false);
    setProgress(null);
    setResult(null);
    setResultModalVisible(false);
    setUploadMode('file'); // 重置上传模式为单文件模式

    if (progressTimer.current) {
      clearInterval(progressTimer.current);
    }

    // 重置轮询计数器
    pollingAttempts.current = 0;
    maxPollingAttempts.current = 0;

    formRef.current?.resetFields();
  };
  // 开始轮询进度
  const startProgressPolling = (taskId: string) => {
    const pollProgress = async () => {
      try {
        // 检查是否超过最大轮询次数
        if (pollingAttempts.current >= maxPollingAttempts.current) {
          message.error('导入超时，请检查文件大小和网络连接');
          setImporting(false);
          if (progressTimer.current) {
            clearInterval(progressTimer.current);
          }
          return;
        }

        pollingAttempts.current += 1;
        const progressData = await articleAPI.getImportProgress(taskId);
        setProgress(progressData);

        if (
          progressData.status === 'completed' ||
          progressData.status === 'failed'
        ) {
          // 进度数据中已包含最终结果
          if (progressData.results) {
            const resultData: ArticleImportResponseType = {
              totalFiles: progressData.totalFiles,
              successCount: progressData.successCount,
              failureCount: progressData.failureCount,
              skippedCount: progressData.skippedCount,
              results: progressData.results,
              startTime: progressData.startTime,
              endTime: Date.now(),
              duration: Date.now() - progressData.startTime,
            };
            setResult(resultData);
          }
          setImporting(false);
          setResultModalVisible(true);

          if (progressTimer.current) {
            clearInterval(progressTimer.current);
          }
        }
      } catch (error: any) {
        console.error('获取进度失败:', error);
        message.error('获取导入进度失败');
      }
    };

    // 立即执行一次
    pollProgress();

    // 每2秒轮询一次
    progressTimer.current = setInterval(pollProgress, 2000);
  };
  // 开始导入（支持同步和异步两种模式）
  const handleImport = async (values: any) => {
    if (fileList.length === 0) {
      message.error('请选择要导入的文件');
      return;
    }

    try {
      setImporting(true);

      const config: ArticleImportConfigType = {
        defaultCategory: values.defaultCategory,
        defaultTags: values.defaultTags || [],
        autoPublish: values.autoPublish || false,
        overwriteExisting: values.overwriteExisting || false,
        importMode: values.importMode || 'loose',
        skipInvalidFiles: values.skipInvalidFiles !== false,
      };

      // 构建FormData
      const formData = buildImportFormData(fileList, config);

      // 根据文件数量选择导入模式
      if (fileList.length <= 10) {
        // 少量文件使用同步导入
        const response: ArticleImportResponseType =
          await articleAPI.importArticles(formData);
        setResult(response);
        setImporting(false);
        handleReset();
        message.success('导入完成');
      } else {
        // 大量文件使用异步导入
        const response: StartImportResponseType =
          await articleAPI.importArticlesAsync(formData);
        message.success('导入任务已创建，正在处理中...');

        // 设置轮询超时限制（10分钟，每2秒轮询一次）
        maxPollingAttempts.current = calculateMaxPollingAttempts(10, 2);
        pollingAttempts.current = 0;

        // 开始轮询进度
        startProgressPolling(response.taskId);
      }
    } catch (error: any) {
      message.error(error.message || '导入失败');
      setImporting(false);
    }
  };

  // 返回文章列表
  const handleBack = () => {
    history.push('/articles');
  };

  // 关闭结果弹窗
  const handleCloseResultModal = () => {
    setResultModalVisible(false);
  };

  // 结果表格列定义
  const resultColumns = [
    {
      title: '文件路径',
      dataIndex: 'filePath',
      key: 'filePath',
    },
    {
      title: '状态',
      key: 'status',
      render: (record: any) => {
        let color = 'green';
        let text = '成功';

        if (!record.success) {
          if (record.skipped) {
            color = 'orange';
            text = '跳过';
          } else {
            color = 'red';
            text = '失败';
          }
        }

        return <Tag color={color}>{text}</Tag>;
      },
    },
    {
      title: '文章标题',
      dataIndex: 'title',
      key: 'title',
    },
    {
      title: '错误信息',
      dataIndex: 'error',
      key: 'error',
      render: (error: string) =>
        error ? <Text type="danger">{error}</Text> : '-',
    },
  ];

  return (
    <PageContainer
      header={{
        title: '文章导入',
        breadcrumb: {
          items: [{ title: '文章管理' }, { title: '文章导入' }],
        },
        extra: [
          <Button key="back" icon={<ArrowLeftOutlined />} onClick={handleBack}>
            返回列表
          </Button>,
        ],
      }}
    >
      <ProCard>
        <ProForm
          formRef={formRef}
          onFinish={handleImport}
          submitter={{
            searchConfig: {
              submitText: importing ? '导入中...' : '开始导入',
            },
            render: (props) => {
              return [
                <Button
                  key="submit"
                  type="primary"
                  loading={importing}
                  disabled={fileList.length === 0 || importing}
                  onClick={() => props.form?.submit?.()}
                >
                  {importing ? '导入中...' : '开始导入'}
                </Button>,
                <Button
                  key="reset"
                  onClick={() => {
                    props.form?.resetFields?.();
                    setFileList([]);
                  }}
                >
                  重置
                </Button>,
              ];
            },
          }}
        >
          {/* 选择文件 */}
          <ProCard title="选择文件" style={{ marginBottom: 24 }}>
            <div style={{ marginBottom: 16 }}>
              <Radio.Group
                value={uploadMode}
                onChange={(e) => {
                  setUploadMode(e.target.value);
                  // 切换模式时清空文件列表
                  setFileList([]);
                }}
                style={{ marginBottom: 16 }}
              >
                <Radio.Button value="file">文件上传</Radio.Button>
                <Radio.Button value="folder">文件夹上传</Radio.Button>
              </Radio.Group>
            </div>

            <Alert
              message="支持的文件格式"
              description={`支持 Markdown (.md) 格式的文件，${
                uploadMode === 'folder'
                  ? '支持文件夹批量上传'
                  : '支持单个文件或多个文件上传'
              }，单个文件大小不超过 10MB，最多100个文件`}
              type="info"
              showIcon
              style={{ marginBottom: 16 }}
            />
            <Dragger {...uploadProps} style={{ marginBottom: 16 }}>
              <p className="ant-upload-drag-icon">
                <InboxOutlined />
              </p>
              <p className="ant-upload-text">
                {uploadMode === 'folder'
                  ? '点击选择文件夹或拖拽文件夹到此区域上传'
                  : '点击选择文件或拖拽文件到此区域上传'}
              </p>
              <p className="ant-upload-hint">支持格式：.md（Markdown文件）</p>
              <p className="ant-upload-hint">
                {uploadMode === 'folder'
                  ? '支持文件夹批量上传，最多100个文件'
                  : '支持单个或多个文件上传，最多100个文件'}
              </p>
            </Dragger>
          </ProCard>

          {/* 导入配置 */}
          <ProCard title="导入配置">
            <ProFormSelect
              name="defaultCategory"
              label="默认分类"
              placeholder="请选择默认分类"
              tooltip="当文章没有指定分类时使用的默认分类"
              options={categories}
              showSearch
              allowClear
            />

            <ProFormSelect
              name="defaultTags"
              label="默认标签"
              placeholder="请选择默认标签"
              tooltip="当文章没有指定标签时使用的默认标签"
              options={tags}
              mode="multiple"
              showSearch
              allowClear
            />

            <ProFormSwitch
              name="autoPublish"
              label="自动发布"
              tooltip="导入后自动发布文章，否则保存为草稿"
            />

            <ProFormSwitch
              name="overwriteExisting"
              label="覆盖已存在的文章"
              tooltip="如果文章已存在（根据slug判断），是否覆盖"
            />

            <ProFormSelect
              name="importMode"
              label="导入模式"
              placeholder="请选择导入模式"
              tooltip="strict: 严格模式，遇到错误停止导入；loose: 宽松模式，跳过错误继续导入"
              initialValue="loose"
              options={[
                { label: '宽松模式', value: 'loose' },
                { label: '严格模式', value: 'strict' },
              ]}
            />

            <ProFormSwitch
              name="skipInvalidFiles"
              label="跳过无效文件"
              tooltip="是否跳过无效的文件继续处理其他文件"
              initialValue={true}
            />
          </ProCard>
        </ProForm>

        {/* 导入进度 */}
        {importing && (
          <ProCard title="导入进度" style={{ marginTop: 24 }}>
            <Space direction="vertical" style={{ width: '100%' }}>
              {progress ? (
                <>
                  <div>
                    <Text strong>状态：</Text>
                    <Tag color={IMPORT_STATUS_COLORS[progress.status]}>
                      {IMPORT_STATUS_TEXTS[progress.status]}
                    </Tag>
                  </div>

                  <div>
                    <Text strong>进度：</Text>
                    <Progress
                      percent={progress.progress}
                      status={
                        progress.status === 'failed' ? 'exception' : 'active'
                      }
                      format={() =>
                        `${progress.processedFiles}/${progress.totalFiles}`
                      }
                    />
                  </div>

                  {progress.currentFile && (
                    <div>
                      <Text strong>当前处理：</Text>
                      <Text>{progress.currentFile}</Text>
                    </div>
                  )}

                  {progress.error && (
                    <Alert
                      message="处理过程中发现错误"
                      description={progress.error}
                      type="error"
                      showIcon
                    />
                  )}
                </>
              ) : (
                <div>
                  <Text strong>状态：</Text>
                  <Tag color="blue">准备中...</Tag>
                  <div style={{ marginTop: 16 }}>
                    <Progress percent={0} status="active" />
                  </div>
                </div>
              )}
            </Space>
          </ProCard>
        )}
      </ProCard>

      {/* 导入结果弹窗 */}
      <Modal
        title="导入结果"
        open={resultModalVisible}
        onCancel={handleCloseResultModal}
        width={800}
        footer={[
          <Button key="continue" type="primary" onClick={handleReset}>
            继续导入
          </Button>,
          <Button key="back" onClick={handleBack}>
            返回列表
          </Button>,
        ]}
      >
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          {result?.successCount === result?.totalFiles ? (
            <CheckCircleOutlined style={{ fontSize: 48, color: '#52c41a' }} />
          ) : result?.failureCount === result?.totalFiles ? (
            <CloseCircleOutlined style={{ fontSize: 48, color: '#f5222d' }} />
          ) : (
            <ExclamationCircleOutlined
              style={{ fontSize: 48, color: '#faad14' }}
            />
          )}
          <Title level={3} style={{ marginTop: 16 }}>
            导入完成
          </Title>
        </div>

        {/* 导入统计 */}
        <ProCard title="导入统计" style={{ marginBottom: 24 }}>
          <Space size="large">
            <div>
              <Text strong>总计：</Text>
              <Text>{result?.totalFiles || 0}</Text>
            </div>
            <div>
              <Text strong>成功：</Text>
              <Text style={{ color: '#52c41a' }}>
                {result?.successCount || 0}
              </Text>
            </div>
            <div>
              <Text strong>失败：</Text>
              <Text style={{ color: '#f5222d' }}>
                {result?.failureCount || 0}
              </Text>
            </div>
            <div>
              <Text strong>跳过：</Text>
              <Text style={{ color: '#faad14' }}>
                {result?.skippedCount || 0}
              </Text>
            </div>
          </Space>
        </ProCard>

        {/* 详细结果 */}
        <ProCard title="详细结果">
          <Table
            columns={resultColumns}
            dataSource={result?.results || []}
            rowKey={(record, index) => index?.toString() || '0'}
            pagination={{ pageSize: 10 }}
            scroll={{ y: 300 }}
          />
        </ProCard>
      </Modal>
    </PageContainer>
  );
};

export default ArticleImport;
