import { useRef, type ReactNode } from 'react'
import { ArrowLeft, ArrowRight } from 'lucide-react'

interface ResponsiveCarouselProps {
  children: ReactNode
  count: number
  label: string
  className?: string
  gridClassName: string
}

export default function ResponsiveCarousel({ children, count, label, className = '', gridClassName }: ResponsiveCarouselProps) {
  const trackRef = useRef<HTMLDivElement>(null)

  const move = (direction: -1 | 1) => {
    const track = trackRef.current
    const card = track?.firstElementChild
    if (!track || !card) return
    const gap = Number.parseFloat(getComputedStyle(track).columnGap || getComputedStyle(track).gap) || 0
    track.scrollBy({ left: direction * (card.getBoundingClientRect().width + gap), behavior: 'smooth' })
  }

  return (
    <div className={className}>
      <div
        ref={trackRef}
        role="region"
        aria-label={label}
        tabIndex={0}
        className={`no-scrollbar flex snap-x snap-mandatory gap-4 overflow-x-auto overscroll-x-contain scroll-smooth focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-yellow-400 md:grid md:gap-6 md:overflow-visible md:snap-none ${gridClassName}`}
      >
        {children}
      </div>
    </div>
  )
}
