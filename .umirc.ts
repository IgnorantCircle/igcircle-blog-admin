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
      name: '数据总览',
      path: '/home',
      component: './Home',
      icon: 'DashboardOutlined',
    },
    {
      name: '文章管理',
      path: '/articles',
      icon: 'FileTextOutlined',
      routes: [
        {
          path: '/articles',
          component: './Articles',
        },
        {
          path: '/articles/create',
          component: './Articles/Edit',
          hideInMenu: true,
        },
        {
          path: '/articles/edit/:id',
          component: './Articles/Edit',
          hideInMenu: true,
        },
        {
          path: '/articles/preview/:id',
          component: './Articles/Preview',
          hideInMenu: true,
        },
      ],
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
    {
      name: '用户管理',
      path: '/users',
      component: './Users',
      icon: 'UserOutlined',
    },
  ],
  npmClient: 'pnpm',
});
