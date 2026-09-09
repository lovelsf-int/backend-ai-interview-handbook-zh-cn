import test from 'node:test'
import assert from 'node:assert/strict'
import { existsSync } from 'node:fs'
const moduleUrl = new URL('../docs/.vitepress/ai-study-images.mjs', import.meta.url)
test('inline image renderer exists', () => assert.ok(existsSync(moduleUrl)))
if (existsSync(moduleUrl)) {
  const { safeImageUrl, renderStudyImage, transformStudyImages } = await import(moduleUrl)
  const url = 'https://oss.javaguide.cn/github/javaguide/ai/skills/mcp-simple-diagram.png'
  test('renders a real lazy inline image and keeps its original link', () => {
    const html = renderStudyImage(url, 'MCP 图解')
    assert.match(html, /<img /)
    assert.match(html, /alt="MCP 图解"/)
    assert.match(html, /loading="lazy"/)
    assert.match(html, /decoding="async"/)
    assert.match(html, /referrerpolicy="no-referrer"/)
    assert.match(html, /查看原图/)
    assert.match(html, /rel="noopener noreferrer"/)
    assert.equal((html.match(/<img /g) || []).length, 1)
  })
  test('rejects non-image, private, lookalike, credentialed and unsafe URLs', () => {
    for (const bad of ['javascript:alert(1)', 'data:image/svg+xml,xxx', 'http://127.0.0.1/x.png', 'https://oss.javaguide.cn.evil.invalid/a.png', 'https://oss.javaguide.cn:444/a.png', 'https://user:pass@oss.javaguide.cn/a.png', 'https://oss.javaguide.cn/a.html', 'https://example.com/a.png']) {
      assert.equal(safeImageUrl(bad), null, bad)
      assert.equal(renderStudyImage(bad, 'x'), null, bad)
    }
    assert.equal(safeImageUrl(url), url)
  })
  test('caption text cannot become HTML, attributes or Vue interpolation', () => {
    const html = renderStudyImage(url, '<script>"{{bad}}</script>')
    assert.ok(!html.includes('<script>'))
    assert.ok(!html.includes('{{bad}}'))
    assert.match(html, /&lt;script&gt;/)
  })
  class Token { constructor(type, tag, nesting) { Object.assign(this, {type, tag, nesting}) } }
  const state = (relativePath, label = '原图：MCP 图解', src = url) => ({
    Token, env: {relativePath}, tokens: [{type: 'inline', children: [
      {type: 'link_open', attrGet: key => key === 'href' ? src : null},
      {type: 'text', content: label}, {type: 'link_close'}
    ]}]
  })
  test('changes only explicit image references inside the study source pages', () => {
    const s = state('ai-study/java-guide/agent/mcp.md')
    transformStudyImages(s)
    assert.equal(s.tokens[0].children.length, 1)
    assert.equal(s.tokens[0].children[0].type, 'html_inline')
    assert.match(s.tokens[0].children[0].content, /<img /)
    const before = s.tokens[0].children[0].content
    transformStudyImages(s)
    assert.equal(s.tokens[0].children[0].content, before)
    for (const s of [state('java/index.md'), state('ai-study/java-guide/a.md', '普通链接'), state('ai-study/java-guide/a.md', '原图：x', 'https://example.com/x.png')]) {
      transformStudyImages(s)
      assert.equal(s.tokens[0].children[0].type, 'link_open')
    }
  })
  test('code examples and missing paths stay unchanged', () => {
    const fence = {type: 'fence', content: `[原图：例子](${url})`}
    const s = {Token, env: {}, tokens: [fence]}
    transformStudyImages(s)
    assert.equal(s.tokens[0], fence)
  })
}
