---
title: 场景题、模拟面试与准备附录
description: 业务场景题、开放问题、项目追问、系统设计题与模拟面试材料
status: reviewing
baseline: AI Agent source snapshot 2026
last_verified: 2026-09-01
level: P7/P8
source: AI Agent 完整手册附录与资深级参考题库（去重合并）
---

# 场景题、模拟面试与准备附录

## 附录 A｜60 分钟模拟面试脚本

<blockquote>
<p><strong>使用方式：</strong>让搭档严格按时间推进，不提示答案。每个问题先给你 90 秒主回答，再追问“为什么、失败怎么办、怎么证明”。</p>
</blockquote>

| **时间**       | **环节**                      | **内容**                                                            |
|----------------|-------------------------------|---------------------------------------------------------------------|
| **0—5 分钟**   | **自我介绍与项目概览**        | 3 分钟项目介绍；面试官确认你的职责、规模和关键指标。                |
| **5—15 分钟**  | **基础与架构**                | Agent vs Workflow；Planner/Executor/Verifier；Tool Calling 与 MCP。 |
| **15—28 分钟** | **项目深挖**                  | 为什么用 Agent；最难问题；一次生产故障；幂等与恢复。                |
| **28—40 分钟** | **RAG / Memory / Evaluation** | 检索指标；权限；版本冲突；评估集；Trajectory。                      |
| **40—53 分钟** | **系统设计**                  | 从 KYC、告警研判、客服或全球 Agent 平台中随机选一题。               |
| **53—58 分钟** | **安全与领导力**              | Prompt Injection、审批、团队协作和技术决策。                        |
| **58—60 分钟** | **反问**                      | 询问团队 Agent 的业务边界、线上规模、评估体系与当前最大难题。       |

## 附录 B｜系统设计八步法

1.  目标与边界：用户是谁、任务成功是什么、哪些决策不能交给模型。

2.  规模与 SLO：DAU/QPS、长任务比例、延迟、可用性、成本和数据区域。

3.  数据流：输入、文档、工具、业务真值、Memory、产物与审计。

4.  编排：Router、Workflow、Planner/Executor/Verifier、状态机与终止条件。

5.  可靠性：幂等、超时、重试、队列、Checkpoint、补偿、降级与灾备。

6.  安全：身份、权限、数据最小化、Prompt Injection、沙箱、审批与审计。

7.  评估：组件、Trajectory、端到端、在线实验、业务 KPI 与错误成本。

8.  演进：PoC → Shadow/Copilot → 有限自动化 → 平台化与全球化。

图 2｜P8 级回答要把控制面、区域数据面、模型、工具、状态、知识与观测连成完整系统。

## 附录 C｜面试评分表（100 分）

| **维度**                 | **分值** | **优秀表现**                                                |
|--------------------------|----------|-------------------------------------------------------------|
| **Agent/LLM 基础与边界** | **15**   | 定义清晰；知道何时不用 Agent；能把模型原理映射到成本/延迟。 |
| **RAG、Tool、Memory**    | **20**   | 链路完整；权限、版本、幂等、工具治理和记忆风险清楚。        |
| **生产工程与系统设计**   | **25**   | 状态、队列、恢复、SLO、容量、灰度、灾备和全球化。           |
| **Evaluation 与安全**    | **15**   | 离线/在线、Trajectory、Guardrail、注入、审批和审计。        |
| **项目深度与结果**       | **15**   | 个人职责明确；难点真实；指标有基线、口径和业务价值。        |
| **技术领导力**           | **10**   | 能定路线、做权衡、带团队、跨组织推动和复盘。                |

<blockquote>
<p><strong>层级参考：</strong>70—79：可胜任资深 Agent 工程师；80—89：具备 P7/技术负责人潜力；90+：达到 P8 面试表达，但仍需用真实项目规模与结果支撑。</p>
</blockquote>

## 附录 D｜30 天准备计划

<blockquote>
<p><strong>第 1—5 天 · 基础与边界：</strong>模块 1—3；每天 8—10 题；完成 Agent vs Workflow、Agent Loop、Context 的口述。</p>
</blockquote>

