#!/usr/bin/env python3
"""Import a pinned, licensed JavaGuide AI snapshot with independent study cards.
Never executes upstream examples. No credentials are sent to upstream downloads.
Generated content is reviewing, not a claim of exhaustive technical audit.
"""
from __future__ import annotations
import argparse
import hashlib
import html
import json
import posixpath
import re
import tempfile
import time
from concurrent.futures import ThreadPoolExecutor
from pathlib import Path
from urllib.error import HTTPError
from urllib.parse import urlsplit, urlunsplit, unquote
from urllib.request import Request, urlopen

HERE = Path(__file__).resolve().parent
ROOT = HERE.parents[1]
OUT = ROOT / 'docs/ai-study'
PREFIX = '/ai-study/java-guide/'
UPSTREAM = 'https://raw.githubusercontent.com/Snailclimb/JavaGuide/'
PIN = 'd76264cb4e000416c4adca06770ce014bd309150'
LICENSE_SHA = '261eeb9e9f8b2b4b0d119366dda99c6fd7d35c64'
GROUPS = [('', '入门总览'), ('llm-basis', '大模型基础'), ('agent', 'Agent 工程'), ('rag', 'RAG 知识工程'), ('system-design', 'AI 系统设计'), ('interview-questions', '面试与项目复习')]
REFS = {
 'agents': ('Anthropic：Building effective agents', 'https://www.anthropic.com/engineering/building-effective-agents'),
 'tools': ('Spring AI：Tool Calling', 'https://docs.spring.io/spring-ai/reference/api/tools.html'),
 'transformer': ('论文：Attention Is All You Need', 'https://arxiv.org/abs/1706.03762'),
 'rag': ('论文：Retrieval-Augmented Generation', 'https://arxiv.org/abs/2005.11401'),
 'mcp': ('MCP 官方架构文档（2026-07-28）', 'https://modelcontextprotocol.io/docs/2026-07-28/learn/architecture'),
 'skills': ('Agent Skills 规范', 'https://agentskills.io/specification'),
 'harness': ('Anthropic：Effective harnesses for long-running agents', 'https://www.anthropic.com/engineering/effective-harnesses-for-long-running-agents'),
 'persistence': ('LangGraph：Persistence', 'https://docs.langchain.com/oss/python/langgraph/persistence'),
 'hybrid': ('Elastic：Hybrid search', 'https://www.elastic.co/docs/solutions/search/hybrid-search'),
 'graphrag': ('Microsoft GraphRAG 文档', 'https://microsoft.github.io/graphrag/'),
 'otel': ('OpenTelemetry：GenAI semantic conventions', 'https://opentelemetry.io/docs/specs/semconv/gen-ai/'),
 'security': ('OWASP：AI Agent Security', 'https://cheatsheetseries.owasp.org/cheatsheets/AI_Agent_Security_Cheat_Sheet.html')
}

def blob_sha(data: bytes) -> str:
    return hashlib.sha1(f'blob {len(data)}\0'.encode() + data).hexdigest()

def verify_blob(data: bytes, expected: str) -> None:
    if blob_sha(data) != expected:
        raise ValueError(f'Upstream blob integrity mismatch: expected {expected}')

def download(url: str, maximum: int = 2_000_000, optional: bool = False) -> bytes | None:
    for attempt in range(3):
        try:
            with urlopen(Request(url, headers={'User-Agent': 'AI-study-snapshot-import/1.0'}), timeout=45) as response:
                result = response.read(maximum + 1)
                if len(result) > maximum:
                    raise ValueError('Download exceeds size limit')
                return result
        except HTTPError as exc:
            if optional and exc.code == 404:
                return None
            if exc.code < 500 and exc.code != 429:
                raise
            if attempt == 2:
                raise
        except (TimeoutError, OSError):
            if attempt == 2:
                raise
        time.sleep(attempt + 1)
    raise RuntimeError('Download failed')

def source_url(file: str) -> str:
    path = file[:-9] if file.endswith('README.md') else file[:-3] + '.html'
    return 'https://javaguide.cn/ai/' + path

def dest(file: str) -> str:
    return file[:-9] + 'index.md' if file.endswith('README.md') else file

def split_frontmatter(text: str) -> tuple[dict, str]:
    match = re.match(r'\A---\s*\n(.*?)\n---\s*\n', text, re.S)
    meta = {}
    if match:
        for key, val in re.findall(r'^(title|description|author):\s*(.+)$', match[1], re.M):
            meta[key] = val.strip().strip('"\'')
        return meta, text[match.end():]
    return meta, text

