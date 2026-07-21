import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type CSSProperties,
  type RefObject,
} from 'react'

/** 슬라이드·PDF와 동일한 디자인 해상도 (16:9) */
export const SLIDE_BASE = { w: 960, h: 540 } as const

const MAX_SCALE = 3
const MIN_SCALE = 0.25

function getPadding(stage: HTMLElement) {
  const style = getComputedStyle(stage)
  return {
    x: parseFloat(style.paddingLeft) + parseFloat(style.paddingRight),
    y: parseFloat(style.paddingTop) + parseFloat(style.paddingBottom),
  }
}

function getRowGap(stage: HTMLElement) {
  const gap = getComputedStyle(stage).rowGap
  return gap && gap !== 'normal' ? parseFloat(gap) || 0 : 0
}

/**
 * 슬라이드를 고정 디자인 크기로 그린 뒤 가용 영역에 fit (축소·확대).
 * `enabled`가 false면 스케일 없음 (스크롤 모드).
 */
export function useStageScale(
  stageRef: RefObject<HTMLElement | null>,
  enabled: boolean,
  reservedRef?: RefObject<HTMLElement | null>,
  contentRevision?: unknown,
) {
  const innerRef = useRef<HTMLDivElement>(null)
  const [scale, setScale] = useState(1)

  const updateScale = useCallback(() => {
    const stage = stageRef.current
    if (!stage || !enabled) {
      setScale(1)
      return
    }

    const pad = getPadding(stage)
    const reservedEl = reservedRef?.current
    const reservedH = reservedEl
      ? reservedEl.offsetHeight + getRowGap(stage)
      : 0
    const availW = Math.max(0, stage.clientWidth - pad.x)
    const availH = Math.max(0, stage.clientHeight - pad.y - reservedH)
    if (availW <= 0 || availH <= 0) {
      setScale(MIN_SCALE)
      return
    }

    const scaleW = availW / SLIDE_BASE.w
    const scaleH = availH / SLIDE_BASE.h
    // 가로·세로 모두 맞춰야 header·본문이 잘리지 않는다.
    const next = Math.min(scaleW, scaleH, MAX_SCALE)
    if (!Number.isFinite(next) || next <= 0) {
      setScale(MIN_SCALE)
      return
    }
    setScale(next)
  }, [stageRef, enabled, reservedRef])

  useLayoutEffect(() => {
    if (!enabled) {
      setScale(1)
      return
    }
    updateScale()
  }, [enabled, updateScale])

  useEffect(() => {
    if (enabled) updateScale()
  }, [contentRevision, enabled, updateScale])

  useEffect(() => {
    if (!enabled) return

    const stage = stageRef.current
    if (!stage) return

    const ro = new ResizeObserver(() => updateScale())
    ro.observe(stage)
    if (reservedRef?.current) ro.observe(reservedRef.current)

    window.addEventListener('resize', updateScale)
    return () => {
      ro.disconnect()
      window.removeEventListener('resize', updateScale)
    }
  }, [enabled, stageRef, reservedRef, updateScale])

  const hostStyle: CSSProperties = enabled
    ? {
        width: SLIDE_BASE.w * scale,
        height: SLIDE_BASE.h * scale,
        flex: 'none',
        overflow: 'hidden',
      }
    : {}

  const innerStyle: CSSProperties = enabled
    ? {
        width: SLIDE_BASE.w,
        height: SLIDE_BASE.h,
        transform: `scale(${scale})`,
        transformOrigin: 'top left',
      }
    : {}

  return { scale, innerRef, hostStyle, innerStyle }
}
