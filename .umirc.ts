import { defineConfig } from '@umijs/max';

export default defineConfig({
  antd: {},
  access: {},
  model: {},
  initialState: {},
  request: {},
  layout: {
    title: 'igCircle Blog',
  },
  routes: [
    {
      path: '/login',
      component: './Login',
      layout: false,
    },
    {
      path: '/',
      redirect: '/home',
    },
    {
      name: '首页',
      path: '/home',
      component: './Home',
    },
    {
      name: '分类管理',
      path: '/categories',
      component: './Categories',
      icon: 'FolderOutlined',
    },
    {
      name: '标签管理',
      path: '/tags',
      component: './Tags',
      icon: 'TagOutlined',
    },
  ],
  npmClient: 'pnpm',
});