def rewrite_href(href: str, file: str, mapping: dict) -> str:
    href = html.unescape(href.strip('<>'))
    parsed = urlsplit(href)
    if parsed.scheme and parsed.scheme not in ('https', 'http', 'mailto', 'tel'):
        return source_url(file)
    if href.startswith('#') or parsed.scheme in ('mailto', 'tel'):
        return href
    if parsed.netloc and parsed.netloc != 'javaguide.cn':
        if parsed.path.lower().endswith(('.pdf', '.docx')):
            if parsed.netloc == 'arxiv.org' and '/pdf/' in parsed.path:
                return 'https://arxiv.org/abs/' + parsed.path.split('/pdf/', 1)[1].removesuffix('.pdf')
            return source_url(file)
        return 'https:' + href if href.startswith('//') else href
    if parsed.netloc or parsed.path.startswith('/'):
        absolute = unquote(parsed.path)
    else:
        absolute = '/' + posixpath.normpath(posixpath.join('ai', posixpath.dirname(file), unquote(parsed.path)))
    if absolute.startswith('/docs/'):
        absolute = absolute[5:]
    if absolute.startswith('/ai/'):
        key = absolute[4:]
        if not key or key.endswith('/'):
            key += 'README.md'
        elif key.endswith('.html'):
            key = key[:-5] + '.md'
        if key in mapping:
            return mapping[key] + (('#' + parsed.fragment) if parsed.fragment else '')
    if absolute.endswith('README.md'):
        absolute = absolute[:-9]
    elif absolute.endswith('.md'):
        absolute = absolute[:-3] + '.html'
    if absolute.lower().endswith(('.pdf', '.docx')):
        return source_url(file)
    if absolute.endswith('.drawio'):
        return f'https://github.com/Snailclimb/JavaGuide/blob/{PIN}/docs{absolute}'
    return urlunsplit(('https', 'javaguide.cn', absolute, parsed.query, parsed.fragment))

def normalize_body(body: str, file: str, mapping: dict) -> str:
    # Rewrites only happen outside fenced examples.
    result, normal, block = [], [], []
    fence = None
    def flush():
        if normal:
            result.append(prose(''.join(normal)))
            normal.clear()
    def prose(text):
        text = re.sub(r'<!--\s*@include:[\s\S]*?-->', '\n> 原站公共补充片段未展开；需要时请通过本页原文链接阅读。\n', text)
        text = re.sub(r'<img\b[^>]*>', lambda m: image_tag(m.group()), text, flags=re.I)
        text = re.sub(r'!\[([^\]]*)\]\(([^\s)]+)(?:\s+["\'][^\n]*?["\'])?\)', lambda m: f'[原图：{m[1] or "查看"}]({rewrite_href(m[2], file, mapping)})', text)
        text = re.sub(r'(?<!!)\[([^\]]*)\]\(([^\s)]+)(?:\s+["\'][^\n]*?["\'])?\)', lambda m: f'[{m[1]}]({rewrite_href(m[2], file, mapping)})', text)
        text = re.sub(r'^(\s*\[[^\]]+\]:\s*)(\S+)', lambda m: m[1] + rewrite_href(m[2], file, mapping), text, flags=re.M)
        chunks = re.split(r'(`+[^`\n]*`+)', text)
        for n in range(0, len(chunks), 2):
            chunks[n] = re.sub(r'</?[A-Za-z][^>]*>', safe_tag, chunks[n])
            chunks[n] = chunks[n].replace('{{', '&#123;&#123;').replace('}}', '&#125;&#125;')
        return ''.join(chunks)
    def image_tag(raw):
        src = re.search(r'\bsrc=["\']([^"\']+)["\']', raw, re.I)
        alt = re.search(r'\balt=["\']([^"\']*)["\']', raw, re.I)
        return f'[原图：{alt[1] if alt else "查看"}]({rewrite_href(src[1], file, mapping)})' if src else html.escape(raw)
    def safe_tag(match):
        raw = match.group()
        if re.fullmatch(r'</?(?:br|details|summary|sup|sub)\s*/?>', raw, re.I):
            return raw
        return html.escape(raw)
    for line in body.splitlines(keepends=True):
        marker = re.match(r'^\s*(`{3,}|~{3,})', line)
        if fence:
            block.append(line)
            if marker and marker[1][0] == fence[0] and len(marker[1]) >= len(fence):
                result.append(''.join(block)); block.clear(); fence = None
        elif marker:
            flush(); fence = marker[1]; block.append(line)
        else:
            normal.append(line)
    if fence:
        raise ValueError(f'Unclosed code fence in {file}')
    flush()
    text = ''.join(result)
    lines, stack, seen, code = [], [], {}, None
    for line in text.splitlines():
        marker = re.match(r'^\s*(`{3,}|~{3,})', line)
        if marker:
            code = None if code and marker[1][0] == code[0] and len(marker[1]) >= len(code) else (code or marker[1])
            lines.append(line.rstrip().expandtabs(4)); continue
        if code:
            lines.append(line.rstrip().expandtabs(4)); continue
        container = re.match(r'^\s*(:{3,})\s*(.*)$', line)
        if container:
            label = container[2].strip()
            if label:
                kind = label.split()[0]
                keep = kind in ('tip', 'warning', 'danger', 'info', 'details')
                stack.append(keep)
                if keep: lines.append('::: ' + label)
            elif stack:
                if stack.pop(): lines.append(':::')
            continue
        if re.match(r'^\s*@tab\b', line):
            line = '#### ' + re.sub(r'^\s*@tab\s*', '', line)
        if line.startswith('# '):
            line = '## 原文标题：' + line[2:]
        if line.startswith('## '):
            key = re.sub(r'[`*_~]', '', line[3:]).strip().lower()
            seen[key] = seen.get(key, 0) + 1
            if seen[key] > 1: line += f'（补充 {seen[key]}）'
        lines.append(line.rstrip().expandtabs(4))
    if any(stack):
        raise ValueError(f'Unclosed content container in {file}')
    text = '\n'.join(lines)
    text = re.sub(r'\n{4,}', '\n\n\n', text).strip() + '\n'
    if file == 'agent/mcp.md':
        text = text.replace('本文以当前稳定的 [2025-11-25 revision]', '本文保留上游写作时的 [2025-11-25 revision]')
    return text

