import test from 'node:test'
import assert from 'node:assert/strict'
import { existsSync, readFileSync } from 'node:fs'

const requiredFiles = [
  'package.json',
  'docs/index.md',
  'docs/.vitepress/config.mts',
  '.github/workflows/deploy.yml'
]

const domainRoutes = [
  '/java/',
  '/jvm/',
  '/mysql/',
  '/kafka/',
  '/redis/',
  '/elasticsearch/',
  '/ai-agent/',
  '/finance-payment-ddd/',
  '/system-design/'
]

test('required site files exist', () => {
  for (const file of requiredFiles) {
    assert.equal(existsSync(file), true, `missing required file: ${file}`)
  }
})

test('VitePress uses the repository Pages base path', () => {
  const config = readFileSync('docs/.vitepress/config.mts', 'utf8')
  assert.match(
    config,
    /base:\s*['"]\/backend-ai-interview-handbook-zh-cn\/['"]/
  )
})

test('navigation exposes every handbook domain', () => {
  const config = readFileSync('docs/.vitepress/config.mts', 'utf8')
  for (const route of domainRoutes) {
    assert.match(config, new RegExp(route.replaceAll('/', '\\/')))
  }
})

test('GitHub Pages workflow validates, builds, and deploys the site', () => {
  const workflow = readFileSync('.github/workflows/deploy.yml', 'utf8')
  for (const expected of [
    'npm ci',
    'npm run check',
    'npm run docs:build',
    'actions/configure-pages@',
    'actions/upload-pages-artifact@',
    'actions/deploy-pages@'
  ]) {
    assert.match(workflow, new RegExp(expected.replaceAll('/', '\\/')))
  }
})

test('Mermaid diagrams are rendered by the VitePress integration', () => {
  const config = readFileSync('docs/.vitepress/config.mts', 'utf8')
  const packageJson = JSON.parse(readFileSync('package.json', 'utf8'))

  assert.match(config, /withMermaid/)
  assert.equal(
    typeof packageJson.devDependencies['vitepress-plugin-mermaid'],
    'string'
  )
  assert.equal(typeof packageJson.devDependencies.mermaid, 'string')
})
