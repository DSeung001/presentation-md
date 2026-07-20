import { useCallback, useEffect, useMemo, useRef, useState, type CSSProperties } from 'react'
import { Link, useParams, useSearchParams } from 'react-router-dom'
import { useFullscreen } from '../hooks/useFullscreen'
import { fontStacksToStyle, formatDocDate, getDoc, getDocFontStacks } from '../lib/markdown'

type ViewMode = 'scroll' | 'slides'

export default function Viewer() {
  const { slug = '' } = useParams()
  const [searchParams, setSearchParams] = useSearchParams()
  const doc = useMemo(() => getDoc(slug), [slug])
  const stageRef = useRef<HTMLElement>(null)
  const { active: fullscreen, toggle: toggleFullscreen } =
    useFullscreen(stageRef)

  const fontStyle = useMemo((): CSSProperties | undefined => {
    if (!doc) return undefined
    return fontStacksToStyle(getDocFontStacks(doc)) as CSSProperties
  }, [doc])

  const viewParam = searchParams.get('view')
  const mode: ViewMode = viewParam === 'slides' ? 'slides' : 'scroll'

  const [index, setIndex] = useState(0)

  useEffect(() => {
    setIndex(0)
  }, [slug, mode])

  const setMode = useCallback(
    (next: ViewMode) => {
      const params = new URLSearchParams(searchParams)
      if (next === 'slides') {
        params.set('view', 'slides')
      } else {
        params.delete('view')
      }
      setSearchParams(params, { replace: true })
    },
    [searchParams, setSearchParams],
  )

  const go = useCallback(
    (delta: number) => {
      if (!doc) return
      setIndex((i) => Math.min(doc.slideHtmls.length - 1, Math.max(0, i + delta)))
    },
    [doc],
  )

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'f' || e.key === 'F') {
        e.preventDefault()
        void toggleFullscreen()
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
      } else if (e.key === 'End' && doc) {
        e.preventDefault()
        setIndex(doc.slideHtmls.length - 1)
      }
    }

    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [mode, go, doc, toggleFullscreen])

  if (!doc) {
    return (
      <section className="viewer">
        <p>문서를 찾을 수 없습니다.</p>
        <Link to="/">목록으로</Link>
      </section>
    )
  }

  const total = doc.slideHtmls.length

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
            onClick={() => void toggleFullscreen()}
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
        className={`viewer-stage${fullscreen ? ' viewer-stage--fullscreen' : ''}`}
      >
        {mode === 'scroll' ? (
          <article
            className="prose scroll-view"
            style={fontStyle}
            dangerouslySetInnerHTML={{ __html: doc.scrollHtml }}
          />
        ) : (
          <div className="slides-view">
            <article
              className="prose slide-frame"
              style={fontStyle}
              dangerouslySetInnerHTML={{ __html: doc.slideHtmls[index] ?? '' }}
            />
            <nav className="slide-nav" aria-label="슬라이드 탐색">
              <button
                type="button"
                onClick={() => go(-1)}
                disabled={index === 0}
              >
                이전
              </button>
              <span className="slide-counter">
                {index + 1} / {total}
              </span>
              <button
                type="button"
                onClick={() => go(1)}
                disabled={index >= total - 1}
              >
                다음
              </button>
            </nav>
          </div>
        )}
      </section>
    </section>
  )
}
