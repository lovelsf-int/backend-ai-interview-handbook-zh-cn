#!/usr/bin/env node

import { readdirSync, readFileSync, statSync } from 'node:fs'
import path from 'node:path'
import process from 'node:process'

import { validateDocument } from './lib/content-validator.mjs'

const root = path.posix.normalize((process.argv[2] ?? 'docs').replace(/\\/g, '/'))

function walk(directory) {
  const entries = readdirSync(directory, { withFileTypes: true })
  const files = []

  for (const entry of entries) {
    const fullPath = path.posix.join(directory, entry.name)
    if (entry.isDirectory()) {
      if (entry.name === '.vitepress' || entry.name === 'superpowers') continue
      files.push(...walk(fullPath))
    } else if (entry.isFile() && entry.name.endsWith('.md')) {
      files.push(fullPath)
    }
  }

  return files
}

if (!statSync(root).isDirectory()) {
  console.error(`Not a directory: ${root}`)
  process.exit(1)
}

const markdownFiles = walk(root).sort()
const existingPaths = new Set(markdownFiles.map(file => path.posix.normalize(file)))
let issueCount = 0

for (const file of markdownFiles) {
  const markdown = readFileSync(file, 'utf8')
  const issues = validateDocument(markdown, file, existingPaths)
  for (const item of issues) {
    issueCount += 1
    console.error(`${file}:${item.line} [${item.code}] ${item.message}`)
  }
}

if (issueCount > 0) {
  console.error(`Validation failed with ${issueCount} issue(s).`)
  process.exit(1)
}

console.log(`Validated ${markdownFiles.length} Markdown file(s).`)
