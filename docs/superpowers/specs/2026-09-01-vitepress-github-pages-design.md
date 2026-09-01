# 后端与 AI 面试手册 VitePress 站点设计

- 目标仓库：`lovelsf-int/backend-ai-interview-handbook-zh-cn`
- 功能分支：`feat/vitepress-site`
- 目标地址：`https://lovelsf-int.github.io/backend-ai-interview-handbook-zh-cn/`
- 设计日期：2026-09-01
- 状态：已确认完整迁移范围

## 1. 背景与约束

远程仓库当前为空，但已有 AI Agent、Java、Elasticsearch 和金融支付等源资料，以及 2026-08-23 的知识库设计提案。新站点需要兼顾系统学习、面试速答、生产排障和架构评审，同时避免把 DOCX/PDF 直接作为主阅读入口。

本次遵循以下约束：

1. Markdown 是网站和仓库的主阅读格式。
2. 目录和 URL 使用 ASCII，页面标题与正文使用简体中文。
3. 不提交源 DOCX/PDF，不发布来源不明图片和第三方长篇正文。
4. 迁移全部 11 份既定专题资料，并补充 1 份 Java/AI Agent 定制综合手册作为后端基础事实源；按主题合并、拆章和去重，不做逐文件机械复制。
5. Elasticsearch 的容量数字属于当前项目案例或压测起点，不描述为通用最佳值。
6. Redis 等尚未完成版本校准的专题只建立导航和状态说明，不标记为 `verified`。
7. GitHub Pages 使用静态构建，不引入服务端数据库、登录或动态后端。

## 2. 目标与首版成功标准

首版交付一个可持续迭代的完整技术文档站点，而不是空白主题模板。用户已明确选择“迁移全部材料”。

验收标准：

- VitePress 在 Node.js 20 环境中可以安装、构建和预览。
- 首页、顶部导航、左侧专题导航、右侧页内目录和中文本地搜索可用。
- 建立 Java/JVM、MySQL、Kafka、Redis、Elasticsearch、AI Agent、金融支付与系统设计入口。
- 12 份源资料均有明确目标章节和迁移记录；Java/JVM、MySQL、AI Agent、Kafka、Redis、Elasticsearch、金融支付与 DDD 均形成可阅读正文。
- 相同主题的重复内容合并到 canonical 页面，辅助材料中的独有内容进入专题附录或历史说明。
- 所有主干页面包含统一 Front Matter；草稿和已校准内容状态可区分。
- 文档质量脚本检查 Front Matter、重复标题、内部链接和禁止的主导航附件类型。
- GitHub Actions 同时执行质量检查、VitePress 构建和 GitHub Pages 部署。
- 仓库根目录提供本地运行、内容贡献和发布说明。

## 3. 技术方案

选择 VitePress，而不是复刻参考站点的 VuePress 1.9.9 技术栈。

理由：

- 与 Markdown-first 内容模型匹配。
- 默认提供响应式布局、深色模式、代码高亮、代码复制和页面大纲。
- 内置本地搜索，首版不依赖外部搜索服务。
- 构建链更轻，适合 GitHub Pages。
- 后续可以通过主题扩展加入 Mermaid、Giscus、统计和自动导航。

核心依赖保持最小化：

- `vitepress`：静态文档站点。
- `markdownlint-cli2`：Markdown 基础风格检查。
- 自有 Node.js 校验脚本：仓库特定内容规则。

不在首版引入数据库、CMS、Algolia、评论系统或复杂主题框架。

## 4. 目录设计

```text
backend-ai-interview-handbook-zh-cn/
├── .github/workflows/
│   └── deploy.yml
├── docs/
│   ├── .vitepress/
│   │   ├── config.mts
│   │   └── theme/
│   │       ├── index.ts
│   │       └── custom.css
│   ├── public/
│   │   └── logo.svg
│   ├── index.md
│   ├── guide/
│   ├── java/
│   ├── jvm/
│   ├── mysql/
│   ├── kafka/
│   ├── redis/
│   ├── elasticsearch/
│   ├── ai-agent/
│   ├── finance-payment-ddd/
│   ├── system-design/
│   └── migration-manifest.md
├── scripts/
│   └── validate-content.mjs
├── tests/
│   └── site-structure.test.mjs
├── README.md
├── ROADMAP.md
├── CONTRIBUTING.md
├── STYLE-GUIDE.md
├── SOURCES.md
├── package.json
└── package-lock.json
```

