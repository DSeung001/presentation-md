import { useCallback, useEffect, useState, type RefObject } from 'react'

export function useFullscreen(ref: RefObject<HTMLElement | null>) {
  const [active, setActive] = useState(false)

  useEffect(() => {
    const onChange = () => {
      setActive(document.fullscreenElement === ref.current)
    }
    document.addEventListener('fullscreenchange', onChange)
    return () => document.removeEventListener('fullscreenchange', onChange)
  }, [ref])

  const enter = useCallback(async () => {
    if (!ref.current) return
    await ref.current.requestFullscreen()
  }, [ref])

  const exit = useCallback(async () => {
    if (document.fullscreenElement) {
      await document.exitFullscreen()
    }
  }, [])

  const toggle = useCallback(async () => {
    if (document.fullscreenElement === ref.current) {
      await exit()
    } else {
      await enter()
    }
  }, [ref, enter, exit])

  return { active, enter, exit, toggle }
}
