import hljs from 'highlight.js/lib/core'
import css from 'highlight.js/lib/languages/css'
import go from 'highlight.js/lib/languages/go'
import javascript from 'highlight.js/lib/languages/javascript'
import json from 'highlight.js/lib/languages/json'
import python from 'highlight.js/lib/languages/python'
import typescript from 'highlight.js/lib/languages/typescript'
import xml from 'highlight.js/lib/languages/xml'
import { marked } from 'marked'
import { markedHighlight } from 'marked-highlight'

const LANG_ALIASES: Record<string, string> = {
  html: 'xml',
  xml: 'xml',
  js: 'javascript',
  javascript: 'javascript',
  css: 'css',
  go: 'go',
  golang: 'go',
  python: 'python',
  py: 'python',
  json: 'json',
  ts: 'typescript',
  typescript: 'typescript',
}

hljs.registerLanguage('xml', xml)
hljs.registerLanguage('javascript', javascript)
hljs.registerLanguage('css', css)
hljs.registerLanguage('go', go)
hljs.registerLanguage('python', python)
hljs.registerLanguage('json', json)
hljs.registerLanguage('typescript', typescript)

function normalizeLang(lang: string | undefined): string | undefined {
  if (!lang) return undefined
  const key = lang.trim().toLowerCase()
  return LANG_ALIASES[key]
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

marked.use(
  markedHighlight({
    async: false,
    langPrefix: 'hljs language-',
    highlight(code, lang) {
      const language = normalizeLang(lang)
      if (!language || !hljs.getLanguage(language)) {
        return escapeHtml(code)
      }
      return hljs.highlight(code, { language }).value
    },
  }),
)
