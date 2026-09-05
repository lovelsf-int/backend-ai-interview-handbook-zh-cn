<script setup lang="ts">
</script>

<template>
  <section class="soc-rag-highlight">
    <div class="soc-rag-kicker">⭐ 简历重点 · SOC 安全告警 RAG 检索策略</div>
    <h2>安全告警为什么推荐“强约束 Pre-filter + Hybrid Search + Rerank”</h2>
    <p class="soc-rag-lead">
      在 SOC 智能研判场景里，不能把所有元数据都做成硬过滤，也不建议全库直接做向量检索。
      推荐把字段拆成“必须隔离的硬条件”和“参与相关性排序的软条件”，在保证租户与权限安全边界的同时，避免把跨攻击阶段的高价值案例提前过滤掉。
    </p>

    <div class="soc-rag-grid">
      <div class="soc-rag-card">
        <h3>① 必须 Pre-filter：安全边界</h3>
        <ul>
          <li><code>tenant_id</code>：租户隔离，禁止串租户</li>
          <li><code>knowledge_domain</code>：SOP / Case / 产品文档分域</li>
          <li><code>permission_scope</code>：权限与数据可见范围</li>
          <li><code>is_deleted</code> / <code>valid_time</code>：有效性约束</li>
          <li><code>region/environment</code>：有合规或环境隔离要求时使用</li>
        </ul>
        <p><strong>原则：</strong>越权数据不能依赖 Post-filter，更不能交给 LLM 自己判断。</p>
      </div>

      <div class="soc-rag-card">
        <h3>② 不要默认强 AND：业务语义字段</h3>
        <ul>
          <li><code>source_type</code>：HIDS / DLP / SkyEye / AD</li>
          <li><code>alert_type</code> / <code>severity</code></li>
          <li><code>MITRE technique</code> / attack stage</li>
          <li><code>asset_type</code> / product_type</li>
          <li>时间：宽窗口过滤 + recency boost</li>
        </ul>
        <p><strong>原则：</strong>这些字段优先作为 boost、rerank feature 或候选过滤条件；只有业务确定性足够高时才做硬过滤。</p>
      </div>
    </div>

    <div class="soc-rag-flow">
      <h3>推荐检索链路</h3>
      <pre><code>安全告警
  ↓
标准化 / ECS
  ↓
构造 Query Context（行为、资产、用户、IP、时间、MITRE 候选）
  ↓
强约束 Metadata Pre-filter
  ↓
┌──────────────────┬──────────────────┐
│ BM25 精确/词法召回 │ Vector ANN 语义召回 │
└──────────────────┴──────────────────┘
              ↓
           RRF 融合
              ↓
           Reranker
              ↓
TopK Evidence（制度证据 + 历史案例证据）
              ↓
LLM 研判：结论 + 证据 + 置信度 + 建议动作</code></pre>
    </div>

    <div class="soc-rag-grid">
      <div class="soc-rag-card">
        <h3>BM25 更适合</h3>
        <p>IP、Domain、Hash、进程名、命令行、规则名、CVE、MITRE ID、用户名、文件路径等精确或词法特征。</p>
      </div>
      <div class="soc-rag-card">
        <h3>Vector 更适合</h3>
        <p>攻击行为描述、历史真实攻击、误报模式、历史工单、处置经验、SOP 语义和攻击链上下文。</p>
      </div>
    </div>

    <div class="soc-rag-callout">
      <h3>为什么制度知识和案例知识建议双域召回？</h3>
      <p>
        制度/SOP/ATT&amp;CK 回答“按照规范应该怎么判断和处置”，历史案例回答“过去类似事件实际上是什么、最终怎么处置”。
        两个知识域分别召回，再统一做融合与 Rerank，比把所有内容混在一个候选池里更容易控制配额、解释证据来源和调试召回质量。
      </p>
      <pre><code>Query
├─ 制度域：SOP / ATT&amp;CK / 产品文档 → BM25 + Vector → TopN
└─ 案例域：真实攻击 / 误报 / 工单     → BM25 + Vector → TopN
                                   ↓
                              RRF + Reranker</code></pre>
    </div>

    <div class="soc-rag-callout">
      <h3>Rerank 不只看语义相似度</h3>
      <p>安全告警可综合以下信号，避免“语义很像但攻击类型不对”的案例排到前面：</p>
      <pre><code>final_score ≈ semantic_score
            + keyword_score
            + metadata_match
            + recency_score
            + asset_similarity
            + technique_match
            + historical_accuracy</code></pre>
      <p>
        其中 <code>historical_accuracy</code> 可以体现案例是否已被安全专家确认、是真实攻击还是误报；时间因素可使用宽窗口 Pre-filter，再在排序阶段给近期案例加权。
      </p>
    </div>

    <div class="soc-rag-interview">
      <h3>面试可直接口述</h3>
      <blockquote>
        在我们的 SOC RAG 场景里，我会把 tenant、权限和知识域作为硬 Pre-filter，先保证多租户和数据安全边界；对于数据源、严重级别、告警类型、MITRE Technique 这类业务标签，不会默认全部强过滤，而是根据选择性和业务确定性决定做 filter、boost 或 rerank feature。之后在过滤后的候选空间里并行做 BM25 和向量 ANN 检索，用 RRF 融合，再通过 Reranker 综合攻击行为、资产、时间、Technique 和历史案例可信度进行最终排序。制度知识和案例知识采用双域召回，分别提供规范证据和经验案例，最后统一注入 LLM。这样既避免跨租户，又能降低过度过滤导致的召回损失。
      </blockquote>
      <p><strong>一句话：</strong>不是“先元数据过滤有没有问题”，而是要区分<strong>哪些字段必须硬过滤，哪些字段应该参与打分</strong>。</p>
    </div>
  </section>
</template>

<style scoped>
.soc-rag-highlight {
  margin: 0 0 32px;
  padding: 24px;
  border: 2px solid var(--vp-c-brand-1);
  border-radius: 16px;
  background: var(--vp-c-bg-soft);
}
.soc-rag-kicker {
  font-weight: 700;
  color: var(--vp-c-brand-1);
  margin-bottom: 8px;
}
.soc-rag-highlight h2 {
  margin: 0 0 12px;
  border: 0;
  padding: 0;
}
.soc-rag-highlight h3 {
  margin-top: 0;
}
.soc-rag-lead {
  font-size: 16px;
  line-height: 1.8;
}
.soc-rag-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 14px;
  margin: 18px 0;
}
.soc-rag-card,
.soc-rag-callout,
.soc-rag-interview,
.soc-rag-flow {
  padding: 16px;
  border: 1px solid var(--vp-c-divider);
  border-radius: 12px;
  background: var(--vp-c-bg);
}
.soc-rag-callout,
.soc-rag-interview,
.soc-rag-flow {
  margin: 16px 0;
}
.soc-rag-highlight pre {
  overflow-x: auto;
  padding: 14px;
  border-radius: 10px;
  background: var(--vp-code-block-bg);
}
.soc-rag-highlight code {
  font-size: 0.92em;
}
.soc-rag-interview blockquote {
  margin: 12px 0;
  padding: 12px 16px;
  border-left: 4px solid var(--vp-c-brand-1);
  background: var(--vp-c-bg-soft);
}
@media (max-width: 760px) {
  .soc-rag-highlight {
    padding: 16px;
  }
  .soc-rag-grid {
    grid-template-columns: 1fr;
  }
}
</style>
