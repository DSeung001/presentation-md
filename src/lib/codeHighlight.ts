import hljs from 'highlight.js'
import { marked } from 'marked'
import { markedHighlight } from 'marked-highlight'

/** git 하위 명령: 역할별 토큰 색 (github-dark 기준). */
const GIT_SUBCOMMANDS = [
  // 브랜치/이동 — keyword (#ff7b72)
  {
    className: 'keyword',
    begin:
      /(?<=\s)(?:switch|checkout|branch|merge|rebase|cherry-pick|restore|revert|bisect)\b/,
  },
  // 기록/인덱스 — title (#d2a8ff)
  {
    className: 'title',
    begin: /(?<=\s)(?:add|commit|stash|reset|rm|mv|clean)\b/,
  },
  // 원격 동기화 — name (#7ee787)
  {
    className: 'name',
    begin: /(?<=\s)(?:fetch|pull|push|clone|remote|submodule)\b/,
  },
  // 조회 — literal (#79c0ff)
  {
    className: 'literal',
    begin:
      /(?<=\s)(?:status|log|diff|show|blame|tag|rev-parse|ls-files|describe)\b/,
  },
]

/** 발표용 CLI 명령줄: 명령어 / 플래그 / 문자열을 색칠한다. */
function cliLanguage(hljsApi: typeof hljs) {
  const stringsAndFlags = [
    hljsApi.QUOTE_STRING_MODE,
    hljsApi.APOS_STRING_MODE,
    {
      className: 'attr',
      // 공백 뒤의 --flag / -f 만 매칭 (경로 중간의 - 제외)
      begin: /(?<=\s)(--[\w-]+|-[A-Za-z][\w-]*)/,
    },
  ]

  const argsContains = (extra: typeof GIT_SUBCOMMANDS = []) => ({
    end: /$/,
    contains: [...extra, ...stringsAndFlags],
  })

  return {
    name: 'CLI',
    aliases: ['console'],
    contains: [
      {
        begin: /^/,
        end: /$/,
        returnBegin: true,
        contains: [
          {
            className: 'meta',
            begin: /^\s*\$\s+/,
          },
          {
            className: 'built_in',
            begin: /\bgit\b/,
            end: /\s|$/,
            excludeEnd: true,
            starts: argsContains(GIT_SUBCOMMANDS),
          },
          {
            className: 'built_in',
            begin: /\S+/,
            end: /\s|$/,
            excludeEnd: true,
            starts: argsContains(),
          },
        ],
      },
    ],
  }
}

hljs.registerLanguage('cli', cliLanguage)

/** 마크다운 fence 별칭 → highlight.js 언어 이름 */
const LANG_ALIASES: Record<string, string> = {
  html: 'xml',
  htm: 'xml',
  js: 'javascript',
  jsx: 'javascript',
  ts: 'typescript',
  tsx: 'typescript',
  py: 'python',
  golang: 'go',
  sh: 'bash',
  shell: 'bash',
  zsh: 'bash',
  console: 'cli',
  cli: 'cli',
  yml: 'yaml',
  md: 'markdown',
  dockerfile: 'dockerfile',
  docker: 'dockerfile',
  'c++': 'cpp',
  'c#': 'csharp',
  cs: 'csharp',
  rs: 'rust',
  kt: 'kotlin',
  rb: 'ruby',
  plaintext: 'plaintext',
  text: 'plaintext',
  txt: 'plaintext',
}

function normalizeLang(lang: string | undefined): string | undefined {
  if (!lang) return undefined
  const key = lang.trim().toLowerCase()
  const aliased = LANG_ALIASES[key] ?? key
  if (hljs.getLanguage(aliased)) return aliased
  return undefined
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

/** fence info에서 언어 토큰만 추출 (`python {scale=sm}` → `python`) */
function fenceLangToken(info: string | undefined): string {
  return (info || '').match(/\S*/)?.[0] ?? ''
}

type FenceMeta = {
  className?: string
  style?: string
  path?: string
}

/**
 * ```lang {scale=xs|sm|md|lg|0.85, path=api/app/main.py}
 * xs/sm/md/lg 프리셋 또는 양수 배율. md는 기본 크기와 동일해 생략한다.
 * path는 루트 기준 파일 경로 라벨.
 */
function parseFenceMeta(info: string | undefined): FenceMeta {
  if (!info) return {}
  const brace = info.match(/\{([^}]*)\}/)
  if (!brace) return {}
  const inner = brace[1]
  const meta: FenceMeta = {}

  const scaleRaw = inner.match(/(?:^|[\s,])scale\s*=\s*([^\s,}]+)/i)?.[1]
  if (scaleRaw) {
    const key = scaleRaw.toLowerCase()
    if (key === 'md') {
      // default size
    } else if (key === 'xs' || key === 'sm' || key === 'lg') {
      meta.className = `code-scale-${key}`
    } else {
      const num = Number(key)
      if (Number.isFinite(num) && num > 0 && num <= 3) {
        meta.style = `font-size: ${num}em`
      }
    }
  }

  const pathQuoted = inner.match(/(?:^|[\s,])path\s*=\s*"([^"]+)"/i)?.[1]
  const pathBare = inner.match(/(?:^|[\s,])path\s*=\s*([^\s,}]+)/i)?.[1]
  const pathRaw = pathQuoted ?? pathBare
  if (pathRaw) {
    meta.path = pathRaw
  }

  return meta
}

marked.use(
  markedHighlight({
    async: false,
    langPrefix: 'hljs language-',
    highlight(code, lang) {
      const language = normalizeLang(lang)
      if (!language) {
        return escapeHtml(code)
      }
      return hljs.highlight(code, { language }).value
    },
  }),
)

// marked-highlight 렌더러를 덮어 scale / path를 붙인다.
// Viewer(슬라이드/전체보기)와 PDF export가 같은 HTML을 쓰므로 한 경로로 충분하다.
marked.use({
  renderer: {
    code({ text, lang, escaped }) {
      const language = fenceLangToken(lang)
      const meta = parseFenceMeta(lang)
      const codeClass = language
        ? ` class="hljs language-${escapeHtml(language)}"`
        : ''

      const preAttrs: string[] = []
      if (meta.className) preAttrs.push(`class="${meta.className}"`)
      if (meta.style) preAttrs.push(`style="${meta.style}"`)
      const preOpen = preAttrs.length > 0 ? `<pre ${preAttrs.join(' ')}>` : '<pre>'

      const body = (escaped ? text : escapeHtml(text)).replace(/\n$/, '')
      const preBlock = `${preOpen}<code${codeClass}>${body}\n</code></pre>`

      if (!meta.path) return preBlock

      const pathLabel = escapeHtml(meta.path)
      return `<div class="code-with-path"><div class="code-path">${pathLabel}</div>${preBlock}</div>`
    },
  },
})
