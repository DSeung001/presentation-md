import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type CSSProperties,
  type RefObject,
} from 'react'

const MAX_SCALE = 3

type Size = { w: number; h: number }

function getPadding(stage: HTMLElement) {
  const style = getComputedStyle(stage)
  return {
    x: parseFloat(style.paddingLeft) + parseFloat(style.paddingRight),
    y: parseFloat(style.paddingTop) + parseFloat(style.paddingBottom),
  }
}

type ViewMode = 'scroll' | 'slides'

export function useStageScale(
  stageRef: RefObject<HTMLElement | null>,
  fullscreen: boolean,
  mode: ViewMode,
  reservedRef?: RefObject<HTMLElement | null>,
  contentRevision?: unknown,
) {
  const innerRef = useRef<HTMLDivElement>(null)
  const baseSizeRef = useRef<Size | null>(null)
  const [baseSize, setBaseSize] = useState<Size | null>(null)
  const [scale, setScale] = useState(1)

  const captureBaseSize = useCallback(() => {
    const stage = stageRef.current
    if (!stage) return
    const rect = stage.getBoundingClientRect()
    baseSizeRef.current = { w: rect.width, h: rect.height }
  }, [stageRef])

  const updateScale = useCallback(() => {
    const stage = stageRef.current
    const base = baseSizeRef.current
    if (!stage || !base || !fullscreen) {
      setScale(1)
      return
    }

    const pad = getPadding(stage)
    const reservedH = reservedRef?.current?.offsetHeight ?? 0
    const availW = stage.clientWidth - pad.x
    const availH = stage.clientHeight - pad.y - reservedH
    const scaleW = availW / base.w
    const scaleH = availH / base.h
    const next =
      mode === 'slides'
        ? Math.min(scaleW, MAX_SCALE)
        : Math.min(scaleW, scaleH, MAX_SCALE)
    setScale(next > 1 ? next : 1)
  }, [stageRef, fullscreen, mode, reservedRef])

  useLayoutEffect(() => {
    if (!fullscreen) {
      baseSizeRef.current = null
      setBaseSize(null)
      setScale(1)
      return
    }

    if (baseSizeRef.current) {
      setBaseSize({ ...baseSizeRef.current })
    }
    updateScale()
  }, [fullscreen, updateScale])

  useEffect(() => {
    if (fullscreen) updateScale()
  }, [contentRevision, fullscreen, updateScale])

  useEffect(() => {
    if (!fullscreen) return

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
  }, [fullscreen, stageRef, reservedRef, updateScale])

  const scaling = fullscreen && baseSize != null && scale > 1

  const hostStyle: CSSProperties = scaling
    ? {
        width: baseSize.w * scale,
        height: baseSize.h * scale,
      }
    : {}

  const innerStyle: CSSProperties = scaling
    ? {
        width: baseSize.w,
        height: baseSize.h,
        transform: `scale(${scale})`,
        transformOrigin: 'top left',
      }
    : {}

  return { scale, captureBaseSize, innerRef, hostStyle, innerStyle }
}
