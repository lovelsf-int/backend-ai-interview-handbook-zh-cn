# 来源与引用规则

## 来源优先级

1. 产品官方文档、规范、RFC 与论文。
2. 用户拥有的项目材料和面试手册。
3. 可追溯的工程实践文章。
4. 未核实历史笔记只作为 `reviewing` 或 `legacy` 输入。

## 原始材料

本仓库由 12 份用户自有/已授权材料迁移而来，具体文件名、领域角色和目标章节记录在网站的迁移清单中。原文件只作为迁移输入，不提交到 Git，也不作为网站唯一阅读入口。

## 图片规则

- 只发布自有、明确授权或重新绘制的图。
- 每张图提供 Alt Text、语义化文件名和来源说明。
- 来源不明截图、书籍扫描和付费课程页面不发布。

## 事实校准

技术版本、参数默认值和兼容性优先引用官方资料。无法完成实时校准时，页面必须保持 `reviewing` 并说明基线。

## AI 安全实战增补：2026-09-09

适用章节：[LLM 与 Agent 安全实战：SOC 研判到受控处置](docs/ai-agent/14-llm-agent-security-practice.md)。

用户指定 [JavaGuide LLM/Agent 安全文章](https://javaguide.cn/ai/system-design/llm-security.html) 作为选题参考。本仓库不转载该文正文、代码和图片；SOC 执行链、动作账本、异常恢复、面试问答与验收案例按本手册场景组织，并明确设计方案与生产事实的区别。

规范基线包括 [OWASP LLM Top 10 2026](https://genai.owasp.org/resource/owasp-genai-llm-top-10-2026/)、[MCP Authorization 2026-07-28](https://modelcontextprotocol.io/specification/2026-07-28/basic/authorization) 和 Spring AI 官方工具调用文档；权限、RAG、审批、SSRF、日志和容器隔离的具体来源在章节中逐项列出。

页面保持 `reviewing`。规范核验不等于目标系统的实现或安全验证完成，文中 16 个验收场景也不代表已经执行的测试结果。

<!-- ai-study:start -->
## JavaGuide AI 学习专区：2026-09-09

固定收录 JavaGuide `d76264cb4e000416c4adca06770ce014bd309150` 的 32 篇正文与 6 篇导览，按 Apache-2.0 保留署名与许可证，学习卡为本站独立增补。详见 [来源与许可](docs/ai-study/sources.md) 和 [全量覆盖清单](docs/ai-study/coverage.md)。原安全实战的独立原创性质不变；本次学习副本单独标记来源。
<!-- ai-study:end -->