<blockquote>
<p><strong>第 6—10 天 · 工具与 RAG：</strong>模块 4—5；画 MCP/A2A、Tool Platform、RAG 双流水线；准备一个真实检索案例。</p>
</blockquote>

<blockquote>
<p><strong>第 11—15 天 · 编排与 Memory：</strong>模块 6—8；重点练幂等、Checkpoint、HITL、Handoff 和 Multi-Agent 选型。</p>
</blockquote>

<blockquote>
<p><strong>第 16—20 天 · 生产与安全：</strong>模块 9—11；完成一次故障演练式回答和一份 Agent Threat Model。</p>
</blockquote>

<blockquote>
<p><strong>第 21—25 天 · 系统设计：</strong>模块 12 每天一题；至少完成 KYC、告警、客服、全球平台四张架构图。</p>
</blockquote>

<blockquote>
<p><strong>第 26—28 天 · 项目脚本：</strong>形成 3 分钟、10 分钟两个版本；准备两次故障、两次关键权衡和完整指标。</p>
</blockquote>

<blockquote>
<p><strong>第 29—30 天 · 全真模拟：</strong>每天一场 60 分钟模拟；按评分表复盘，补齐低于 80% 的模块。</p>
</blockquote>

## 附录 E｜官方资料与版本基线

<blockquote>
<p><strong>说明：</strong>Agent 生态变化快。本手册的概念与协议基线截至 2026-08-13；框架 API 细节应在面试前再次核对官方文档。</p>
</blockquote>

