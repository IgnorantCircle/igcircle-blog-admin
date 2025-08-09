import { authAPI } from '@/services';
import { LoginDto } from '@/types';
import rsaUtil from '@/utils/rsa';
import { LockOutlined, UserOutlined } from '@ant-design/icons';
import { history } from '@umijs/max';
import { Button, Card, Form, Input, message, Typography } from 'antd';
import React, { useEffect, useState } from 'react';
import styles from './index.less';

const { Title } = Typography;

const Login: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();

  // 组件挂载时获取RSA公钥
  useEffect(() => {
    const initRsaKey = async () => {
      try {
        const response = await authAPI.getRsaPublicKey();
        rsaUtil.setPublicKey(response.publicKey);
      } catch (error) {
        console.error('获取RSA公钥失败:', error);
        message.error('初始化加密失败，请刷新页面重试');
      }
    };

    initRsaKey();
  }, []);

  const handleSubmit = async (values: LoginDto) => {
    setLoading(true);
    try {
      // 检查RSA公钥是否已设置
      if (!rsaUtil.hasPublicKey()) {
        message.error('加密初始化失败，请刷新页面重试');
        return;
      }

      // 加密密码
      const encryptedPassword = rsaUtil.encrypt(values.password);

      const response = await authAPI.adminLogin({
        ...values,
        password: encryptedPassword,
      });

      // 存储token和用户信息
      localStorage.setItem('token', response.accessToken);
      localStorage.setItem('userInfo', JSON.stringify(response.user));

      message.success('登录成功');

      // 跳转到仪表板
      history.push('/home');
    } catch (error: any) {
      console.error('登录失败:', error);
      message.error(error.message || '登录失败，请检查用户名和密码');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <Card className={styles.loginCard}>
          <div className={styles.header}>
            <Title level={2} className={styles.title}>
              管理后台登录
            </Title>
            <p className={styles.subtitle}>请输入您的管理员账号和密码</p>
          </div>

          <Form
            form={form}
            name="login"
            onFinish={handleSubmit}
            autoComplete="off"
            size="large"
          >
            <Form.Item
              name="username"
              rules={[{ required: true, message: '请输入用户名或邮箱' }]}
            >
              <Input
                prefix={<UserOutlined />}
                placeholder="用户名或邮箱"
                autoComplete="username"
              />
            </Form.Item>

            <Form.Item
              name="password"
              rules={[{ required: true, message: '请输入密码' }]}
            >
              <Input.Password
                prefix={<LockOutlined />}
                placeholder="密码"
                autoComplete="current-password"
              />
            </Form.Item>

            <Form.Item>
              <Button
                type="primary"
                htmlType="submit"
                loading={loading}
                block
                className={styles.submitButton}
              >
                {loading ? '登录中...' : '登录'}
              </Button>
            </Form.Item>
          </Form>
        </Card>
      </div>
    </div>
  );
};

export default Login;
