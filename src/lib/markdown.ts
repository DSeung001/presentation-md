import { marked } from 'marked'
import './codeHighlight'
import DOMPurify from 'dompurify'
import {
  type DocFonts,
  resolveDocFonts,
} from './fonts'
import { wrapLatin } from './wrapLatin'

export type { DocFonts, FontPreset } from './fonts'
export { FONT_PRESETS, fontStacksToStyle, getDocFontStacks } from './fonts'

export type DocMeta = {
  slug: string
  title: string
  date?: string
  fontKo: DocFonts['fontKo']
  fontEn: DocFonts['fontEn']
}

export type ParsedDoc = {
  slug: string
  title: string
  date?: string
  fontKo: DocFonts['fontKo']
  fontEn: DocFonts['fontEn']
  body: string
  slides: string[]
  scrollHtml: string
  slideHtmls: string[]
}

const SLIDE_SPLIT = /\n---\n/

function parseFrontmatter(raw: string): {
  data: Record<string, string>
  content: string
} {
  const match = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/)
  if (!match) {
    return { data: {}, content: raw }
  }

  const data: Record<string, string> = {}
  for (const line of match[1].split(/\r?\n/)) {
    const idx = line.indexOf(':')
    if (idx === -1) continue
    const key = line.slice(0, idx).trim()
    const value = line.slice(idx + 1).trim().replace(/^["']|["']$/g, '')
    if (key) data[key] = value
  }

  return { data, content: match[2] }
}

function parseDate(value: string | undefined): string | undefined {
  const raw = value?.trim()
  return raw || undefined
}

export function formatDocDate(date: string): string {
  const parsed = Date.parse(date)
  if (Number.isNaN(parsed)) return date
  return new Intl.DateTimeFormat('ko-KR', { dateStyle: 'long' }).format(
    new Date(parsed),
  )
}

function renderMarkdown(md: string): string {
  const raw = marked.parse(md, { async: false }) as string
  const safe = DOMPurify.sanitize(raw)
  return wrapLatin(safe)
}

export function parseMarkdown(raw: string, slug: string): ParsedDoc {
  const { data, content } = parseFrontmatter(raw)
  const title = data.title?.trim() ? data.title.trim() : slug
  const date = parseDate(data.date)
  const { fontKo, fontEn } = resolveDocFonts(data)

  const body = content.trim()
  const slides = body
    .split(SLIDE_SPLIT)
    .map((s) => s.trim())
    .filter(Boolean)

  const scrollParts = slides.map((slide, i) => {
    const html = renderMarkdown(slide)
    if (i === 0) return html
    return `<hr class="slide-break" />${html}`
  })

  return {
    slug,
    title,
    date,
    fontKo,
    fontEn,
    body,
    slides,
    scrollHtml: scrollParts.join(''),
    slideHtmls: slides.map(renderMarkdown),
  }
}

const modules = import.meta.glob('../../content/**/*.md', {
  query: '?raw',
  import: 'default',
  eager: true,
}) as Record<string, string>

function slugFromPath(path: string): string {
  const match = path.match(/\/([^/]+)\.md$/)
  return match?.[1] ?? path
}

export function listDocs(): DocMeta[] {
  return Object.entries(modules)
    .map(([path, raw]) => {
      const slug = slugFromPath(path)
      const { data } = parseFrontmatter(raw)
      const title = data.title?.trim() ? data.title.trim() : slug
      const date = parseDate(data.date)
      const { fontKo, fontEn } = resolveDocFonts(data)
      return { slug, title, date, fontKo, fontEn }
    })
    .sort((a, b) => {
      if (a.date && b.date) {
        const diff = Date.parse(b.date) - Date.parse(a.date)
        if (diff !== 0) return diff
      } else if (a.date) {
        return -1
      } else if (b.date) {
        return 1
      }
      return a.title.localeCompare(b.title, 'ko')
    })
}

export function getDoc(slug: string): ParsedDoc | null {
  const entry = Object.entries(modules).find(
    ([path]) => slugFromPath(path) === slug,
  )
  if (!entry) return null
  return parseMarkdown(entry[1], slug)
}
