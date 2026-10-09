import assert from 'node:assert/strict'
import { mkdir, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { setTimeout as delay } from 'node:timers/promises'
import { chromium } from 'playwright'

// Run against an already-built preview, for example:
// BASE_URL=http://127.0.0.1:4173/backend-ai-interview-handbook-zh-cn/ \
//   node scripts/verify-reading-layout.mjs
const baseUrl = new URL(
  process.env.BASE_URL ||
  `http://127.0.0.1:${process.env.PORT || '4173'}/backend-ai-interview-handbook-zh-cn/`
)
if (!baseUrl.pathname.endsWith('/')) baseUrl.pathname += '/'
const screenshotDir = path.resolve(process.env.QA_OUTPUT_DIR || process.env.SCREENSHOT_DIR || 'artifacts/reading-layout')
const pages = [
  ['guide', 'guide/'],
  ['learning-path', 'guide/learning-path.html'],
  ['topic-map', 'guide/topic-map.html'],
  ['java-concurrency', 'java/concurrency-locks-aqs-cas.html']
]
const report = { baseUrl: baseUrl.href, viewports: [], checks: [], pageErrors: [] }
let browser
let page

async function waitForPreview() {
  const target = new URL('guide/', baseUrl)
  const deadline = Date.now() + 60_000
  let lastResult = 'no response'
  while (Date.now() < deadline) {
    try {
      const response = await fetch(target, { signal: AbortSignal.timeout(3_000) })
      lastResult = `HTTP ${response.status}`
      await response.body?.cancel()
      if (response.status === 200) {
        report.checks.push('preview HTTP 200 readiness')
        return
      }
    } catch (error) {
      lastResult = error.message
    }
    await delay(500)
  }
  throw new Error(`Preview did not become ready within 60 seconds: ${target.href} (${lastResult})`)
}

async function capture(name) {
  // Viewport captures stay useful even for articles tens of thousands of pixels long.
  await page.screenshot({ path: path.join(screenshotDir, `${name}.png`), animations: 'disabled' })
}

async function visit(route) {
  const response = await page.goto(new URL(route, baseUrl).href, { waitUntil: 'networkidle' })
  assert.equal(response?.status(), 200, `page did not load: ${route}`)
  await page.locator('.vp-doc h1').waitFor()
  await page.evaluate(() => document.fonts.ready)
}

async function verifyMeasure(name) {
  const metrics = await page.evaluate(() => {
    const article = document.querySelector('.VPDoc .content-container')
    const heading = document.querySelector('.vp-doc h1')
    const aside = document.querySelector('.VPDoc .aside')
    return {
      viewport: window.innerWidth,
      document: document.documentElement.scrollWidth,
      article: article.getBoundingClientRect().width,
      heading: heading.getBoundingClientRect().width,
      asideVisible: aside !== null && getComputedStyle(aside).display !== 'none'
    }
  })
  assert.ok(metrics.document <= metrics.viewport, `${name}: horizontal page overflow`)
  assert.ok(metrics.article <= 761, `${name}: article exceeds the 760px reading measure`)
  assert.ok(metrics.article >= Math.min(300, metrics.viewport - 48), `${name}: article is squeezed`)
  assert.ok(metrics.heading <= metrics.article, `${name}: title exceeds the article width`)
  report.viewports.push({ name, ...metrics })
}

async function waitForClass(selector, className, present) {
  await page.waitForFunction(
    ({ selector, className, present }) =>
      Boolean(document.querySelector(selector)?.classList.contains(className)) === present,
    { selector, className, present }
  )
}

async function desktopChecks() {
  await page.setViewportSize({ width: 1440, height: 1000 })
  for (const [name, route] of pages) {
    await visit(route)
    await page.locator('.VPDocAsideOutline .outline-link').first().waitFor()
    await verifyMeasure(`desktop-${name}`)
    assert.ok(await page.locator('.VPSidebar').isVisible(), `${name}: missing left navigation`)
    assert.ok(await page.locator('.VPDocAsideOutline').isVisible(), `${name}: missing chapter outline`)
    await capture(`desktop-${name}`)
  }

  const activeRow = page.locator('.VPSidebar .VPSidebarItem.is-active > .item')
  assert.equal(await activeRow.count(), 1, 'article should have one selected sidebar row')
  const activeStyle = await activeRow.evaluate(el => ({
    background: getComputedStyle(el).backgroundColor,
    edge: getComputedStyle(el).boxShadow
  }))
  assert.notEqual(activeStyle.background, 'rgba(0, 0, 0, 0)', 'current page has no background')
  assert.ok(activeStyle.edge.includes('inset'), 'current page has no edge marker')
  report.checks.push('desktop current-page background and edge')

  const activeLink = activeRow.locator('a')
  await page.keyboard.press('Tab')
  await activeLink.focus()
  const focusStyle = await activeLink.evaluate(el => ({
    width: getComputedStyle(el).outlineWidth,
    style: getComputedStyle(el).outlineStyle
  }))
  assert.deepEqual(focusStyle, { width: '2px', style: 'solid' }, 'keyboard focus must be visible')
  report.checks.push('desktop keyboard focus indicator')

  const chapter = page.locator('.VPDocAsideOutline .outline-link').nth(2)
  const chapterHash = new URL(await chapter.getAttribute('href'), page.url()).hash
  await chapter.click()
  await page.waitForFunction(hash => decodeURIComponent(location.hash) === decodeURIComponent(hash), chapterHash)
  await page.waitForFunction(hash => {
    const link = [...document.querySelectorAll('.VPDocAsideOutline .outline-link')]
      .find(el => decodeURIComponent(new URL(el.href).hash) === decodeURIComponent(hash))
    return link?.classList.contains('active')
  }, chapterHash)
  await capture('desktop-chapter-navigation')
  report.checks.push('desktop chapter navigation and active heading')

  await page.locator('.VPNavBarAppearance button').click()
  await waitForClass('html', 'dark', true)
  await verifyMeasure('desktop-dark')
  await capture('desktop-dark')
  await page.locator('.VPNavBarAppearance button').click()
  await waitForClass('html', 'dark', false)
  report.checks.push('desktop dark-mode toggle and restore')
}

async function mobileChecks() {
  await page.setViewportSize({ width: 390, height: 844 })
  for (const [name, route] of pages) {
    await visit(route)
    await verifyMeasure(`mobile-${name}`)
    assert.equal(await page.locator('.VPDocAsideOutline').isVisible(), false)
    assert.ok(await page.locator('.VPLocalNav .menu').isVisible(), `${name}: missing sidebar control`)
    assert.ok(await page.locator('.VPLocalNavOutlineDropdown button').isVisible(), `${name}: missing chapter control`)
    await capture(`mobile-${name}`)
  }

  await visit('guide/')
  const sidebarMenu = page.locator('.VPLocalNav .menu')
  await sidebarMenu.click()
  await waitForClass('.VPSidebar', 'open', true)
  const rowHeights = await page.locator('.VPSidebar .VPSidebarItem > .item').evaluateAll(items =>
    items.map(item => item.getBoundingClientRect().height).filter(height => height > 0)
  )
  assert.ok(rowHeights.length > 0 && rowHeights.every(height => height >= 44), 'mobile rows must be touch-sized')
  await capture('mobile-sidebar')
  await page.keyboard.press('Escape')
  await waitForClass('.VPSidebar', 'open', false)
  await page.locator('.VPBackdrop').waitFor({ state: 'detached' })
  await sidebarMenu.click()
  await waitForClass('.VPSidebar', 'open', true)
  await page.locator('.VPSidebar a[href$="/guide/learning-path.html"]').click()
  await page.waitForURL('**/guide/learning-path.html')
  await waitForClass('.VPSidebar', 'open', false)
  await page.goBack()
  await page.waitForURL('**/guide/')
  await waitForClass('.VPSidebar', 'open', false)
  report.checks.push('mobile sidebar touch sizes, Escape, reopen, route selection and Back')

  const chapterMenu = page.locator('.VPLocalNavOutlineDropdown button')
  await chapterMenu.click()
  await page.locator('.VPLocalNavOutlineDropdown .items').waitFor()
  await capture('mobile-chapter-menu')
  await page.keyboard.press('Escape')
  await page.locator('.VPLocalNavOutlineDropdown .items').waitFor({ state: 'detached' })
  await chapterMenu.click()
  const chapterLink = page.locator('.VPLocalNavOutlineDropdown .outline-link').first()
  const chapterHash = new URL(await chapterLink.getAttribute('href'), page.url()).hash
  await chapterLink.click()
  await page.waitForFunction(hash => decodeURIComponent(location.hash) === decodeURIComponent(hash), chapterHash)
  await page.locator('.VPLocalNavOutlineDropdown .items').waitFor({ state: 'detached' })
  report.checks.push('mobile chapter menu, Escape, reopen and heading selection')

  // Return to the top so the header control is visible after chapter navigation.
  await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }))
  const topMenu = page.locator('.VPNavBarHamburger')
  await topMenu.click()
  await waitForClass('.VPNavBarHamburger', 'active', true)
  assert.equal(await topMenu.getAttribute('aria-expanded'), 'true')
  await capture('mobile-top-navigation')
  await page.locator('.VPNavScreenAppearance button').click()
  await waitForClass('html', 'dark', true)
  await topMenu.click()
  await waitForClass('.VPNavBarHamburger', 'active', false)
  assert.equal(await topMenu.getAttribute('aria-expanded'), 'false')
  await verifyMeasure('mobile-dark')
  await capture('mobile-dark')
  await topMenu.click()
  await page.locator('.VPNavScreenAppearance button').click()
  await waitForClass('html', 'dark', false)
  await topMenu.click()
  await waitForClass('.VPNavBarHamburger', 'active', false)
  report.checks.push('mobile top navigation repeated toggle and dark-mode restore')
}

await mkdir(screenshotDir, { recursive: true })
try {
  await waitForPreview()
  browser = await chromium.launch({
    ...(process.env.BROWSER_EXECUTABLE ? { executablePath: process.env.BROWSER_EXECUTABLE } : {})
  })
  page = await browser.newPage({ colorScheme: 'light', reducedMotion: 'reduce', deviceScaleFactor: 1 })
  page.setDefaultTimeout(15_000)
  page.setDefaultNavigationTimeout(45_000)
  page.on('pageerror', error => report.pageErrors.push(error.message))
  await desktopChecks()
  await mobileChecks()
  assert.deepEqual(report.pageErrors, [], 'page script errors were reported')
  report.passed = true
  console.log(`Reading layout checks passed; screenshots: ${screenshotDir}`)
} catch (error) {
  report.passed = false
  report.failure = error.stack || String(error)
  await capture('failure').catch(() => {})
  console.error(report.failure)
  process.exitCode = 1
} finally {
  await writeFile(path.join(screenshotDir, 'results.json'), JSON.stringify(report, null, 2) + '\n')
  await browser?.close()
}
