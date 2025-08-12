import type { TagFormDataType, TagType } from '@/types';
import {
  ModalForm,
  ProFormSwitch,
  ProFormText,
  ProFormTextArea,
} from '@ant-design/pro-components';
import { ColorPicker, Form } from 'antd';
import type { Color } from 'antd/es/color-picker';
import React from 'react';

interface ModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onFinish: (values: TagFormDataType) => Promise<boolean>;
  currentTag?: TagType | null;
  mode: 'create' | 'edit';
  form: any;
}

const EditModal: React.FC<ModalProps> = ({
  open,
  onOpenChange,
  onFinish,
  mode,
  form,
}) => {
  const title = mode === 'create' ? '创建标签' : '编辑标签';

  return (
    <ModalForm
      title={title}
      width={600}
      form={form}
      open={open}
      onOpenChange={onOpenChange}
      onFinish={onFinish}
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
          onChange={(color: Color) => {
            form.setFieldValue('color', color.toHexString());
          }}
        />
      </Form.Item>

      <ProFormSwitch
        name={mode === 'create' ? 'isActive' : 'isVisible'}
        label="是否显示"
        initialValue={mode === 'create' ? true : undefined}
      />
    </ModalForm>
  );
};

export default EditModal;
