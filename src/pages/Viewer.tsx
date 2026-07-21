import { useCallback, useEffect, useMemo, useRef, useState, type CSSProperties, type MouseEvent } from 'react'
import { Link, useParams, useSearchParams } from 'react-router-dom'
import { useFullscreen } from '../hooks/useFullscreen'
import { useStageScale } from '../hooks/useStageScale'
import { exportDocPdf } from '../lib/exportPdf'
import {
  fontStacksToStyle,
  formatDocDate,
  getDoc,
  getDocFontStacks,
  type ParsedDoc,
} from '../lib/markdown'
import { hydrateDocMermaid } from '../lib/renderMermaid'

type ViewMode = 'scroll' | 'slides'

export default function Viewer() {
  const { slug = '' } = useParams()
  const [searchParams, setSearchParams] = useSearchParams()
  const doc = useMemo(() => getDoc(slug), [slug])
  const [viewDoc, setViewDoc] = useState<ParsedDoc | null>(null)
  const viewParam = searchParams.get('view')
  const mode: ViewMode = viewParam === 'scroll' ? 'scroll' : 'slides'
  const [index, setIndex] = useState(0)
  const [exporting, setExporting] = useState(false)
  const [navHint, setNavHint] = useState(false)
  const stageRef = useRef<HTMLElement>(null)
  const slideNavRef = useRef<HTMLElement>(null)
  const navHintTimerRef = useRef<number | null>(null)
  const { active: fullscreen, toggle: toggleFullscreen } =
    useFullscreen(stageRef)
  // 전체보기 네비는 absolute라 하단 padding으로만 여백을 확보한다.
  const { captureBaseSize, innerRef, hostStyle, innerStyle } = useStageScale(
    stageRef,
    fullscreen,
    undefined,
    mode === 'slides' ? index : slug,
  )

  const onToggleFullscreen = useCallback(() => {
    void toggleFullscreen(fullscreen ? undefined : captureBaseSize)
  }, [fullscreen, captureBaseSize, toggleFullscreen])

  const activeDoc = viewDoc ?? doc

  const fontStyle = useMemo((): CSSProperties | undefined => {
    if (!doc) return undefined
    return fontStacksToStyle(getDocFontStacks(doc)) as CSSProperties
  }, [doc])

  useEffect(() => {
    setIndex(0)
  }, [slug, mode])

  useEffect(() => {
    if (!doc) {
      setViewDoc(null)
      return
    }

    const controller = new AbortController()
    setViewDoc(null)

    void hydrateDocMermaid(doc.slideHtmls, controller.signal)
      .then(({ slideHtmls, scrollHtml }) => {
        if (controller.signal.aborted) return
        setViewDoc({ ...doc, slideHtmls, scrollHtml })
      })
      .catch((error) => {
        if (controller.signal.aborted) return
        console.error('Mermaid 다이어그램 렌더링에 실패했습니다.', error)
        setViewDoc(doc)
      })

    return () => controller.abort()
  }, [doc])

  useEffect(() => {
    if (navHintTimerRef.current != null) {
      window.clearTimeout(navHintTimerRef.current)
      navHintTimerRef.current = null
    }

    if (!fullscreen || mode !== 'slides') {
      setNavHint(false)
      return
    }

    setNavHint(true)
    navHintTimerRef.current = window.setTimeout(() => {
      setNavHint(false)
      navHintTimerRef.current = null
    }, 1400)

    return () => {
      if (navHintTimerRef.current != null) {
        window.clearTimeout(navHintTimerRef.current)
        navHintTimerRef.current = null
      }
    }
  }, [index, fullscreen, mode])

  const setMode = useCallback(
    (next: ViewMode) => {
      const params = new URLSearchParams(searchParams)
      if (next === 'scroll') {
        params.set('view', 'scroll')
      } else {
        params.delete('view')
      }
      setSearchParams(params, { replace: true })
    },
    [searchParams, setSearchParams],
  )

  const go = useCallback(
    (delta: number) => {
      if (!activeDoc) return
      setIndex((i) =>
        Math.min(activeDoc.slideHtmls.length - 1, Math.max(0, i + delta)),
      )
    },
    [activeDoc],
  )

  const onStageClick = useCallback(
    (e: MouseEvent<HTMLElement>) => {
      if (!fullscreen || mode !== 'slides') return
      if ((e.target as HTMLElement).closest('a, button, .slide-nav')) return
      const rect = stageRef.current?.getBoundingClientRect()
      if (!rect) return
      const ratio = (e.clientX - rect.left) / rect.width
      if (ratio < 0.5) go(-1)
      else go(1)
    },
    [fullscreen, mode, go],
  )

  const onExportPdf = useCallback(async () => {
    if (!activeDoc || exporting) return
    setExporting(true)
    try {
      await exportDocPdf(activeDoc, mode, fontStyle)
    } finally {
      setExporting(false)
    }
  }, [activeDoc, exporting, mode, fontStyle])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'f' || e.key === 'F') {
        e.preventDefault()
        onToggleFullscreen()
        return
      }

      if (mode !== 'slides') return

      if (e.key === ' ') {
        e.preventDefault()
        go(e.shiftKey ? -1 : 1)
      } else if (e.key === 'ArrowRight' || e.key === 'PageDown') {
        e.preventDefault()
        go(1)
      } else if (e.key === 'ArrowLeft' || e.key === 'PageUp') {
        e.preventDefault()
        go(-1)
      } else if (e.key === 'Home') {
        e.preventDefault()
        setIndex(0)
      } else if (e.key === 'End' && activeDoc) {
        e.preventDefault()
        setIndex(activeDoc.slideHtmls.length - 1)
      }
    }

    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [mode, go, activeDoc, onToggleFullscreen])

  if (!doc) {
    return (
      <section className="viewer">
        <p>문서를 찾을 수 없습니다.</p>
        <Link to="/">목록으로</Link>
      </section>
    )
  }

  const displayDoc = viewDoc ?? doc
  const total = displayDoc.slideHtmls.length

  return (
    <section className={`viewer viewer--${mode}`}>
      <div className="viewer-toolbar">
        <Link to="/" className="back-link">
          ← 목록
        </Link>
        <div className="viewer-heading">
          <h1 className="viewer-title">{doc.title}</h1>
          {doc.date ? (
            <time className="viewer-date" dateTime={doc.date}>
              {formatDocDate(doc.date)}
            </time>
          ) : null}
        </div>
        <div className="viewer-actions">
          <button
            type="button"
            className="toolbar-btn"
            onClick={() => void onExportPdf()}
            disabled={exporting}
          >
            {exporting ? 'PDF 생성 중…' : 'PDF 다운로드'}
          </button>
          <button
            type="button"
            className="toolbar-btn"
            onClick={onToggleFullscreen}
            aria-pressed={fullscreen}
          >
            {fullscreen ? '전체보기 종료' : '전체보기'}
          </button>
          <div className="view-toggle" role="group" aria-label="보기 모드">
            <button
              type="button"
              className={mode === 'scroll' ? 'active' : ''}
              onClick={() => setMode('scroll')}
            >
              스크롤
            </button>
            <button
              type="button"
              className={mode === 'slides' ? 'active' : ''}
              onClick={() => setMode('slides')}
            >
              슬라이드
            </button>
          </div>
        </div>
      </div>

      <section
        ref={stageRef}
        className={`viewer-stage viewer-stage--${mode}${fullscreen ? ' viewer-stage--fullscreen' : ''}`}
        onClick={onStageClick}
      >
        <div className="viewer-stage-scaler-host" style={hostStyle}>
          <div
            ref={innerRef}
            className="viewer-stage-scaler"
            style={innerStyle}
          >
            {mode === 'scroll' ? (
              <article
                className="prose scroll-view"
                style={fontStyle}
                dangerouslySetInnerHTML={{ __html: displayDoc.scrollHtml }}
              />
            ) : (
              <article
                className="prose slide-frame"
                style={fontStyle}
                dangerouslySetInnerHTML={{
                  __html: displayDoc.slideHtmls[index] ?? '',
                }}
              />
            )}
          </div>
        </div>
        {mode === 'slides' ? (
          <nav
            ref={slideNavRef}
            className={`slide-nav${fullscreen && navHint ? ' slide-nav--hint' : ''}`}
            aria-label="슬라이드 탐색"
            aria-hidden={fullscreen && !navHint ? true : undefined}
          >
            <button
              type="button"
              onClick={() => go(-1)}
              disabled={index === 0}
              aria-label="이전 슬라이드"
              tabIndex={fullscreen && !navHint ? -1 : undefined}
            >
              {fullscreen ? '←' : '이전'}
            </button>
            <span className="slide-counter">
              {index + 1} / {total}
            </span>
            <button
              type="button"
              onClick={() => go(1)}
              disabled={index >= total - 1}
              aria-label="다음 슬라이드"
              tabIndex={fullscreen && !navHint ? -1 : undefined}
            >
              {fullscreen ? '→' : '다음'}
            </button>
          </nav>
        ) : null}
      </section>
    </section>
  )
}
