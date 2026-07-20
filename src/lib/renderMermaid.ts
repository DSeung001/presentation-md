let mermaidPromise: Promise<(typeof import('mermaid'))['default']> | undefined

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

export async function renderMermaid(root: HTMLElement): Promise<void> {
  const codeBlocks = root.querySelectorAll<HTMLElement>(
    'pre > code.language-mermaid',
  )

  for (const codeBlock of codeBlocks) {
    const container = document.createElement('div')
    container.className = 'mermaid'
    container.textContent = codeBlock.textContent ?? ''
    codeBlock.parentElement?.replaceWith(container)
  }

  const diagrams = root.querySelectorAll<HTMLElement>('.mermaid')
  if (diagrams.length === 0) return

  const mermaid = await loadMermaid()
  await mermaid.run({ nodes: diagrams })
}