def fm(title: str, description: str, **extra) -> str:
    fields = dict(title=title, description=description, status='reviewing', baseline=f'JavaGuide source snapshot {PIN}', last_verified='2026-09-09', level='学习 / 复习 / P7 / P8', source='JavaGuide Apache-2.0 许可正文；本手册独立学习卡')
    fields.update(extra)
    return '---\n' + '\n'.join(f'{k}: {json.dumps(v, ensure_ascii=False)}' for k, v in fields.items()) + '\n---\n\n'

def write(path: Path, text: str) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(text.rstrip() + '\n', encoding='utf-8')

def catalog() -> dict:
    data = json.loads((HERE / 'catalog.json').read_text())
    assert data['source_commit'] == PIN
    assert len(data['articles']) == 32 and len(data['guides']) == 6
    names = [x['file'] for x in data['articles']] + [x[0] for x in data['guides']]
    assert len(set(names)) == 38
    for card in data['articles']:
        assert re.fullmatch('[a-f0-9]{40}', card['sha'])
        assert len(card['qa']) == 3 and all(len(x) == 2 and all(x) for x in card['qa'])
        assert card['ref'] in REFS
        assert (ROOT / 'docs/ai-agent' / card['related']).is_file(), card['related']
    return data

def card_text(card: dict) -> str:
    ref_title, ref_url = REFS[card['ref']]
    s = '## 学习与复习卡片 {#study-card}\n\n'
    s += '### 30 秒速记\n\n' + card['summary'] + '\n\n'
    s += '### 在脑中走一遍链路\n\n' + card['flow'] + '\n\n'
    s += '### 容易记错的边界\n\n' + card['trap'] + '\n\n'
    s += '### 闭卷自测：先回答，再展开\n\n'
    for q, a in card['qa']:
        s += f'<details>\n<summary>{html.escape(q)}</summary>\n\n{a}\n\n</details>\n\n'
    s += '### 动手或纸上推演\n\n' + card['exercise'] + '\n\n'
    s += f'深入对照：[本站 P7/P8 工程章节](/ai-agent/{card["related"]})。官方/论文延伸：[{ref_title}]({ref_url})。\n\n'
    s += '学习卡是本手册的概念整理与设计练习；练习数字不代表生产指标，练习也不代表已经执行通过。\n\n'
    return s

def managed_append(path: Path, block: str) -> None:
    start, end = '<!-- ai-study:start -->', '<!-- ai-study:end -->'
    original = path.read_text()
    pattern = re.compile(re.escape(start) + r'[\s\S]*?' + re.escape(end))
    new = f'{start}\n{block.rstrip()}\n{end}'
    if start in original:
        original = pattern.sub(lambda _: new, original)
    else:
        original = original.rstrip() + '\n\n' + new + '\n'
    write(path, original)

