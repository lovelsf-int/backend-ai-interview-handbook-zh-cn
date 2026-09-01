# 后端与 AI 面试手册

面向资深 Java、AI Agent、搜索与金融支付岗位的中文 P7/P8 技术手册。仓库同时服务于系统学习、面试速答、生产排障和架构评审。

## 在线阅读

发布地址：<https://lovelsf-int.github.io/backend-ai-interview-handbook-zh-cn/>

合并到 `main` 后，GitHub Actions 会先执行测试、Markdown 与内容校验，再构建并发布 GitHub Pages。仓库首次发布前，需要在 **Settings → Pages → Build and deployment** 中将 Source 设为 **GitHub Actions**。

## 本地运行

```bash
npm ci
npm run docs:dev
```

完整校验：

```bash
npm run check
npm run docs:build
```

## 内容范围

- Java、JVM、Spring、MySQL 与系统设计
- Kafka、Redis、Elasticsearch
- AI Agent、RAG、Tool Calling、MCP、Memory 与评估
- 金融支付、SOLID、设计模式、DDD、账务与一致性

当前包含 12 份自有源资料迁移形成的 90 余个正文页面。各页 Front Matter 中的 `status`、`baseline` 与 `last_verified` 用于标识内容校准状态。

网站正文位于 [`docs/`](docs/)，源 DOCX/PDF 不进入 Git 历史。完整迁移规则见 [`docs/migration-manifest.md`](docs/migration-manifest.md)。

## 仓库分工

本仓库承载技术专题、原理、生产实践和面试追问；系统级案例库由 `system-design-notes-zh-cn` 维护。两者通过延伸阅读关联，不复制相同正文。

## 内容状态

- `verified`：已完成版本和事实校准。
- `reviewing`：内容已迁移，仍需逐项复核。
- `draft`：结构草稿，不进入推荐学习路线。
- `legacy`：历史版本或旧口径说明。

## 贡献

提交前请阅读 [CONTRIBUTING.md](CONTRIBUTING.md) 和 [STYLE-GUIDE.md](STYLE-GUIDE.md)。