仓库治理文件保留在根目录；面向读者的网站内容全部放在 `docs/`。这能避免 VitePress 配置与知识库治理文件混杂，同时保留 GitHub 原生阅读体验。

## 5. 导航与信息架构

顶部导航按使用目的组织：

- 学习路线
- 后端基础
- 数据与中间件
- Elasticsearch
- AI Agent
- 金融支付与 DDD

左侧导航按专题展示章节；右侧导航由二至四级标题自动生成。

完整内容范围：

1. 学习路线与文档使用说明。
2. AI Agent：LLM 与 Agent 基础、架构编排、Prompt、工具/MCP/A2A、RAG、规划恢复、Memory、Multi-Agent、生产可靠性、评估安全、SOC 项目深挖和完整题库。
3. Kafka：核心模型、KRaft、日志存储、Producer、Consumer、复制恢复、Exactly-Once、重试一致性、生产治理、排障与题库。
4. Redis：线程模型、数据结构、过期淘汰、持久化、缓存一致性、高可用、Cluster、事务/Lua、分布式锁、BigKey/HotKey 与面试题；未经版本校准的说法标记为 `reviewing`。
5. Elasticsearch：架构、Lucene、写入、查询、Mapping、分片容量、DSL、JVM/OS、故障排查、企业案例、重建索引、治理、项目案例和题库。
6. 金融支付：领域基础、SOLID、设计模式、DDD、幂等一致性、状态机、账务、对账、风控、安全、容量、案例与题库。
7. DDD 支付订阅：限界上下文、聚合、防腐层、状态机、Outbox、数据模型、续费调度、演进路线和评审追问。
8. Java/JVM、MySQL 与系统设计：从综合定制手册提取对应章节，并与上述专题交叉链接。

### 5.1 源资料清单与事实源

| 编号 | 源资料 | 角色 | 迁移决策 |
|---|---|---|---|
| 1 | `AI_Agent工程师_P7-P8完整面试手册_2026版_追问答案完整版(1).docx` | AI Agent canonical | 按模块拆章，保留完整问答结构 |
| 2 | `AI_Agent_面试题_资深级参考答案.md` | AI Agent 辅助题库 | 去重后补充场景题与速答 |
| 3 | `Kafka核心知识点_P7P8面试强化版.docx` | Kafka canonical | 作为主干，保留版本校准口径 |
| 4 | `Kafka 核心技术全解析(1).docx` | Kafka legacy 辅助 | 独有原理进入附录，Kafka 3.x 口径标注历史版本 |
| 5 | `Kafka Exactly-Once 精确一次语义完全解析.docx` | Kafka EOS 专题辅助 | 与 canonical EOS 章节合并，纠正绝对化表述 |
| 6 | `redis.docx` | Redis 原始辅助 | 结构化提取后逐项校准，默认 `reviewing` |
| 7 | `Redis P7 核心知识&面试终极手册（架构级·可直接背诵） (2).docx` | Redis 辅助 | 合并独有题目，不直接标记 `verified` |
| 8 | `Elasticsearch_深度原理_生产调优_面试题完整版 (1).docx` | Elasticsearch canonical | 按主题拆章，容量数字标注适用边界 |
| 9 | `P8金融支付_SOLID设计模式_完整面试资料_Java版(2).docx` | 金融支付 canonical | 按领域与架构主题拆章 |
| 10 | `DDD支付订阅系统_高清架构评审版(1).docx` | DDD 图示辅助 | 可追溯内容重绘为 Mermaid，不提交原图 |
| 11 | `DDD支付订阅系统_架构设计面试版_架构图版(1).docx` | DDD 结构辅助 | 与金融支付主干合并成订阅案例专题 |
| 12 | `金余概_资深Java_AI-Agent开发_定制面试手册_v5.0_全球数据库容灾回切深挖版.docx` | Java/JVM/MySQL/系统设计综合源 | 提取后端基础与项目深挖章节，AI Agent 重复内容仅建立交叉链接 |