def support_pages(data: dict, manifest: list) -> None:
    cards = data['articles']
    intro = fm('AI 系统学习与复习', '32 篇完整正文、6 篇导览、96 道附加自测与 32 个实践练习')
    intro += '# AI 系统学习与复习\n\n'
    intro += '> 学习目标：能解释原理、走通链路、识别反例，并把知识迁移到自己的问题中。不是只背一段面试答案。\n\n'
    intro += '**本次固定快照：32/32 篇正文、6/6 篇原始导览。** 每篇正文前有独立学习卡：速记、链路、易错点、基础/P7/P8 三层自测和实践任务；答案默认折叠。\n\n'
    intro += '[从学习路线开始](./learning-path.md) · [闭卷复习工作台](./review.md) · [38 页覆盖清单](./coverage.md) · [版本校准](./version-notes.md) · [来源与许可证](./sources.md)\n\n'
    intro += '原有 [AI Agent 工程手册](/ai-agent/) 与面试复盘完整保留。这里用来系统学习，原手册用来做生产深挖；各篇学习卡已连到对应工程章节。\n\n'
    intro += '::: warning 阅读边界\n正文是 JavaGuide 固定提交的许可学习副本，不是对所有技术细节逐项认证。原文的“当前”、版本、价格、性能数字和第一人称项目经历均属于其写作上下文；不要当作自己的经历或现行默认值。源文中的外部图只保留原图链接，Mermaid 图表源码保留。\n:::\n\n'
    for group, label in GROUPS:
        subset = [c for c in cards if posixpath.dirname(c['file']) == group]
        intro += f'## {label}\n\n'
        if group:
            intro += f'[原始分类导览](./java-guide/{group}/index.md)\n\n'
        intro += '| 正文 | 本篇首先弄懂 |\n| --- | --- |\n'
        for c in subset:
            intro += f'| [{c["title"]}](./java-guide/{c["file"]}) | {c["summary"]} |\n'
        intro += '\n'
    intro += '## 学完怎样判断掌握\n\n不看答案，讲清定义、链路、反例和验证方法。能复述但不能解释异常路径时，回到该篇学习卡和工程章节；能解释之后，再完成合成数据练习。这里只提供自测材料，不自动记录个人成绩。\n'
    write(OUT / 'index.md', intro)
    route = fm('AI 学习路线：从理解到复习', '六阶段系统学习、14 个学习单元和可调整的复习安排') + '# AI 学习路线：从理解到复习\n\n'
    route += '## 使用方式\n\n第一遍先读学习卡建立问题，再看正文和原图；第二遍合上正文回答自测；第三遍选一个练习并说明失败时会怎样。P7/P8 是加深层，不要求第一遍就全部答出。\n\n'
    route += '## 14 个学习单元\n\n单元不等于一天，按自己的精力拆分。每次至少留下一个自己写出的链路或反例，而不是只做阅读打卡。\n\n'
    labels = ['概念地图','模型怎样运行','API 与结构化契约','先建立评测意识','Agent 与流程边界','Prompt 与上下文','记忆、Harness 与循环','MCP、Skills 与协作','RAG 与文档处理','索引与检索优化','更新与 GraphRAG','架构、网关与观测','语音与安全边界','综合复习与事实核验']
    unit_files = [
      ['ai-core-concepts.md'], ['llm-basis/llm-operation-mechanism.md'],
      ['llm-basis/llm-api-engineering.md','llm-basis/structured-output-function-calling.md'], ['llm-basis/llm-evaluation.md'],
      ['agent/agent-basis.md','agent/workflow-graph-loop.md'], ['agent/prompt-engineering.md','agent/context-engineering.md'],
      ['agent/agent-memory.md','agent/harness-engineering.md','agent/loop-engineering.md'],
      ['agent/mcp.md','agent/skills.md','agent/multi-agent.md'], ['rag/rag-basis.md','rag/rag-document-processing.md'],
      ['rag/rag-vector-store.md','rag/rag-optimization.md'], ['rag/rag-knowledge-update.md','rag/graphrag.md'],
      ['system-design/ai-application-architecture.md','system-design/llm-gateway.md','system-design/ai-observability.md'],
      ['system-design/ai-voice.md','system-design/llm-security.md'],
      [c['file'] for c in cards if c['file'].startswith('interview-questions/')]]
    by_file = {c['file']: c for c in cards}
    assert set(sum(unit_files, [])) == set(by_file)
    route += '| 单元 | 学习主题 | 本站正文 |\n| --- | --- | --- |\n'
    for n, (label, files) in enumerate(zip(labels, unit_files), 1):
        route += f'| {n:02} | {label} | ' + '、'.join(f'[{by_file[f]["title"]}](./java-guide/{f})' for f in files) + ' |\n'
    route += '\n## 复习与错题记录\n\n可尝试在学后第 1、3、7、14 天闭卷复述，间隔自行调整；这是安排建议，不是效果保证。把错误分成概念错、机制断、边界漏、验证缺四类，下一次只针对仍不会的部分重练。\n\n'
    route += '建议在私人笔记记录：主题、自己的原回答、错因、反例、修正答案、需要补的证据、下次复习日期。本仓库是公开学习站，不要把真实告警、密钥、客户信息和公司内部材料写入页面。\n\n'
    route += '## 三条贯穿练习\n\n用合成资料搭建只读知识问答；再加入受控工具调用；最后加入异步状态、超时对账与安全验收。每次只增加一类复杂度，先写验收条件，再实现。练习不要求购买付费模型，可先用模拟接口验证确定性逻辑。\n'
    write(OUT / 'learning-path.md', route)
    review = fm('AI 闭卷复习工作台', '32 个主题的 96 道基础、P7 与 P8 闭卷自测题') + '# AI 闭卷复习工作台\n\n'
    review += '先只看问题，回答后再点对应正文的学习卡展开答案。自评建议：0 分不会；1 分能讲概念但没有边界；2 分能讲机制、反例和验证。分数仅供自用，不代表职级评定。\n\n'
    for i, c in enumerate(cards, 1):
        review += f'## {i:02} {c["title"]}\n\n'
        review += '\n'.join(f'{j}. {q}' for j, (q, _) in enumerate(c['qa'], 1)) + '\n\n'
        review += f'[展开参考答案与练习](./java-guide/{c["file"]}#study-card) · [工程深挖](/ai-agent/{c["related"]})\n\n'
    write(OUT / 'review.md', review)
    coverage = fm('JavaGuide AI 全量覆盖清单', '逐页记录源路径、正文迁移、学习卡和审核边界') + '# JavaGuide AI 全量覆盖清单\n\n'
    coverage += f'源提交：`{PIN}`。仅统计 `docs/ai/` 的 32 篇正文与 6 篇 README 导览；排除 TODO.md、绘图工程和目录外文章。源文件均按 Git blob SHA 核对，完整性校验不是内容正确性认证。\n\n'
    coverage += '| 类型 | 原文 | 本站 | 收录与复习 |\n| --- | --- | --- | --- |\n'
    for item in manifest:
        coverage += f'| {"正文" if item["kind"] == "article" else "导览"} | [{item["source_file"]}]({item["source_url"]}) | [{item["title"]}](./java-guide/{item["target"]}) | {"正文已收录；3 道附加自测；逐段技术审核未完成" if item["kind"] == "article" else "导览正文已收录；不计入 32 篇"} |\n'
    coverage += '\n## 可复查数据\n\n[机器可读来源清单](/ai-study-manifest.json) 保存每个源 blob、原始字节数、输出摘要和代码块数量。图片只保留原图链接；源站 include 片段未展开；VuePress 容器与链接已适配。\n'
    write(OUT / 'coverage.md', coverage)
    versions = fm('版本校准与阅读边界', '区分上游写作基线、官方更新与本站审核状态') + '# 版本校准与阅读边界\n\n'
    versions += '## MCP 的两版流程不要混用\n\n上游 MCP 正文以 2025-11-25 revision 为基线，本文保留该历史叙述用于学习。2026-09-09 核验的官方 2026-07-28 文档使用无状态请求元数据与 `server/discover`，并将 sampling 标为弃用。旧版初始化、能力协商等描述不能直接拼进新版请求示例。\n\n'
    versions += '[官方 2026-07-28 架构](https://modelcontextprotocol.io/docs/2026-07-28/learn/architecture) · [本站 MCP 学习页](./java-guide/agent/mcp.md)\n\n'
    versions += '接入时同时记录 Host、Client、Server、SDK 与协议版本，只使用共同支持的能力；文档的最新版本不表示所有客户端已经升级。\n\n'
    versions += '## 其他内容怎么读\n\nSDK 接口、模型价格与配额、数据库能力和产品默认值可能变化；原文的数字保留为其写作上下文，不作为今天的购买或生产配置建议。代码示例为学习材料，未逐个在具体依赖组合中运行。Prompt 中的约束不等于服务端权限。项目第一人称属于原作者，本站案例增补明确是设计练习。\n\n'
    versions += '## 审核状态\n\n`reviewing` 表示已做来源、结构、导航与构建检查，但没有宣称逐段技术审计完成。页面的 `last_verified` 是本次整理校验日期；具体规范核验以本页记录为准。发现冲突时优先查对应版本官方文档，再修订学习卡，不为统一措辞而抹掉历史基线。\n'
    write(OUT / 'version-notes.md', versions)
    sources = fm('来源、许可与修改说明', 'JavaGuide Apache-2.0 正文归属、固定提交与学习增补说明') + '# 来源、许可与修改说明\n\n'
    sources += f'## JavaGuide 来源\n\n正文与六篇导览来自 [Snailclimb/JavaGuide](https://github.com/Snailclimb/JavaGuide/tree/{PIN}/docs/ai)，固定提交 `{PIN}`。原作者及贡献者归属保留为 JavaGuide / Guide 与对应贡献者；逐页提供原文和固定源码链接。\n\n'
    sources += '[Apache License 2.0 全文](/licenses/javaguide-apache-2.0.txt) 随网站分发；仓库 `LICENSES/JavaGuide-Apache-2.0.txt` 保留相同全文，`THIRD_PARTY_NOTICES.md` 记录归属与修改。该许可说明只针对相应第三方内容，不把整个本站或其他资料一律改成该许可证。\n\n'
    sources += '## 本次修改\n\n新增学习卡、自测、实践任务、学习路线和工程章节关联；补充来源 Front Matter，适配 VitePress 标题、容器和链接。原文正文不是摘要替代。外部托管图片没有批量复制或作为自有图发布，改为可点击原图链接；源文中的 Mermaid 源码保留。公开站点 include 片段未展开。少量附件引用回到其原文页，避免把外部附件变成本站主阅读入口。\n\n'
    sources += '## 官方与论文延伸\n\n以下用于边界核对与进一步学习，不表示所有上游段落都完成了官方交叉核验。\n\n'
    for title, url in REFS.values(): sources += f'- [{title}]({url})\n'
    sources += '\n## 维护方式\n\n本次是固定版本收录，不是自动追踪上游的后台订阅。需要更新时修改固定来源清单、审阅新旧差异、重新测试后发布。生成目录中的手工改动应先合并回整理数据或记录为补丁，不能未经比较直接覆盖。\n'
    write(OUT / 'sources.md', sources)

