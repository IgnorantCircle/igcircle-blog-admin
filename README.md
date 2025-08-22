# igCircle Blog 管理后台

## 项目介绍

基于 Umi 和 Ant Design Pro 构建。提供了完整的博客内容管理功能，包括文章管理、文章统计分析、分类管理、标签管理、评论管理和用户管理等核心功能，能够高效地管理博客内容。

## 项目展示

![首页](https://blog-1306207361.cos.ap-guangzhou.myqcloud.com/blog/1%E6%88%AA%E5%B1%8F2025-08-22%2012.45.56.webp?imageSlim) ![文章列表](https://blog-1306207361.cos.ap-guangzhou.myqcloud.com/blog/2%E6%88%AA%E5%B1%8F2025-08-22%2012.46.22.webp?imageSlim) ![文章统计分析](https://blog-1306207361.cos.ap-guangzhou.myqcloud.com/blog/3%E6%88%AA%E5%B1%8F2025-08-22%2013.04.07.webp?imageSlim) ![分类管理](https://blog-1306207361.cos.ap-guangzhou.myqcloud.com/blog/4%E6%88%AA%E5%B1%8F2025-08-22%2013.04.28.webp?imageSlim)

## 功能特性

### 数据总览

- 博客核心数据统计展示（文章、分类、标签、评论、用户等）
- 数据可视化图表展示

### 文章管理

- 文章列表展示与搜索
- 文章创建、编辑、预览
- 支持 SEO 设置，自定义 Meta 数据（标题、描述、关键词、封面图等）
- Markdown 编辑器支持
- 文章发布、归档、置顶、精选等状态管理
- 文章批量操作（发布、归档、删除）
- 文章导入（支持批量导入，自动识别标题、内容、分类、标签、封面图等）
- 文章导出（支持 JSON、CSV、Markdown 格式）
- 文章统计分析

### 分类管理

- 分类列表展示与搜索
- 分类创建、编辑、删除
- 分类关联文章统计

### 标签管理

- 标签列表展示与搜索
- 标签创建、编辑、删除
- 标签关联文章统计

### 评论管理

- 评论列表展示与搜索
- 评论编辑、隐藏、置顶、删除
- 评论详情查看
- 评论批量操作

### 用户管理

- 用户列表展示与搜索
- 用户状态管理

### 安全特性

- 基于 RSA 加密的登录认证
- 权限控制
- 操作日志记录

## 技术栈

- **前端框架**：React、UmiJS
- **UI 组件**：Ant Design、@ant-design/pro-components
- **状态管理**：UmiJS Model
- **路由管理**：UmiJS Router
- **HTTP 请求**：UmiJS Request
- **Markdown 支持**：react-markdown、react-syntax-highlighter
- **图表可视化**：@ant-design/plots
- **加密工具**：node-forge
- **开发工具**：TypeScript、ESLint、Prettier、Husky

## 安装与运行

### 环境要求

- Node.js 16+
- npm 或 pnpm

### 安装依赖

```bash
# 使用 npm
npm install

# 或使用 pnpm
pnpm install
```

### 开发环境运行

```bash
# 使用 npm
npm run dev

# 或使用 pnpm
pnpm dev
```

### 生产环境构建

```bash
# 使用 npm
npm run build

# 或使用 pnpm
pnpm build
```

## 项目结构

```
├── src/                    # 源代码目录
│   ├── access.ts           # 权限控制
│   ├── app.tsx             # 应用入口
│   ├── assets/             # 静态资源
│   ├── components/         # 公共组件
│   ├── hooks/              # 自定义 Hooks
│   ├── pages/              # 页面组件
│   │   ├── Articles/       # 文章管理
│   │   ├── Categories/     # 分类管理
│   │   ├── Comments/       # 评论管理
│   │   ├── Home/           # 首页/仪表板
│   │   ├── Login/          # 登录页面
│   │   ├── Tags/           # 标签管理
│   │   └── Users/          # 用户管理
│   ├── services/           # API 服务
│   ├── types/              # TypeScript 类型定义
│   └── utils/              # 工具函数
├── .umirc.ts               # UmiJS 配置
├── package.json            # 项目依赖
└── tsconfig.json           # TypeScript 配置
```

## 开发指南

### 添加新页面

1. 在 `src/pages` 目录下创建新的页面组件
2. 在 `.umirc.ts` 中添加路由配置

### 添加新 API

1. 在 `src/types` 目录下定义相关类型
2. 在 `src/services` 目录下添加 API 调用函数

## 项目链接

- 用户端：[igcircle-blog-client](https://github.com/IgnorantCircle/igcircle-blog-client)
- 管理端：[igcircle-blog-admin](https://github.com/IgnorantCircle/igcircle-blog-admin)
- 服务端：[igcircle-blog-server](https://github.com/IgnorantCircle/igcircle-blog-server)

## 贡献指南

1. Fork 本仓库
2. 创建您的特性分支 (`git checkout -b feature/amazing-feature`)
3. 提交您的更改 (`git commit -m 'Add some amazing feature'`)
4. 推送到分支 (`git push origin feature/amazing-feature`)
5. 打开一个 Pull Request

## 许可证

[MIT](LICENSE)

## 联系方式

- 作者：igCircle
- 邮箱：igCircle@163.com
