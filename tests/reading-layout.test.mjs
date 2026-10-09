import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'

const css = readFileSync('docs/.vitepress/theme/custom.css', 'utf8')

test('reading column has a bounded measure on wide screens', () => {
  assert.match(css, /--handbook-reading-width:\s*760px/)
  assert.match(css, /max-width:\s*var\(--handbook-reading-width\)/)
})

test('current sidebar page is marked by a background and a visible edge', () => {
  const active = css.match(/\.VPSidebar\s+\.VPSidebarItem\.is-active\s*>\s*\.item\s*\{([^}]+)\}/)?.[1]
  assert.ok(active, 'missing active-page row styling')
  assert.match(active, /background:\s*var\(--vp-c-brand-soft\)/)
  assert.match(active, /box-shadow:\s*inset\s+3px\s+0\s+0\s+var\(--vp-c-brand-1\)/)
})

test('sidebar and chapter links provide a visible keyboard focus outline', () => {
  assert.match(css, /\.VPSidebar\s+\.link:focus-visible/)
  assert.match(css, /\.VPDocAsideOutline\s+\.outline-link:focus-visible\s*\{\s*outline:\s*2px solid var\(--vp-c-brand-1\)/)
})

test('chapter outline distinguishes the active heading', () => {
  assert.match(css, /\.VPDocAsideOutline\s+\.outline-link\.active\s*\{[^}]*font-weight:\s*600/s)
})

test('narrow-screen navigation keeps touch-sized rows without opening every group', () => {
  assert.match(css, /@media\s*\(max-width:\s*959px\)\s*\{\s*\.VPSidebar\s+\.VPSidebarItem\s*>\s*\.item\s*\{\s*min-height:\s*44px/s)
  assert.doesNotMatch(css, /\.VPSidebarItem\.collapsed\s+\.items\s*\{[^}]*display:\s*(?:block|flex|grid)/s)
})