def integrate(data: dict) -> None:
    config_path = ROOT / 'docs/.vitepress/config.mts'
    text = config_path.read_text()
    imp = "import { aiStudySidebar } from './ai-study-sidebar.mts'\n"
    if imp not in text: text = imp + text
    if "'/ai-study/': aiStudySidebar" not in text:
        needle = "'/ai-agent/': aiAgentSidebar,"
        assert needle in text, 'AI sidebar integration point changed'
        text = text.replace(needle, "'/ai-study/': aiStudySidebar,\n      " + needle, 1)
    item = "  { text: '系统学习与复习（32 篇）', link: '/ai-study/' },\n"
    if item not in text:
        needle = 'const aiAgentSidebar = [\n'
        assert needle in text
        text = text.replace(needle, needle + item, 1)
    write(config_path, text)
    side = [{'text':'学习与复习首页','link':'/ai-study/'}, {'text':'学习路线','link':'/ai-study/learning-path.md'}, {'text':'闭卷复习工作台','link':'/ai-study/review.md'}]
    for group, label in GROUPS:
        items = []
        if group: items.append({'text':'分类导览','link':PREFIX + group + '/index.md'})
        items += [{'text':c['title'],'link':PREFIX + c['file']} for c in data['articles'] if posixpath.dirname(c['file']) == group]
        side.append({'text':label,'collapsed':False if not group else True,'items':items})
    side.append({'text':'来源与核验','collapsed':True,'items':[{'text':'全量覆盖清单','link':'/ai-study/coverage.md'}, {'text':'版本校准','link':'/ai-study/version-notes.md'}, {'text':'来源与许可','link':'/ai-study/sources.md'}, {'text':'原始总览','link':PREFIX+'index.md'}]})
    side.append({'text':'返回 P7/P8 工程手册','link':'/ai-agent/'})
    write(ROOT / 'docs/.vitepress/ai-study-sidebar.mts', 'export const aiStudySidebar = ' + json.dumps(side, ensure_ascii=False, indent=2) + '\n')
    managed_append(ROOT / 'docs/ai-agent/index.md', '## 系统学习与个人复习\n\n[进入 AI 学习与复习专区](/ai-study/)：32 篇完整正文、6 篇导览、逐篇学习卡、96 道附加自测与 32 个实践练习。先用学习版打通概念，再回本工程手册做生产深挖。原有章节与面试复盘保持不变。')
    managed_append(ROOT / 'SOURCES.md', '## JavaGuide AI 学习专区：2026-09-09\n\n固定收录 JavaGuide `d76264cb4e000416c4adca06770ce014bd309150` 的 32 篇正文与 6 篇导览，按 Apache-2.0 保留署名与许可证，学习卡为本站独立增补。详见 [来源与许可](docs/ai-study/sources.md) 和 [全量覆盖清单](docs/ai-study/coverage.md)。原安全实战的独立原创性质不变；本次学习副本单独标记来源。')
    managed_append(ROOT / 'CHANGELOG.md', '## 2026-09-09 · AI 系统学习与复习\n\n新增 JavaGuide AI 固定快照 32 篇正文、6 篇导览，96 道附加自测、32 个实践练习与 14 单元学习路线。保留既有 AI 工程手册，增补来源映射、许可证、版本校准及自动化完整性验收。')