`docs/migration-manifest.md` 记录每个源资料对应的目标章节、迁移状态、去重说明和校准状态，确保“全部迁移”可以核对，而不是凭页面数量判断。

## 6. 文档模型

进入主导航的专题文档使用统一元数据：

```yaml
---
title: Elasticsearch 搜索执行过程
description: Query Phase、Fetch Phase 与协调节点行为
status: verified
baseline: Elasticsearch 8.x/9.x
last_verified: 2026-09-01
level: P7/P8
source: 自有项目经验与官方文档校准
---
```

状态：

- `verified`：已完成事实和版本校准。
- `reviewing`：结构可读，仍需逐项校准。
- `draft`：仅用于占位或后续迁移，不进入推荐学习路径。
- `legacy`：只解释旧版本和迁移背景。

内容模板优先包含：一句话结论、90 秒面试回答、原理、执行链路、异常路径、生产配置、性能和容量、排障、P7/P8 追问、版本差异与来源。

## 7. 构建与部署流程

```text
Markdown / 配置变更
        ↓
内容质量测试与 Markdown lint
        ↓
VitePress 静态构建
        ↓
上传 GitHub Pages artifact
        ↓
部署到 github-pages environment
```

VitePress 的公共路径固定为：

```ts
base: '/backend-ai-interview-handbook-zh-cn/'
```

GitHub Actions 在 `main` 推送和手动触发时运行。部署权限限制为：

- `contents: read`
- `pages: write`
- `id-token: write`

不使用个人访问令牌发布 Pages。

## 8. 测试与质量门禁

实现采用测试先行：先编写站点结构测试并确认在空仓库上失败，再搭建最小实现使其通过。

自动检查包括：

1. 必备配置、首页、导航目录和工作流存在。
2. `base` 与仓库名一致。
3. `package.json` 包含测试、检查、构建和预览脚本。
4. 主导航 Markdown 包含必填 Front Matter。
5. 页面没有重复的一级标题。
6. Markdown 内部相对链接指向存在的文件或目录。
7. 主导航不把 `.docx`、`.pdf` 当作唯一入口。
8. VitePress 生产构建成功。

首版不把外部链接在线可达性作为阻塞门禁，避免第三方站点波动导致发布失败；外部链接检查后续定时执行。

## 9. 错误处理与回滚

- 内容检查失败：阻止构建和部署，输出文件与规则位置。
- VitePress 构建失败：不上传 Pages artifact。
- Pages 部署失败：保留上一个成功版本，检查 Actions 日志后重跑。
- 新内容事实存在争议：降低为 `reviewing`，不写成确定性最佳实践。
- 错误发布：通过 Git revert 回退对应提交，再触发部署。

## 10. 实施边界

本轮包含：

- 仓库基础设施和治理文件。
- VitePress 页面、导航、搜索、主题和 GitHub Pages 工作流。
- 内容质量测试和生产构建验证。
- 完整迁移上述 12 份资料：所有独有知识点进入主干、附录或明确的 legacy 页面，重复内容只保留一份 canonical 表述。
- Java/JVM、MySQL 与系统设计内容从综合定制手册中提取；若该手册没有覆盖对应主题，则只建立交叉导航，不凭空扩写。
- 提交到功能分支并推送远程，等待合并到 `main` 后正式发布。

本轮不包含：

- 逐字保留重复内容、错误旧口径和纯排版噪声；“全部迁移”指知识点全覆盖与可追溯，不等于 11 份附件原样转码。
- 发布原始 DOCX/PDF 或未知版权图片。
- 自动修改另一个 `system-design-notes-zh-cn` 仓库。
- 配置自定义域名、访问统计、评论和外部搜索服务。

## 11. 完成定义

以下条件全部满足才可声明实施完成：

- 结构测试和内容质量检查通过。
- Markdown lint 通过。
- VitePress 生产构建退出码为 0。
- Git diff 和提交内容仅包含本项目文件，不含源资料和密钥。
- 功能分支已推送到远程。
- 若仓库允许创建/合并分支，则 Pages 工作流已触发；若权限或仓库设置阻止发布，必须明确报告剩余的仓库设置步骤。
