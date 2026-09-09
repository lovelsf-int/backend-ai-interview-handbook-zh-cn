/** Render attributed upstream image references without copying external assets.
 * This build-time transform is scoped to the imported AI learning pages.
 * Unsafe/unapproved URLs remain ordinary links; upstream HTML is never trusted.
 */
const imageHosts = new Set(['oss.javaguide.cn', 'javaguide.cn'])
const escapeHtml = value => String(value).replace(/[&<>"'{}]/g, char => ({
  '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
  '{': '&#123;', '}': '&#125;'
}[char]))

export function safeImageUrl(value) {
  try {
    const url = new URL(value)
    if (url.protocol !== 'https:' || !imageHosts.has(url.hostname) ||
        url.username || url.password || url.port ||
        !/\.(?:png|jpe?g|gif|webp|avif|svg)$/i.test(url.pathname)) return null
    return url.href
  } catch { return null }
}

export function renderStudyImage(source, description) {
  const url = safeImageUrl(source)
  if (!url) return null
  const src = escapeHtml(url)
  const alt = escapeHtml(description || '原文配图')
  // Use spans so this is also valid inside paragraphs, lists and table cells.
  return '<span class="ai-study-figure">' +
    `<a class="ai-study-image-link" href="${src}" target="_blank" rel="noopener noreferrer" aria-label="查看原图：${alt}">` +
    `<img class="ai-study-image" src="${src}" alt="${alt}" loading="lazy" decoding="async" referrerpolicy="no-referrer"></a>` +
    `<span class="ai-study-image-caption">原图：${alt} · <a href="${src}" target="_blank" rel="noopener noreferrer">查看原图</a></span></span>`
}

export function transformStudyImages(state) {
  const path = String(state.env?.relativePath || '').replaceAll('\\', '/')
  if (!path.replace(/^\//, '').startsWith('ai-study/java-guide/')) return
  for (const token of state.tokens) {
    if (token.type !== 'inline' || !token.children) continue
    const children = token.children
    for (let i = 0; i < children.length - 2; i++) {
      const [open, label, close] = children.slice(i, i + 3)
      if (open.type !== 'link_open' || label.type !== 'text' ||
          close.type !== 'link_close' || !label.content.startsWith('原图：')) continue
      const content = renderStudyImage(open.attrGet('href'), label.content.slice(3).trim())
      if (!content) continue
      const image = new state.Token('html_inline', '', 0)
      image.content = content
      children.splice(i, 3, image)
    }
  }
}

export default function aiStudyImages(md) {
  md.core.ruler.after('inline', 'ai-study-inline-images', transformStudyImages)
}