def load_sources(data: dict) -> tuple[dict, bytes, bytes | None]:
    cache = Path(tempfile.gettempdir()) / ('ai-study-' + PIN)
    cache.mkdir(exist_ok=True)
    entries = [(c['file'], c['sha']) for c in data['articles']] + [(c[0], c[1]) for c in data['guides']]
    treefile = cache / 'tree.json'
    if not treefile.exists():
        raw = download(f'https://api.github.com/repos/Snailclimb/JavaGuide/git/trees/{PIN}?recursive=1', 15_000_000)
        treefile.write_bytes(raw)
    tree = json.loads(treefile.read_bytes())
    assert not tree.get('truncated'), 'Source inventory is incomplete'
    actual = {x['path'][8:]:x['sha'] for x in tree['tree'] if x['type']=='blob' and x['path'].startswith('docs/ai/') and x['path'].endswith('.md') and x['path'] != 'docs/ai/TODO.md'}
    assert actual == dict(entries), 'Pinned inventory does not match the approved 38 source files'
    def fetch(entry):
        file, sha = entry
        location = cache / file
        if not location.exists():
            raw = download(f'{UPSTREAM}{PIN}/docs/ai/{file}')
            location.parent.mkdir(parents=True, exist_ok=True); location.write_bytes(raw)
        raw = location.read_bytes(); verify_blob(raw, sha)
        return file, raw
    with ThreadPoolExecutor(max_workers=4) as pool:
        sources = dict(pool.map(fetch, entries))
    lic_path = cache / 'LICENSE'
    if not lic_path.exists(): lic_path.write_bytes(download(f'{UPSTREAM}{PIN}/LICENSE'))
    license_data = lic_path.read_bytes(); verify_blob(license_data, LICENSE_SHA)
    notice_entries = [x for x in tree['tree'] if x['path'] in ('NOTICE', 'NOTICE.txt', 'NOTICE.md') and x['type']=='blob']
    notice = None
    if notice_entries:
        parts = []
        for entry in notice_entries:
            raw = download(f'{UPSTREAM}{PIN}/{entry["path"]}'); verify_blob(raw, entry['sha']); parts.append(raw)
        notice = b'\n\n'.join(parts)
    return sources, license_data, notice

