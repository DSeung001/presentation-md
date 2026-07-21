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
