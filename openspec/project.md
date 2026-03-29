# Project Context

## Purpose

本项目是面向成都桐梓林社区的社区地图与信息入口，服务在地居民与外籍居民，围绕 `events`、`discover`、`places` 三个平级模块提供活动浏览、社区内容流、地点发现与基础社区服务能力。
本期目标不是平台化多社区产品，而是先在单社区场景下跑通“可浏览、可参与、可维护”的真实闭环。

## Tech Stack

- TypeScript
- Vue 3
- uni-app（微信小程序 / H5）
- Vite
- Koa + `@koa/router`
- Zod
- Vitest
- CloudBase（HTTP 云函数 / 文档型数据库 / 云存储）
- 腾讯地图

## Project Conventions

### Code Style

统一使用 TypeScript；Prettier 规则为 `semi: true`、`singleQuote: false`、`trailingComma: none`。
ESLint 采用全仓统一配置，默认检查 TS/JS 文件；共享接口、schema、contract 优先放在 `packages/shared`，避免在 app 内重复定义。
命名上以业务模块为边界：`events`、`discover`、`places`；跨端共享能力通过 contract、schema、type 导出。

### Architecture Patterns

仓库采用 monorepo 分层：

- `apps/mobile`：uni-app 前台
- `apps/admin`：Vue 轻后台
- `apps/api`：统一 BFF / CloudBase HTTP 云函数层
- `packages/shared`：三端共享 contract、schema、type、mock client

前台与后台都通过统一 API contract 访问业务数据，不直接绕过 BFF 读写核心业务数据。

### Testing Strategy

使用 Vitest 作为统一测试框架，当前以 `packages/**` 和 `apps/**` 下的 `*.spec.ts` 为主。
优先覆盖共享 contract、schema、mock service、API 路由和关键业务流；前端页面以关键流程联调和手工验收为补充。

### Git Workflow

采用 GitHub Flow：

- 从主分支拉短生命周期功能分支
- 变更先补 OpenSpec proposal，再进入实现
- 通过 PR 审阅后合并
- 合并前至少完成 `typecheck`、`test`、`lint` 中与变更相关的校验

## Domain Context

项目当前仅服务桐梓林社区。
正式内容采用中英双字段维护；UGC 保留用户原语言。
核心模块是：

- `events`：活动、报名、票券、核销
- `discover`：帖子、评论、社区内容流
- `places`：地点列表、地图展示、详情、导航

## Important Constraints

- 当前阶段是单社区，不做多租户平台化
- 技术路线以微信生态和 CloudBase 为主，不引入独立重后端作为正式方案
- 共享字段和接口变更必须先更新 `packages/shared`
- 不手改 `dist`、`node_modules`、`.pnpm-store` 等生成目录

## External Dependencies

- CloudBase HTTP 云函数
- CloudBase 文档型数据库
- 微信云存储
- 腾讯地图
- 微信小程序运行环境