def build() -> None:
    data = catalog()
    sources, license_data, notice = load_sources(data)
    entries = [dict(c, kind='article') for c in data['articles']] + [dict(file=x[0],sha=x[1],title=x[2],kind='guide') for x in data['guides']]
    mapping = {c['file']: PREFIX + dest(c['file']) for c in entries}
    manifest = []
    for c in entries:
        raw = sources[c['file']]
        meta, body = split_frontmatter(raw.decode('utf-8-sig'))
        title = meta.get('title') or c['title']
        transformed = normalize_body(body, c['file'], mapping)
        source = source_url(c['file'])
        header = fm(title + ' · 学习版', c['title'] + '：许可正文与个人复习', source_commit=PIN, source_blob=c['sha'], source_url=source)
        header += f'# {title}\n\n'
        header += f'> 来源：JavaGuide / Guide 与原贡献者。[原文]({source}) · [固定源码](https://github.com/Snailclimb/JavaGuide/blob/{PIN}/docs/ai/{c["file"]}) · [Apache-2.0 与修改说明](/ai-study/sources.md)。本站于 2026-09-09 增加学习卡并适配排版、链接与媒体引用。\n\n'
        header += '[学习首页](/ai-study/) · [闭卷复习](/ai-study/review.md) · [版本校准](/ai-study/version-notes.md)\n\n'
        header += '::: warning 固定快照，不等于现行规范认证\n正文版本、数字和第一人称案例保留其写作上下文。代码示例未逐一运行，外部图片请点原图链接查看；正文中的原站 include 片段未展开。个人学习与复习时请区分原作者案例、本站设计练习和自己的真实经历。\n:::\n\n'
        if c['kind']=='article': header += card_text(c)
        output = header + '## JavaGuide 正文学习 {#source-body}\n\n' + transformed
        target = OUT / 'java-guide' / dest(c['file'])
        write(target, output)
        original_codes = re.findall(r'^\s*(`{3,}|~{3,})[^\n]*\n', body, re.M)
        manifest.append(dict(kind=c['kind'],title=c['title'],source_file=c['file'],source_url=source,source_commit=PIN,source_blob=c['sha'],source_bytes=len(raw),target=dest(c['file']),output_sha256=hashlib.sha256(target.read_bytes()).hexdigest(),body_characters=len(transformed),source_fence_markers=len(original_codes),study_questions=3 if c['kind']=='article' else 0,technical_review='not_exhaustive'))
        print(f'IMPORTED {c["kind"]}: {c["file"]} ({len(raw)} source bytes)')
    write(ROOT / 'LICENSES/JavaGuide-Apache-2.0.txt', license_data.decode())
    write(ROOT / 'docs/public/licenses/javaguide-apache-2.0.txt', license_data.decode())
    notices = '# Third-party notices\n\n## JavaGuide AI study snapshot\n\nSource: Snailclimb/JavaGuide, commit ' + PIN + '.\n\nOriginal attribution: JavaGuide / Guide and the original contributors.\nLicense: Apache License, Version 2.0. Full copy: LICENSES/JavaGuide-Apache-2.0.txt.\n\nModified 2026-09-09 for learning: metadata, navigation, formatting and link adaptation, independent study cards, self-tests and exercises. External images are linked rather than copied. Original source examples are educational materials, not independently verified production code. No endorsement by upstream authors is implied.\n'
    if notice:
        write(ROOT / 'LICENSES/JavaGuide-NOTICE.txt', notice.decode())
        notices += '\n## Upstream NOTICE\n\n' + notice.decode()
    path = ROOT / 'THIRD_PARTY_NOTICES.md'
    if path.exists() and '## JavaGuide AI study snapshot' not in path.read_text():
        write(path, path.read_text() + '\n\n' + notices.split('\n\n',1)[1])
    else:
        write(path, notices)
    support_pages(data, manifest)
    integrate(data)
    write(ROOT / 'docs/public/ai-study-manifest.json', json.dumps({'source_commit':PIN,'date':data['date'],'articles':32,'guides':6,'unique_extra_questions':96,'exercises':32,'external_images':'linked_not_copied','pages':manifest},ensure_ascii=False,indent=2))
    verify()

