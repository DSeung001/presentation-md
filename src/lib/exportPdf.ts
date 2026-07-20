import html2canvas from 'html2canvas'
import { jsPDF } from 'jspdf'
import type { CSSProperties } from 'react'
import type { ParsedDoc } from './markdown'

type ViewMode = 'scroll' | 'slides'

const SLIDE_PAGE_W = 297
const SLIDE_PAGE_H = 167
const A4_W = 210
const A4_H = 297

function sanitizeFilename(title: string): string {
  const safe = title.replace(/[/\\?%*:|"<>]/g, '-').trim()
  return `${safe || 'document'}.pdf`
}

function applyStyle(el: HTMLElement, style: CSSProperties) {
  for (const [key, value] of Object.entries(style)) {
    if (value == null) continue
    if (key.startsWith('--')) {
      el.style.setProperty(key, String(value))
    } else {
      ;(el.style as unknown as Record<string, string>)[key] = String(value)
    }
  }
}

function buildExportRoot(): HTMLElement {
  const root = document.createElement('div')
  root.className = 'pdf-export-root'
  document.body.appendChild(root)
  return root
}

function renderSlidePage(html: string, fontStyle: CSSProperties): HTMLElement {
  const article = document.createElement('article')
  article.className = 'prose pdf-export-slide'
  applyStyle(article, fontStyle)
  article.innerHTML = html
  return article
}

function renderScrollPage(html: string, fontStyle: CSSProperties): HTMLElement {
  const article = document.createElement('article')
  article.className = 'prose pdf-export-scroll'
  applyStyle(article, fontStyle)
  article.innerHTML = html
  return article
}

async function captureElement(el: HTMLElement): Promise<HTMLCanvasElement> {
  await document.fonts.ready
  await new Promise((r) => requestAnimationFrame(r))
  return html2canvas(el, {
    scale: 2,
    useCORS: true,
    backgroundColor: '#ffffff',
  })
}

function fitImageOnPage(
  canvas: HTMLCanvasElement,
  pageW: number,
  pageH: number,
): { x: number; y: number; w: number; h: number } {
  const aspect = canvas.width / canvas.height
  let w = pageW
  let h = pageW / aspect
  if (h > pageH) {
    h = pageH
    w = pageH * aspect
  }
  return { x: (pageW - w) / 2, y: (pageH - h) / 2, w, h }
}

export async function exportSlidesPdf(
  slideHtmls: string[],
  fontStyle: CSSProperties,
  filename: string,
) {
  const root = buildExportRoot()
  const pdf = new jsPDF({
    orientation: 'landscape',
    unit: 'mm',
    format: [SLIDE_PAGE_W, SLIDE_PAGE_H],
  })

  try {
    for (let i = 0; i < slideHtmls.length; i++) {
      root.replaceChildren(renderSlidePage(slideHtmls[i], fontStyle))
      const canvas = await captureElement(root.firstElementChild as HTMLElement)
      const { x, y, w, h } = fitImageOnPage(canvas, SLIDE_PAGE_W, SLIDE_PAGE_H)
      const imgData = canvas.toDataURL('image/png')

      if (i > 0) {
        pdf.addPage([SLIDE_PAGE_W, SLIDE_PAGE_H], 'landscape')
      }
      pdf.addImage(imgData, 'PNG', x, y, w, h)
    }
    pdf.save(filename)
  } finally {
    root.remove()
  }
}

export async function exportScrollPdf(
  scrollHtml: string,
  fontStyle: CSSProperties,
  filename: string,
) {
  const root = buildExportRoot()
  root.replaceChildren(renderScrollPage(scrollHtml, fontStyle))

  try {
    const canvas = await captureElement(root.firstElementChild as HTMLElement)
    const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })
    const imgData = canvas.toDataURL('image/png')
    const imgWidth = A4_W
    const imgHeight = (canvas.height * imgWidth) / canvas.width
    let heightLeft = imgHeight
    let position = 0

    pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight)
    heightLeft -= A4_H

    while (heightLeft > 0) {
      position = heightLeft - imgHeight
      pdf.addPage()
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight)
      heightLeft -= A4_H
    }

    pdf.save(filename)
  } finally {
    root.remove()
  }
}

export async function exportDocPdf(
  doc: ParsedDoc,
  mode: ViewMode,
  fontStyle: CSSProperties | undefined,
) {
  const style = fontStyle ?? {}
  const filename = sanitizeFilename(doc.title)
  if (mode === 'slides') {
    await exportSlidesPdf(doc.slideHtmls, style, filename)
  } else {
    await exportScrollPdf(doc.scrollHtml, style, filename)
  }
}
