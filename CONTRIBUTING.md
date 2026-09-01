# 贡献指南

## 提交流程

1. 从最新主分支创建功能分支。
2. 修改 Markdown、导航或质量脚本。
3. 运行 `npm run check`。
4. 运行 `npm run docs:build`。
5. 在提交说明中标明专题和变更类型。

## 内容要求

- 新页面必须包含统一 Front Matter 和一个一级标题。
- 生产参数必须说明业务条件、版本、压测方法或观测指标。
- 不确定结论使用 `reviewing`，不能为了显得完整而标记 `verified`。
- 不上传源 DOCX/PDF、密钥、个人隐私、课程截图或来源不明图片。
- 同一主题只保留一份 canonical 表述，其他页面使用链接。

## 推荐提交格式

```text
docs(agent): clarify RAG retrieval evaluation
docs(es): add rollover capacity boundary
fix(kafka): correct transaction and external DB semantics
```