def verify(html_only: bool = False) -> None:
    data = catalog()
    manifest = json.loads((ROOT / 'docs/public/ai-study-manifest.json').read_text())
    assert len(manifest['pages']) == 38
    assert sum(p['study_questions'] for p in manifest['pages']) == 96
    count = 0
    for item in manifest['pages']:
        target = OUT / 'java-guide' / item['target']
        text = target.read_text()
        assert hashlib.sha256(target.read_bytes()).hexdigest() == item['output_sha256']
        assert item['source_blob'] in text and PIN in text
        assert '## JavaGuide 正文学习' in text and item['body_characters'] >= 400
        if item['kind']=='article':
            card_part = text.split('## JavaGuide 正文学习')[0]
            assert card_part.count('<details>') == 3
            assert '### 动手或纸上推演' in card_part
            count += 1
        if html_only:
            built = ROOT / 'docs/.vitepress/dist/ai-study/java-guide' / (item['target'][:-3] + '.html')
            rendered = built.read_text()
            assert 'source-body' in rendered, str(built)
            assert '<script>alert' not in rendered
            if item['kind']=='article':
                assert 'study-card' in rendered and '<details' in rendered
            assert len(rendered) > 2000
    assert count == 32
    for name in ['index','learning-path','review','coverage','version-notes','sources']:
        assert (OUT / (name+'.md')).is_file()
        if html_only: assert (ROOT / 'docs/.vitepress/dist/ai-study' / (name+'.html')).is_file()
    assert 'aiStudySidebar' in (ROOT / 'docs/.vitepress/config.mts').read_text()
    assert (ROOT / 'docs/public/licenses/javaguide-apache-2.0.txt').is_file()
    print('VERIFIED: articles=32/32 guides=6/6 extra_questions=96 exercises=32' + (' built_html=44/44' if html_only else ' source_integrity=38/38'))

if __name__ == '__main__':
    parser = argparse.ArgumentParser()
    parser.add_argument('--verify', action='store_true')
    parser.add_argument('--verify-html', action='store_true')
    args = parser.parse_args()
    if args.verify or args.verify_html: verify(args.verify_html)
    else: build()
