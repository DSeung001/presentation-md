import { marked } from 'marked'
import DOMPurify from 'dompurify'

export type DocMeta = {
  slug: string
  title: string
}

export type ParsedDoc = {
  slug: string
  title: string
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

function renderMarkdown(md: string): string {
  const raw = marked.parse(md, { async: false }) as string
  return DOMPurify.sanitize(raw)
}

export function parseMarkdown(raw: string, slug: string): ParsedDoc {
  const { data, content } = parseFrontmatter(raw)
  const title = data.title?.trim() ? data.title.trim() : slug

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
      return { slug, title }
    })
    .sort((a, b) => a.title.localeCompare(b.title, 'ko'))
}

export function getDoc(slug: string): ParsedDoc | null {
  const entry = Object.entries(modules).find(
    ([path]) => slugFromPath(path) === slug,
  )
  if (!entry) return null
  return parseMarkdown(entry[1], slug)
}
