import type { UserFormDataType, UserItemType } from '@/types';
import {
  ModalForm,
  ProFormSelect,
  ProFormText,
} from '@ant-design/pro-components';
import React from 'react';

interface ModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onFinish: (values: UserFormDataType) => Promise<boolean>;
  currentUser?: UserItemType | null;
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
  const title = mode === 'create' ? '新建用户' : '编辑用户';

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
        name="username"
        label="用户名"
        placeholder="请输入用户名"
        disabled={mode === 'edit'}
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

      {mode === 'create' && (
        <ProFormText.Password
          name="password"
          label="密码"
          placeholder="请输入密码"
          rules={[
            { required: true, message: '请输入密码' },
            { min: 6, message: '密码长度至少6个字符' },
          ]}
        />
      )}

      <ProFormText
        name="nickname"
        label="昵称"
        placeholder="请输入昵称（可选）"
      />

      <ProFormSelect
        name="role"
        label="角色"
        placeholder="请选择角色"
        initialValue={mode === 'create' ? 'user' : undefined}
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
        initialValue={mode === 'create' ? 'active' : undefined}
        options={[
          { label: '正常', value: 'active' },
          { label: '未激活', value: 'inactive' },
          { label: '已封禁', value: 'banned' },
        ]}
        rules={[{ required: true, message: '请选择状态' }]}
      />
    </ModalForm>
  );
};

export default EditModal;
