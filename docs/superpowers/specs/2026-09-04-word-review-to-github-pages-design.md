# Word Review to GitHub Pages Skill 设计规范

## 1. 目标

创建一个可复用 Skill：当用户提供 Word 文档并要求整理到 GitHub Pages 时，先进行技术与结构审核，再按用户本次明确指定的 GitHub 仓库实际结构完成 Markdown 化、归档、质量校验与发布准备。

该 Skill 不绑定固定发布仓库。即使上一次使用过某个仓库，每一次新的执行都必须重新询问用户本次使用哪个仓库。

## 2. 强制仓库确认门禁

### 2.1 规则

在任何读取目标仓库结构、生成目标路径、修改文件、创建分支、提交或发布操作之前，Skill 必须询问：

> 这次要整理到哪个 GitHub 仓库？请给我 `owner/repo` 或仓库 URL。

只有用户在当前执行中明确给出仓库后，才能继续。

### 2.2 禁止行为

- 禁止把上一次使用的仓库当作默认仓库。
- 禁止根据项目上下文、历史对话或仓库名称猜测目标仓库。
- 禁止在用户未确认仓库时创建、修改、删除任何 GitHub 文件。
- 禁止以“常用仓库”“当前项目仓库”“最近使用仓库”为由跳过确认。

### 2.3 当前执行与未来执行的区别

本设计文档和 Skill 本身存放在 `lovelsf-int/backend-ai-interview-handbook-zh-cn`，这是本次 Skill 实现的宿主仓库；这不构成未来 Word 发布任务的默认目标仓库。

## 3. 总体流程

```text
收到 Word
   ↓
强制询问本次目标仓库
   ↓
用户明确 owner/repo 或仓库 URL
   ↓
读取仓库元数据、README、站点配置、风格指南、构建脚本
   ↓
解析 Word 内容
   ↓
技术审核 + 事实一致性审核 + 结构审核
   ↓
形成审核结论并执行可安全自动修订项
   ↓
按目标站点规范重构为 Markdown
   ↓
归档到合适专题并更新必要导航/索引
   ↓
运行仓库已有质量门禁和站点构建
   ↓
全部通过后才允许提交/发布
   ↓
检查提交与 GitHub Pages/Actions 结果
```

## 4. 仓库适配策略

Skill 必须先探测目标仓库，而不是假设所有站点都使用 VitePress。

优先读取：

1. `README.md`
2. `STYLE-GUIDE.md`、`CONTRIBUTING.md` 或同类规范
3. `package.json`
4. `docs/.vitepress/config.*`、`vite.config.*`、`mkdocs.yml`、`_config.yml` 等站点配置
5. `.github/workflows/*pages*`、`deploy*` 或其他构建部署工作流
6. 目标专题的 `index.md`、同级 Markdown 文档和资源目录

如果仓库提供已有 lint、test、content validation、build 命令，优先复用，不重复创造一套规则。

对当前宿主仓库 `lovelsf-int/backend-ai-interview-handbook-zh-cn`：

- 站点框架：VitePress。
- 内容目录：`docs/`。
- 质量入口：`npm run check`。
- 构建入口：`npm run docs:build`。
- 发布方式：`main` 分支触发 GitHub Actions Pages 部署。
- 内容风格：遵循仓库根目录 `STYLE-GUIDE.md`。

## 5. Word 审核模型

### 5.1 审核维度

Skill 至少检查：

- 技术事实是否错误。
- 原理解释是否存在因果倒置、概念混淆或边界缺失。
- API、框架、JDK、数据库、中间件或 AI 组件信息是否存在明显版本过时。
- 文档内部的数字、架构、流程、术语是否互相矛盾。
- 面试回答是否缺乏结论、原理、异常路径、容量、监控或追问层次。
- 是否和目标仓库已有内容重复或冲突。
- 代码块、表格、图片、公式、架构图是否能在 Pages 中稳定呈现。
- 是否存在明显敏感信息、密钥、账号、内部地址或不应公开的信息。

### 5.2 严重级别

- `Blocker`：技术结论错误、严重事实冲突、敏感信息、无法安全发布的问题。未解决前禁止发布。
- `Major`：重要内容缺失、关键数字口径冲突、版本错误、架构解释不完整。需要修订或明确标记。
- `Minor`：措辞、格式、标题层级、重复表达等可安全自动修复项。

## 6. 事实修订边界

### 6.1 可以自动修订

对于有充分依据的通用技术事实，可直接纠正，例如：

- Java/JVM、MySQL、Redis、Kafka、Elasticsearch 等公开技术语义。
- 明确可由公式验证的容量计算。
- Markdown、VitePress、GitHub Pages 的格式与构建问题。
- 明显拼写、术语、标题和结构问题。

### 6.2 不得编造或擅自选择

以下属于用户或项目事实，发生冲突时不得猜测：

