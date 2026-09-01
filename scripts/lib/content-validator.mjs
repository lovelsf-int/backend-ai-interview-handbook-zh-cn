import path from 'node:path'

const REQUIRED_FRONT_MATTER = [
  'title',
  'description',
  'status',
  'baseline',
  'last_verified',
  'level',
  'source'
]

const ATTACHMENT_EXTENSIONS = new Set(['.docx', '.pdf'])
const NON_DOCUMENT_EXTENSIONS = new Set([
  '.avif', '.gif', '.jpeg', '.jpg', '.png', '.svg', '.webp',
  '.css', '.js', '.json', '.mjs', '.ts', '.tsx', '.vue', '.yaml', '.yml'
])

function issue(code, message, line = 1) {
  return { code, message, line }
}

function parseFrontMatter(markdown) {
  const match = markdown.match(/^---\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)/)
  if (!match) return null

  const keys = new Set()
  const values = new Map()
  for (const line of match[1].split(/\r?\n/)) {
    const keyMatch = line.match(/^([A-Za-z_][\w-]*):\s*(.*)$/)
    if (keyMatch) {
      keys.add(keyMatch[1])
      values.set(keyMatch[1], keyMatch[2].replace(/^['"]|['"]$/g, '').trim())
    }
  }

  return { keys, values, endOffset: match[0].length }
}

function withoutFencedCode(markdown) {
  const lines = markdown.split(/\r?\n/)
  let fence = null

  return lines.map(line => {
    const fenceMatch = line.match(/^\s*(`{3,}|~{3,})/)
    if (fenceMatch) {
      const marker = fenceMatch[1][0]
      if (fence === null) fence = marker
      else if (fence === marker) fence = null
      return ''
    }
    return fence === null ? line : ''
  })
}

function lineNumber(markdown, offset) {
  return markdown.slice(0, offset).split(/\r?\n/).length
}

function normalizeHeading(raw) {
  return raw
    .replace(/[`*_~]/g, '')
    .replace(/\s+#+\s*$/, '')
    .trim()
    .toLocaleLowerCase('zh-CN')
}

function localTargetCandidates(filePath, href) {
  const cleanHref = decodeURI(href.split('#')[0].split('?')[0]).replace(/\\/g, '/')
  if (!cleanHref) return []

  const base = cleanHref.startsWith('/')
    ? path.posix.join('docs', cleanHref)
    : path.posix.join(path.posix.dirname(filePath), cleanHref)
  const normalized = path.posix.normalize(base)
  const extension = path.posix.extname(normalized)

  if (NON_DOCUMENT_EXTENSIONS.has(extension)) return []
  if (extension && extension !== '.md') return []

  if (extension === '.md') return [normalized]
  return [normalized, `${normalized}.md`, path.posix.join(normalized, 'index.md')]
}

function shouldIgnoreLink(href) {
  return href.startsWith('#') ||
    href.startsWith('//') ||
    /^(?:https?:|mailto:|tel:|data:)/i.test(href)
}

function isSourceMediaPath(href) {
  const pathname = href.split('#')[0].split('?')[0].replace(/\\/g, '/')
  return /(?:^|\/)media\//i.test(pathname)
}

export function validateDocument(markdown, filePath, existingPaths) {
  const issues = []
  const frontMatter = parseFrontMatter(markdown)

  if (!frontMatter) {
    return [issue('frontmatter-missing', '缺少 YAML Front Matter')]
  }

  const missingFields = REQUIRED_FRONT_MATTER.filter(
    field => !frontMatter.keys.has(field)
  )
  if (missingFields.length > 0) {
    issues.push(issue(
      'frontmatter-fields',
      `缺少 Front Matter 字段: ${missingFields.join(', ')}`
    ))
  }

  const visibleLines = withoutFencedCode(markdown)
  const h1Lines = []
  const h2Seen = new Map()

  visibleLines.forEach((line, index) => {
    const h1 = line.match(/^#\s+(.+?)\s*$/)
    if (h1) h1Lines.push(index + 1)

    const h2 = line.match(/^##\s+(.+?)\s*$/)
    if (h2) {
      const normalized = normalizeHeading(h2[1])
      if (h2Seen.has(normalized)) {
        issues.push(issue(
          'duplicate-h2',
          `重复二级标题: ${h2[1]}`,
          index + 1
        ))
      } else {
        h2Seen.set(normalized, index + 1)
      }
    }
  })

  const pandocTableLine = visibleLines.findIndex(
    line => /<\/?(?:table|colgroup|col|thead|tbody|tr|th|td)\b/i.test(line)
  )
  if (pandocTableLine >= 0) {
    issues.push(issue(
      'pandoc-html-table',
      '不能保留 Pandoc 导出的原始 HTML 表格包装',
      pandocTableLine + 1
    ))
  }

  if (h1Lines.length === 0 && frontMatter.values.get('layout') !== 'home') {
    issues.push(issue('h1-missing', '正文缺少一级标题'))
  } else if (h1Lines.length > 1) {
    issues.push(issue(
      'multiple-h1',
      `正文包含 ${h1Lines.length} 个一级标题`,
      h1Lines[1]
    ))
  }

  const imagePatterns = [
    /!\[[^\]]*\]\(([^)\s]+)(?:\s+["'][^"']*["'])?\)/g,
    /<img\b[^>]*\bsrc=["']([^"']+)["'][^>]*>/gi
  ]
  for (const imagePattern of imagePatterns) {
    for (const match of markdown.matchAll(imagePattern)) {
      const href = match[1].replace(/^<|>$/g, '')
      if (!isSourceMediaPath(href)) continue
      issues.push(issue(
        'source-media-image',
        `不能引用源文档导出的 media 图片: ${href}`,
        lineNumber(markdown, match.index ?? 0)
      ))
    }
  }

  const linkPattern = /(?<!!)\[[^\]]*\]\(([^)\s]+)(?:\s+["'][^"']*["'])?\)/g
  for (const match of markdown.matchAll(linkPattern)) {
    const href = match[1].replace(/^<|>$/g, '')
    const extension = path.posix.extname(href.split('#')[0].split('?')[0]).toLowerCase()
    const line = lineNumber(markdown, match.index ?? 0)

    if (ATTACHMENT_EXTENSIONS.has(extension)) {
      issues.push(issue(
        'attachment-link',
        `主阅读内容不能链接源附件: ${href}`,
        line
      ))
      continue
    }

    if (shouldIgnoreLink(href)) continue
    const candidates = localTargetCandidates(filePath, href)
    if (candidates.length > 0 && !candidates.some(candidate => existingPaths.has(candidate))) {
      issues.push(issue(
        'missing-local-link',
        `本地链接目标不存在: ${href}`,
        line
      ))
    }
  }

  return issues
}
