import test from 'node:test'
import assert from 'node:assert/strict'
import { existsSync, readFileSync } from 'node:fs'

const springPages = [
  'docs/spring/index.md',
  'docs/spring/01-core-architecture.md',
  'docs/spring/02-ioc-di-container.md',
  'docs/spring/03-bean-lifecycle-extension-points.md',
  'docs/spring/04-dependency-injection-circular-reference.md',
  'docs/spring/05-aop-proxy-interceptor.md',
  'docs/spring/06-transaction-principles.md',
  'docs/spring/07-spring-mvc-request-flow.md',
  'docs/spring/08-spring-boot-startup-auto-configuration.md',
  'docs/spring/09-annotations-events-cache-async.md',
  'docs/spring/10-scope-thread-safety.md',
  'docs/spring/11-source-code-flows.md',
  'docs/spring/12-production-troubleshooting.md',
  'docs/spring/13-interview-question-bank.md'
]

const springRoutes = [
  '/spring/',
  ...springPages.slice(1).map(path => path.replace(/^docs/, ''))
]

test('Spring module exposes the complete canonical page set', () => {
  for (const page of springPages) {
    assert.equal(existsSync(page), true, `missing Spring page: ${page}`)
  }
})

test('global navigation and sidebar expose every Spring chapter', () => {
  const config = readFileSync('docs/.vitepress/config.mts', 'utf8')
  assert.match(config, /text:\s*['"]Spring['"],\s*link:\s*['"]\/spring\/['"]/)
  assert.match(config, /['"]\/spring\/['"]:\s*springSidebar/)

  for (const route of springRoutes) {
    assert.match(config, new RegExp(route.replaceAll('/', '\\/')))
  }
})

test('homepage, learning path, and Java index link to the Spring module', () => {
  const home = readFileSync('docs/index.md', 'utf8')
  const learningPath = readFileSync('docs/guide/learning-path.md', 'utf8')
  const javaIndex = readFileSync('docs/java/index.md', 'utf8')

  assert.match(home, /Spring/)
  assert.match(learningPath, /\.\.\/spring\//)
  assert.match(javaIndex, /\.\.\/spring\//)
})

test('legacy Spring transaction page points to the canonical transaction chapter', () => {
  const legacy = readFileSync(
    'docs/java/spring-transactions-service-governance.md',
    'utf8'
  )
  assert.match(legacy, /\.\.\/spring\/06-transaction-principles\.md/)
})

test('Spring quick-review bank contains at least 80 numbered questions', () => {
  const bank = readFileSync('docs/spring/13-interview-question-bank.md', 'utf8')
  const questions = bank.match(/^#{3,4}\s+(?:Q)?\d+\./gm) ?? []
  assert.ok(
    questions.length >= 80,
    `expected at least 80 Spring questions, found ${questions.length}`
  )
})

test('Bean creation content distinguishes registration from instantiation', () => {
  const ioc = readFileSync('docs/spring/02-ioc-di-container.md', 'utf8')
  const source = readFileSync('docs/spring/11-source-code-flows.md', 'utf8')
  const bank = readFileSync('docs/spring/13-interview-question-bank.md', 'utf8')

  for (const keyword of [
    '注册 Bean 的常见方式',
    '@Component',
    '@Bean',
    '@Import',
    'FactoryBean',
    'BeanDefinitionRegistry',
    'BeanDefinitionRegistryPostProcessor',
    'Spring Boot 自动配置'
  ]) {
    assert.match(ioc, new RegExp(keyword))
  }

  for (const keyword of [
    '底层实例化 Bean 的方式',
    '构造器实例化',
    '静态工厂方法',
    '实例工厂方法',
    'Supplier'
  ]) {
    assert.match(ioc, new RegExp(keyword))
  }

  for (const keyword of [
    'createBeanInstance',
    'obtainFromSupplier',
    'instantiateUsingFactoryMethod',
    'getObjectFromFactoryBean'
  ]) {
    assert.match(source, new RegExp(keyword))
  }

  assert.match(bank, /Spring 中有哪些方式注册 Bean/)
})