**1.** [<u>OpenAI Agents SDK</u>](https://openai.github.io/openai-agents-python/)｜Agents、Tools/Handoffs、Guardrails、Sessions、Human-in-the-Loop 与 Tracing。

**2.** [<u>Model Context Protocol Specification 2026-07-28</u>](https://modelcontextprotocol.io/specification/2026-07-28)｜Tools、Resources、Prompts、Elicitation，以及可选 Extensions。

**3.** [<u>A2A Protocol v1.0</u>](https://a2a-protocol.org/latest/)｜Agent Card、Task、Message、Artifact、Streaming、版本与企业互操作。

**4.** [<u>LangGraph Documentation</u>](https://docs.langchain.com/oss/python/langgraph/overview)｜Durable Execution、Streaming、Human-in-the-Loop、Persistence 与状态化编排。

**5.** [<u>OWASP GenAI Security Project</u>](https://genai.owasp.org/)｜LLM/Agentic 应用风险、Prompt Injection、Excessive Agency 与红队治理。

**6.** [<u>OpenTelemetry GenAI Semantic Conventions</u>](https://opentelemetry.io/docs/specs/semconv/)｜模型、Agent、Tool、Token、Latency 与 Trace 的统一语义。

**7.** [<u>NIST AI RMF — Generative AI Profile</u>](https://www.nist.gov/publications/artificial-intelligence-risk-management-framework-generative-artificial-intelligence)｜生成式 AI 的风险识别、治理与可信系统框架。

<blockquote>
<p><strong>最终提醒：</strong>面试官并不期待你背出某个框架的 API。真正高分的回答是：先界定 Agent 是否必要，再讲可执行架构，主动补上故障、安全、评估和业务结果，并用自己的项目数据证明。</p>
</blockquote>

## 补充场景与项目题

## 十四、业务场景题

### 196. 设计一个客服 Agent。

架构包括意图识别、订单/用户查询工具、政策 RAG、工单系统、回复生成、人工转接和审计。只读查询可自动执行，退款、补偿、改地址等写操作需要权限和确认。

关键指标是一次解决率、转人工率、错误承诺率、响应时延、用户满意度和安全违规率。

### 197. 设计一个销售助手 Agent。

接入 CRM、邮件、日历、客户资料、通话纪要和产品知识库。能力包括客户摘要、下一步建议、邮件草稿、商机风险识别和跟进提醒。

重点是权限隔离和建议可解释：销售只能看自己或团队授权客户，Agent 生成建议要引用 CRM 事实和历史互动。

### 198. 设计一个数据分析 Agent。

包括数据目录、权限校验、SQL 生成、查询执行沙箱、结果校验、可视化和解释层。Agent 应先理解指标口径，再生成 SQL，执行前可 dry-run，结果异常时自检。

高风险点是口径误解和 SQL 越权，必须接入语义层和权限控制。

### 199. 设计一个代码生成 Agent。

需要代码检索、文件读写、测试执行、静态检查、版本控制和审查机制。Agent 先理解需求和现有架构，再小步修改，最后跑测试并总结变更。

关键是不要只生成片段，要能在真实仓库里编译、测试和处理失败。

### 200. 设计一个自动写报告 Agent。

流程是确定报告目标和受众 -> 收集数据/文档 -> 提取事实 -> 生成结构 -> 写初稿 -> 引用和图表 -> 审查一致性。数据源包括数据库、表格、文档和网页/RAG。

生产上要保留来源、版本和生成时间，避免报告中出现无来源断言。

### 201. 设计一个招聘简历筛选 Agent。

输入 JD 和简历，Agent 提取候选人技能、经历、年限、项目匹配度和风险点，输出评分和面试问题。必须避免歧视性特征，评分依据要可解释。

高风险是合规和偏见，建议只做辅助筛选，不做自动淘汰最终决策。

### 202. 设计一个法律文档审查 Agent。

接入合同库、条款模板、法律知识库和差异比对工具。Agent 识别风险条款、缺失条款、责任不对等、金额/期限异常，并给修改建议和引用依据。

必须明确非法律意见，重大风险交由律师复核，且所有建议要有来源或规则依据。

### 203. 设计一个电商运营 Agent。

能力包括商品数据分析、竞品监控、库存/价格查询、活动文案、广告投放建议和异常预警。写操作如改价、上架、投放预算必须确认。

指标包括 GMV 影响、转化率、库存周转、投放 ROI、操作错误率和人工节省时间。

### 204. 设计一个企业知识库问答 Agent。

核心是权限感知 RAG、文档同步、混合检索、rerank、引用、拒答和反馈闭环。按部门/项目/用户权限过滤文档，并对答案给出来源。

关键是知识更新和信任：文档 owner、版本、更新时间和用户反馈要纳入系统。

### 205. 设计一个个人日程管理 Agent。

接入日历、邮件、通讯录和任务系统。Agent 可理解约会意图、查空闲时间、生成邀请、提醒冲突和总结日程。发邀请或改日程前必须确认。

设计重点是隐私、时区、重复事件和冲突处理。

### 206. 设计一个能操作浏览器的 Agent。

浏览器 Agent 需要页面感知、元素定位、动作规划、截图/DOM 观察、表单填写和错误恢复。优先使用 API，只有无 API 时才用浏览器自动化。

安全上要隔离会话、限制域名、确认提交/支付/删除动作，并防止网页内容注入控制 Agent。

### 207. 设计一个能处理 Excel 的 Agent。

能力包括读取表格、识别结构、清洗数据、公式生成、透视表、图表和导出。应使用可靠的 spreadsheet 库处理文件，而不是让模型凭文本猜。

对财务和统计结果要做公式校验、样本核对和变更记录。

### 208. 设计一个自动发邮件的 Agent。

流程是理解意图 -> 查找收件人和上下文 -> 生成草稿 -> 用户确认 -> 发送 -> 记录日志。默认生成草稿，不自动发送，除非用户明确授权且场景低风险。

高风险点是收件人错误、泄密和语气不当，所以需要预览、DLP 和确认。

### 209. 设计一个 DevOps 运维 Agent。

接入监控、日志、告警、Runbook、Kubernetes/云平台和工单系统。Agent 可做告警归因、日志检索、Runbook 推荐、生成修复命令和创建工单。

生产上只读诊断可自动，变更操作要审批、dry-run、灰度和回滚。

### 210. 设计一个金融投研 Agent。

接入行情、公告、财报、研报、新闻和内部模型。Agent 做资料检索、财务指标计算、事件摘要、观点对比和报告草稿。

必须强调数据来源、时间戳、合规披露和非投资建议，高风险结论需人工分析师确认。

## 十五、开放性问题

### 211. 你认为 AI Agent 当前最大的瓶颈是什么？

最大的瓶颈不是单点能力，而是可靠性、评估和安全治理。模型能完成很多 Demo，但在开放环境、多步任务、工具失败和脏数据下，稳定完成率仍是挑战。

另一个瓶颈是组织落地：业务流程、权限、数据质量和责任边界没准备好，Agent 很难直接发挥价值。

### 212. AI Agent 和 Copilot 的区别是什么？

Copilot 更偏辅助人在当前界面完成任务，人仍是主控制者；Agent 更偏代表用户推进任务，可以跨步骤、跨工具执行。两者是连续谱，不是绝对对立。

生产上很多成功形态是 Copilot + Agent：人做关键决策，Agent 做信息收集和执行准备。

### 213. 为什么很多 Agent Demo 看起来强，但生产效果差？

Demo 通常样本干净、路径短、风险低、人工挑选成功案例；生产面对权限、异常、脏数据、长尾问题、延迟成本、安全和用户多样表达。缺少评估和观测时，问题也难定位。

资深观点：Agent 产品化要从高频、边界清晰、可验证的任务切入。

### 214. 未来 Agent 会取代 SaaS 吗？

短期不会完全取代，更多是重塑 SaaS 交互层。SaaS 仍提供数据、权限、流程和系统记录，Agent 作为自然语言和自动化层连接多个系统。

长期看，用户可能更少直接操作复杂界面，但底层业务系统仍然存在。

### 215. Agent 会如何改变软件交互方式？

从“用户学习软件菜单”变成“用户表达目标，系统协助完成”。界面会更多呈现结果、确认、进度和异常，而不是暴露所有操作路径。

但对高风险业务，人机协作和可解释确认仍会长期存在。

### 216. 你怎么看待 Agent OS？

Agent OS 可以理解为为 Agent 提供身份、权限、工具、记忆、任务、审计和跨应用执行能力的底座。它的价值在于统一治理和上下文，而不是单个聊天入口。

难点是生态标准、权限边界、隐私、跨应用协议和用户信任。

### 217. 你怎么看待多 Agent 协作的未来？

多 Agent 会在复杂任务、软件工程、研究分析和企业流程中有价值，但不会所有场景都多 Agent 化。未来更可能是可控的角色化工作流，而不是完全自由的 Agent 群聊。

关键竞争力是协调、评估和工具治理。

### 218. Agent 是否真的需要长期记忆？

取决于场景。个人助手、项目助手和客户服务需要长期记忆；一次性查询或严格合规场景可能不需要，甚至应避免。长期记忆能提升体验，也会带来隐私和过期风险。

资深回答：记忆应默认可控、可查看、可删除，而不是默默保存一切。

### 219. Agent 和传统自动化系统会如何结合？

传统自动化负责稳定、确定、高频流程，Agent 负责理解自然语言、处理异常、补全参数和跨系统综合。Agent 可以作为自动化入口，也可以作为异常处理器。

最现实的落地是“工作流骨架 + Agent 智能节点”。

### 220. 你认为 AI Agent 最先大规模落地在哪些行业？

会先落地在知识密集、流程重复、数据可接入、风险可控的场景，如客服、销售运营、研发、数据分析、内部知识库、财务报销辅助、运维和内容生产。强监管领域也会落地，但更偏辅助和审核。

判断标准是 ROI 明确、错误成本可控、数据基础较好。

## 十六、项目经历追问

### 221. 你做过 AI Agent 项目吗？整体架构是什么？

资深回答建议按“业务目标 -> 架构 -> 核心模块 -> 效果指标”讲。比如：我们做的是企业知识和工单 Agent，入口是 Web/API，后端有 Agent Runtime、RAG 服务、Tool Gateway、任务状态表、Trace 系统和评测平台。

重点说清楚你负责的部分、系统如何可控、上线指标如何。

### 222. 你的 Agent 调用了哪些工具？

回答时按工具类型分类：检索工具、业务查询工具、写操作工具、文件工具、通知工具、评估工具。说明哪些自动执行，哪些需要确认。

例如订单查询只读自动执行，退款和发送邮件需要人工确认，所有工具通过网关做权限和审计。

### 223. 你是如何做 Prompt 设计的？

说明你做了角色定义、工具规则、输出 Schema、澄清策略、安全边界和错误处理，并建立 Prompt 版本管理和评测集。不要只说“反复调 Prompt”。

资深亮点是把 Prompt 和工程约束结合，比如结构化输出失败会自动重试，危险工具由 Policy Engine 拦截。

### 224. 遇到过哪些幻觉问题？怎么解决？

可以举例：模型在知识库无结果时编造政策，或工具失败后假装成功。解决方式是强制引用来源、无来源拒答、工具结果结构化、final answer 检查和失败状态明确展示。

最好讲出指标改善，例如 unsupported answer rate 降低。

### 225. 遇到过哪些工具调用失败？怎么处理？

常见包括参数缺失、ID 错误、权限不足、超时和外部 API 失败。处理方式是错误分类、参数修正、可重试错误指数退避、权限错误提示授权、不可恢复错误转人工。

资深回答强调失败不应被模型吞掉，必须进入 trace 和任务状态。

### 226. 你的 Agent 如何做任务拆解？

可以说采用 Planner 生成结构化计划，每步有目标、工具、输入和完成条件；执行后根据观察更新计划。对于固定流程用状态机，开放步骤才让模型规划。

这体现你不是盲目把所有逻辑交给模型。

### 227. 你的 Agent 如何做日志和 Trace？

记录请求、Prompt/模型版本、每步动作、工具参数摘要、返回摘要、状态变化、耗时、token、成本和错误。Trace 可按 task_id 回放。

敏感字段脱敏，写操作保留审计日志和确认记录。

### 228. 你的 Agent 如何评估效果？

离线用 golden dataset 评估任务完成率、工具调用准确率、RAG 引用准确率和安全样本；线上看成功率、转人工率、用户反馈、成本、延迟和失败类型。

回答时最好区分端到端指标和模块指标。

### 229. 你的 Agent 上线后有哪些指标？

指标包括 DAU/使用次数、任务完成率、一次解决率、平均步骤数、平均延迟、token 成本、工具失败率、人工介入率、用户满意度、安全拦截和回滚次数。

不同业务要有业务指标，例如客服看转人工率，研发看 PR 通过率，数据分析看 SQL 正确率。

### 230. 你如何优化成本和延迟？

成本方面做模型路由、缓存、上下文压缩和步数限制；延迟方面做并行工具、streaming、减少模型调用、异步长任务和检索优化。并监控每个节点的 token 和耗时。

资深回答可补充：优化前先用 trace 找瓶颈，不凭感觉改。

### 231. 你如何处理用户隐私和权限？

使用租户和用户级隔离，RAG 检索带权限过滤，工具调用基于用户身份鉴权，日志脱敏，敏感外发前做 DLP 和确认。长期记忆可查看、可删除。

如果是企业场景，还要支持审计和数据保留策略。

### 232. 项目中最大的技术难点是什么？

可以回答“可靠性和评估”。例如模型在长尾输入下工具选择不稳定，我们通过工具职责收敛、Schema 优化、路由、评测集和状态机约束提升稳定性。

资深面试要讲问题、原因、方案、结果，不要只说“Prompt 很难调”。

### 233. 如果重新设计，你会改哪里？

可以说会更早建设评测和 Trace，把工具网关、权限和 Prompt 版本管理平台化；或者把自由 Agent 改成状态图以提升可控性。这个问题考察复盘能力。

好的回答要体现工程成熟度，而不是简单否定原方案。

### 234. 你的 Agent 和普通 RAG 系统相比有什么优势？

普通 RAG 只回答知识问题，Agent 能根据目标动态选择检索、业务查询、创建工单、追问和执行后续动作。它不只是“知道答案”，还能“推进任务”。

同时也要承认 Agent 成本和风险更高，所以只在需要行动闭环的场景使用。

### 235. 这个项目最终带来了什么业务价值？

回答要量化：节省人工时间、提升一次解决率、降低平均处理时长、提升知识命中率、减少重复工单、提高销售跟进效率等。没有量化也要说清楚评估方式。

资深候选人会把技术结果和业务指标关联起来。

## 十七、代码与系统设计题

### 236. 写一个简单的 ReAct Agent 执行循环。

核心伪代码是：初始化 state；while 未完成且未超步数：调用 LLM 生成 action；校验 action；执行工具；把 observation 写入 state；判断是否 final。生产版还要加权限、超时、重试、trace 和 budget。

面试时可以补充：Thought 不一定落日志，日志记录 action、observation 和 decision summary 即可。

### 237. 写一个 Function Calling 工具注册器。

工具注册器要保存 name、description、input_schema、handler、permission、timeout、retry_policy 和 risk_level。执行时先根据 name 找工具，再校验 schema 和权限，最后调用 handler。

关键是工具注册和工具执行分离，方便统一审计和治理。

### 238. 写一个 Tool Router。

Tool Router 根据用户意图、任务类型、权限和工具描述选择候选工具组。可以先用规则快速路由，再用小模型做语义分类，低置信度时交给强模型或澄清。

Router 的价值是减少模型选择空间，提高准确率并降低成本。

### 239. 写一个 Agent 状态机。

状态可包括 created、planning、waiting_tool、waiting_user、running、paused、succeeded、failed、cancelled。每个状态只允许特定事件迁移，例如 tool_success 从 waiting_tool 到 running，user_confirm 从 waiting_user 到 running。

状态机让 Agent 可恢复、可观测，也能避免非法流程。

### 240. 写一个支持重试的工具调用封装。

封装逻辑包括 schema 校验、权限校验、超时控制、执行、错误分类、可重试错误指数退避、最大次数、幂等 key 和 trace 记录。不可重试错误直接返回结构化错误给 Agent。

写操作重试前必须检查是否已执行，避免重复副作用。

### 241. 写一个简单 Memory 模块。

Memory 模块包括 write、search、update、delete 和 summarize。每条记忆包含 user_id、tenant_id、type、content、metadata、source、confidence、created_at、expires_at。

检索时必须先做权限过滤，再做相似度和 rerank；写入时要经过重要性和隐私判断。

### 242. 写一个 RAG 检索链路。

链路是 query rewrite -> hybrid search -> metadata permission filter -> rerank -> context packing -> generation with citations -> faithfulness check。文档入库侧包括解析、切分、embedding、索引和增量更新。

面试时要强调离线评估 recall/precision 和线上反馈闭环。

### 243. 写一个 LangGraph Agent 流程。

可以设计节点：classify -> plan -> retrieve/tool -> execute -> check -> human_review 或 final。边根据状态字段跳转，例如 need_more_info 到 retrieve，high_risk 到 human_review，done 到 final。

LangGraph 的优势是显式状态和可控循环，适合生产 Agent。

### 244. 设计一张 Agent 执行日志表。

字段可包括 id、task_id、step_id、parent_step_id、user_id、agent_id、action_type、tool_name、input_summary、output_summary、status、error_code、model、prompt_version、token_usage、cost、duration_ms、created_at。

敏感输入输出可以存对象存储加密引用，表里只放摘要和指针。

### 245. 设计一个 Agent Task 表结构。

字段包括 task_id、tenant_id、user_id、agent_type、goal、status、priority、current_step、state_json、budget、error_code、created_at、updated_at、started_at、finished_at、cancel_requested、version。

需要 version 或 lease 字段支持并发 Worker 和恢复。

### 246. 设计一个 Tool Permission 表结构。

字段包括 id、tenant_id、role_id/user_id、tool_name、operation、resource_scope、risk_level、requires_confirmation、requires_approval、rate_limit、created_at、updated_at。

也可以结合 ABAC，把资源条件表达为 policy expression。

### 247. 设计 Agent Trace 的数据结构。

Trace 可设计为树或事件流：trace_id、span_id、parent_span_id、type、name、input、output、metadata、status、start_time、end_time、error。模型调用、工具调用、检索和状态迁移都是 span。

与 OpenTelemetry 思路接近，便于跨服务链路追踪。

### 248. 如何用队列实现异步 Agent 任务？

API 创建 task 并写库，然后投递 message。Worker 消费 message，获取任务 lease，执行一步或一段，写 checkpoint，再决定继续投递下一步或结束。失败进入重试或死信队列。

前端通过 task_id 查询状态或订阅事件流。

### 249. 如何实现 Agent 执行中断和恢复？

中断通过 cancellation token、状态标记和步骤边界检查实现。恢复依赖 checkpoint，包括 state_json、已完成步骤、外部资源 ID 和下一步指针。

写操作要用幂等 key，恢复时先确认上次是否已经成功。

### 250. 如何实现 Agent 的 Streaming 输出？

模型文本可通过 SSE/WebSocket streaming；工具进度可通过事件流发送 step_started、tool_running、tool_done、waiting_user、final。前端展示进度，后端状态仍以任务表为准。

Streaming 不能替代持久化状态，否则断线后无法恢复。

## 十八、高频必背题

### 251. AI Agent 的核心组成是什么？

核心组成是 LLM、Prompt/策略、Planner、Executor、Tools、Memory/State、RAG、Guardrails、Trace/Eval 和权限系统。面试中可按“脑、手、记忆、安全、观测”来讲。

资深重点是 Agent 不只是模型，而是模型加受控执行系统。

### 252. ReAct 的原理是什么？

ReAct 让模型在推理和行动之间循环，根据工具观察调整下一步。它解决单次生成无法获取外部信息和处理动态反馈的问题。

生产要加最大步数、工具权限和停止条件。

### 253. Agent 和 RAG 的区别是什么？

RAG 解决“基于外部知识回答”，Agent 解决“基于目标采取行动”。RAG 可以是 Agent 的一个工具，Agent 可以调用 RAG、业务 API 和写操作工具完成任务。

一句话：RAG 偏知识增强，Agent 偏任务执行闭环。

### 254. Agent 如何调用工具？

模型根据工具 Schema 输出工具名和参数，Runtime 校验 Schema、权限和风险后执行工具，再把结构化结果返回给模型继续决策。执行过程写 trace。

不要让模型直接执行真实操作，所有副作用都走工具网关。

### 255. 如何防止 Agent 幻觉？

用 RAG/工具提供事实来源，要求引用，缺证据时拒答，做输出校验和后验检查。对高风险领域加入人工复核。

工程上要让“事实来自工具，表达来自模型”。

### 256. 如何防止 Prompt Injection？

把外部内容视为不可信数据，分离指令和数据，限制工具权限，RAG 按权限检索，外发和高危操作加确认，加入红队测试和输出检查。

Prompt 防护只是其中一层，真正的边界在系统和权限层。

### 257. 如何评估 Agent 效果？

看任务完成率、工具调用准确率、输出正确性、RAG 忠实度、成本、延迟、安全性和用户满意度。离线 golden set + 在线监控 + 人评抽样结合。

要拆解指标，否则不知道失败原因。

### 258. LangChain 和 LangGraph 的区别是什么？

LangChain 偏 LLM 应用组件和链式调用，LangGraph 偏状态图和 Agent workflow 编排。复杂 Agent 需要循环、分支、持久化和中断恢复时，LangGraph 更合适。

框架选择要看可控性和团队需求。

### 259. Agent 生产落地有哪些难点？

难点包括稳定性、权限安全、工具失败、长上下文、评估、成本延迟、数据质量、用户信任和可观测性。Demo 到生产的差距主要在这些工程问题。

解决思路是从边界清晰、高价值、可验证的场景切入。

### 260. 如何设计一个企业级 AI Agent 平台？

企业级平台应提供 Agent Runtime、Tool Gateway、Model Gateway、Prompt Registry、Memory/RAG、Policy Engine、Task Queue、Trace/Eval、审计和管理后台。业务方通过配置 Agent、工具和知识源快速落地。

核心原则是统一治理：模型可替换、工具可控权、数据可隔离、行为可审计、质量可评估、版本可回滚。
