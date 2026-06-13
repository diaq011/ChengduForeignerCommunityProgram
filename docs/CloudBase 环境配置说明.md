# CloudBase 环境配置说明

## 当前状态

当前仓库已经保留 CloudBase HTTP 云函数入口和 `API_PROVIDER=cloudbase`
模式，但真实 CloudBase 文档型数据库与云存储 SDK 尚未接入。

在未设置 `CLOUDBASE_ENV_ID` 时，`apps/api` 会使用与现有 mock provider
一致的 contract-compatible 本地 provider，确保 mobile、admin 和 API 的接口形态
可以先联调，不再因为 cloudbase provider 全 stub 而阻塞。

## 本地运行

```bash
corepack pnpm dev:api
```

默认使用 mock provider。

如需验证 cloudbase provider 入口不报错：

```bash
API_PROVIDER=cloudbase corepack pnpm dev:api
```

## 环境变量

```bash
API_PROVIDER=mock
API_BASE_URL=http://localhost:8787
CLOUDBASE_ENV_ID=
TENCENT_MAP_KEY=
```

## 后续接入真实 CloudBase

真实接入时应保持 `apps/api/src/providers/types.ts` 中的 `ApiProvider`
接口不变，在 `apps/api/src/providers/cloudbase/index.ts` 内替换为真实数据库、
云存储和临时链接实现。

优先级建议：

1. `places`：列表、详情、地图 marker、后台新增/编辑。
2. `discover`：帖子、评论、举报、后台治理。
3. `events`：列表、详情、报名、票券、核销。
4. `files`：上传申请、文件绑定、私有文件临时链接。