- 线上 QPS、DAU、TPS、数据量、存储量、延迟。
- 公司、项目、团队和职责事实。
- 生产架构真实部署数量、节点数、分片数、地域拓扑。
- 用户个人工作经历、业务结果和收益数据。

如果不同来源冲突，必须标记为 `Major: 项目事实冲突`，保留冲突口径并要求用户确认后再发布相关结论。

## 7. Pages 内容重构规范

当目标仓库没有更严格的自定义规范时，面试型技术文章采用：

1. 一句话结论。
2. 90 秒面试回答。
3. 核心概念与边界。
4. 底层原理和完整链路。
5. 异常路径与恢复。
6. 性能、容量与监控。
7. P7/P8 追问。
8. 版本差异与来源。

如果目标仓库已有风格指南，则以目标仓库规则优先。

## 8. 资源转换

### 8.1 图片

- 提取 Word 中有意义的图片并迁移到目标仓库已有静态资源目录。
- 文件名使用目标仓库允许的命名规则；没有规则时使用小写 ASCII、数字和连字符。
- Markdown 中使用相对路径或目标框架推荐路径。
- 不将纯装饰图片、Word 图标、空白占位资源写入站点。

### 8.2 表格和代码

- 普通 Word 表格转换为标准 Markdown 表格。
- 超宽、合并单元格复杂或含多段代码的表格，重构为分节列表或多个表格。
- 代码块必须标注语言；不能可靠识别语言时使用 `text`。

### 8.3 架构图

- 能准确表达为 Mermaid 的简单关系图、流程图或时序图可转为 Mermaid。
- 不为了“更漂亮”而重绘导致业务含义改变。
- 原图具有重要视觉信息时保留原图并配套文字说明。

## 9. 归档与导航

Skill 根据文档主题和目标仓库现有信息架构选择归档位置，不创建无必要的新一级专题。

需要时更新：

- 专题 `index.md`。
- VitePress sidebar/nav 或目标框架同类配置。
- `README.md` 目录。
- `SOURCES.md`、`CHANGELOG.md` 或仓库已有同类文件。

导航更新必须保持原有排序风格，不得因单篇文章重排整个站点。

## 10. 发布质量门禁

发布前必须：

1. 运行目标仓库已有测试、lint 和内容校验。
2. 运行静态站点 build。
3. 检查新增或修改文档的内部链接。
4. 检查图片引用是否存在。
5. 检查导航链接是否指向实际文件。
6. 确认无 `Blocker` 审核项。
7. 确认未解决的项目事实冲突没有被伪装成确定事实发布。

任一强制门禁失败，禁止宣称发布成功。

## 11. GitHub 写入策略

默认原则：

- 读取和分析可以在仓库确认后立即执行。
- 写入前再次依据仓库权限和当前分支策略选择直接提交或分支/PR。
- 已有成熟 Pages 流程且用户明确要求直接发布时，可以提交到发布分支。
- 仓库有保护策略或现有贡献流程时，遵循该流程。
- 任何删除现有内容的操作都必须有明确必要性，避免为了整理文档破坏其他页面。

## 12. 审核输出

每次执行至少给出：

- 目标仓库。
- Word 原始标题或文件名。
- 审核结果：Blocker/Major/Minor 数量与关键问题。
- 自动修订摘要。
- 最终归档路径。
- 修改的导航/索引文件。
- 执行的质量命令及结果。
- Git commit/PR 信息。
- Pages/Actions 发布状态（如果本次包含发布）。

## 13. Skill 文件结构

```text
skills/
└── word-review-to-github-pages/
    ├── SKILL.md
    ├── references/
    │   ├── review-rubric.md
    │   ├── interview-content-standard.md
    │   └── github-pages-rules.md
    └── tests/
        ├── repository-confirmation-case.md
        ├── technical-error-case.md
        ├── conflicting-project-data-case.md
        ├── duplicate-content-case.md
        └── malformed-word-structure-case.md
```

`SKILL.md` 保持精简，重型审核标准放入 `references/`，压力场景放入 `tests/`。

## 14. Skill 发现条件

名称：`word-review-to-github-pages`

Frontmatter description 只描述触发条件，不总结执行流程：

```yaml
---
name: word-review-to-github-pages
description: Use when a user provides a Word document and wants its content reviewed, reorganized, or published into a GitHub Pages documentation repository.
---
```

## 15. 验收标准

Skill 只有同时满足以下条件才算完成：

- 新执行未指定仓库时，首先询问目标仓库且不进行 GitHub 写操作。
- 上次执行使用仓库 A，本次仍会重新询问，而不是自动沿用 A。
- 通用技术错误能被发现和纠正。
- 用户项目事实冲突不会被模型自行“统一口径”。
- Word 能被转换为符合目标仓库规则的 Markdown。
- 能正确更新必要导航，且不会无关重构站点。
- 能执行并报告目标仓库已有质量门禁和构建结果。
- 失败时不会宣称 Pages 已发布成功。
