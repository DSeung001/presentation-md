let mermaidPromise: Promise<(typeof import('mermaid'))['default']> | undefined
let renderSeq = 0

function loadMermaid() {
  mermaidPromise ??= import('mermaid').then(({ default: mermaid }) => {
    mermaid.initialize({
      startOnLoad: false,
      securityLevel: 'strict',
      theme: 'neutral',
    })
    return mermaid
  })
  return mermaidPromise
}

/**
 * Mermaid 코드 블록을 SVG HTML로 한 번 치환한다.
 * 이미 치환된 HTML(language-mermaid 없음)은 그대로 반환한다.
 */
export async function hydrateMermaidHtml(
  html: string,
  signal?: AbortSignal,
): Promise<string> {
  if (!html.includes('language-mermaid')) return html

  const template = document.createElement('template')
  template.innerHTML = html

  const codeBlocks = [
    ...template.content.querySelectorAll<HTMLElement>(
      'pre > code.language-mermaid',
    ),
  ]
  if (codeBlocks.length === 0) return html

  const mermaid = await loadMermaid()
  if (signal?.aborted) return html

  for (const codeBlock of codeBlocks) {
    if (signal?.aborted) break

    const source = codeBlock.textContent ?? ''
    const id = `mermaid-${++renderSeq}-${Math.random().toString(36).slice(2, 9)}`

    try {
      const { svg } = await mermaid.render(id, source)
      if (signal?.aborted) break

      const container = document.createElement('div')
      container.className = 'mermaid'
      container.setAttribute('data-processed', 'true')
      container.innerHTML = svg
      codeBlock.parentElement?.replaceWith(container)
    } catch (error) {
      console.error('Mermaid 다이어그램 렌더링에 실패했습니다.', error)
    }
  }

  return template.innerHTML
}

export async function hydrateDocMermaid(
  slideHtmls: string[],
  signal?: AbortSignal,
): Promise<{ slideHtmls: string[]; scrollHtml: string }> {
  const hydratedSlides = await Promise.all(
    slideHtmls.map((html) => hydrateMermaidHtml(html, signal)),
  )

  if (signal?.aborted) {
    return {
      slideHtmls,
      scrollHtml: slideHtmls
        .map((html, i) => (i === 0 ? html : `<hr class="slide-break" />${html}`))
        .join(''),
    }
  }

  const scrollHtml = hydratedSlides
    .map((html, i) => (i === 0 ? html : `<hr class="slide-break" />${html}`))
    .join('')

  return { slideHtmls: hydratedSlides, scrollHtml }
}
