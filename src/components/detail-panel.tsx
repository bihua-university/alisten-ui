import type { ReactNode } from 'react'
import { useEffect, useRef, useState } from 'react'
import { useStore } from '@/hooks/use-store'
import { performanceStore } from '@/stores/performance-store'

export type DetailPanelView = 'chat' | 'queue' | 'history'

export function DetailPanel({ panel, children }: {
  panel: DetailPanelView | null
  children: (panel: DetailPanelView) => ReactNode
}) {
  const [renderedPanel, setRenderedPanel] = useState(panel)
  const element = useRef<HTMLElement>(null)
  const performance = useStore(performanceStore, s => s)
  const closing = panel === null

  // Keep the outgoing content until its exit animation finishes.
  if (panel && panel !== renderedPanel)
    setRenderedPanel(panel)

  useEffect(() => {
    if (!closing || !renderedPanel || !element.current)
      return
    const duration = Number.parseFloat(getComputedStyle(element.current).animationDuration) * 1000
    // Also release content if the animation is cancelled or hidden by a breakpoint.
    const timer = window.setTimeout(() => setRenderedPanel(null), duration ? duration + 50 : 0)
    return () => window.clearTimeout(timer)
  }, [closing, renderedPanel, performance])

  if (!renderedPanel)
    return null

  return (
    <aside
      ref={element}
      className={`detail-panel${closing ? ' detail-panel-closing' : ''}`}
      aria-hidden={closing || undefined}
      {...(closing ? { inert: '' } : {})}
      onAnimationEnd={(event) => {
        if (event.target === event.currentTarget && closing)
          setRenderedPanel(null)
      }}
    >
      <div className="detail-panel-content">{children(renderedPanel)}</div>
    </aside>
  )
}
