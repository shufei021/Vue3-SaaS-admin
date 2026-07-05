# AGENTS.md - SaaS Admin 项目指南

## 项目概览

基于 Vue 3 + Vite + TypeScript 的 SaaS 后台管理系统模板。

## 技术栈

- **框架**: Vue 3 (Composition API + `<script setup>`)
- **构建**: Vite 6
- **语言**: TypeScript 5
- **状态管理**: Pinia
- **路由**: Vue Router 4
- **UI 组件**: Element Plus
- **图表**: ECharts 5 + vue-echarts
- **HTTP**: Axios (Mock 模式)
- **样式**: SCSS (无 TailwindCSS)
- **进度条**: NProgress

## 目录结构

```
src/
├── api/          # API 请求层 (request.ts + mock.ts + index.ts)
├── components/   # 公共组件
│   ├── common/   # 通用组件
│   └── layout/   # 布局组件 (AppLayout, AppSidebar, AppHeader, AppTagBar)
├── composables/  # 组合式函数
├── router/       # 路由配置
├── store/        # Pinia Store (app, tag, tenant)
├── styles/       # 样式体系 (variables, mixins, theme, global)
├── types/        # TypeScript 类型定义
├── utils/        # 工具函数
└── views/        # 页面视图
    ├── dashboard/    # 仪表盘
    ├── user/         # 用户管理
    ├── role/         # 角色权限管理
    ├── tenant/       # 租户管理
    ├── system/       # 系统设置
    ├── log/          # 操作日志
    └── analytics/    # 数据看板
```

## 命令

- `pnpm dev` - 启动开发服务器
- `pnpm build` - 构建生产版本
- `pnpm lint` - ESLint 检查
- `pnpm format` - Prettier 格式化

## 关键设计

- **主题切换**: CSS 变量 + Element Plus 暗色模式 (`html.dark` / `html.light`)
- **多租户**: Pinia store (`useTenantStore`) 管理当前租户，请求头自动注入 `X-Tenant-Id`
- **Mock 数据**: `src/api/mock.ts` 统一管理，`src/api/index.ts` 封装异步调用
- **标签页**: `useTagStore` 管理多页签，路由切换自动添加
- **侧边栏**: 可折叠，根据路由自动生成菜单
- **SCSS**: 全局变量在 `variables.scss`，混入在 `mixins.scss`，通过 vite `additionalData` 自动注入
