import { categoryAPI } from '@/services/category';
import type { CategoryFormDataType, CategoryItemType } from '@/types';
import {
  ModalForm,
  ProFormDigit,
  ProFormSelect,
  ProFormSwitch,
  ProFormText,
  ProFormTextArea,
} from '@ant-design/pro-components';
import React from 'react';

interface ModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onFinish: (values: CategoryFormDataType) => Promise<boolean>;
  currentCategory?: CategoryItemType | null;
  mode: 'create' | 'edit';
}

const EditModal: React.FC<ModalProps> = ({
  open,
  onOpenChange,
  onFinish,
  currentCategory,
  mode,
}) => {
  const title = mode === 'create' ? '创建分类' : '编辑分类';
  const initialValues = mode === 'edit' ? currentCategory || {} : {};

  return (
    <ModalForm
      title={title}
      width={600}
      open={open}
      onOpenChange={onOpenChange}
      onFinish={onFinish}
      initialValues={initialValues}
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
              .filter((cat: CategoryItemType) =>
                mode === 'edit' ? cat.id !== currentCategory?.id : true,
              )
              .map((cat: CategoryItemType) => ({
                label: cat.name,
                value: cat.id,
              }));
          } catch (error) {
            return [];
          }
        }}
      />

      <ProFormDigit
        name="sortOrder"
        label="排序"
        placeholder="请输入排序值"
        min={0}
        max={999}
        initialValue={0}
        tooltip="数值越小排序越靠前"
      />

      <ProFormSwitch
        name={mode === 'create' ? 'isActive' : 'isActive'}
        label="是否显示"
        initialValue={mode === 'create' ? true : undefined}
      />
    </ModalForm>
  );
};

export default EditModal;
