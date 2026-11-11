import { useEffect, useState } from 'react'
import { Activity, MessageSquare, Heart, Book, Dumbbell, ClipboardList, BarChart3, MonitorPlay, Zap, Pause, Play } from 'lucide-react'
import { cn } from '../lib/utils'
import { useFasilitas } from '../hooks/useFasilitas'
import { Skeleton } from './ui/skeleton'

const ICON_MAP: Record<string, React.ComponentType<{ className?: string; 'aria-hidden'?: string }>> = {
  'zap': Zap,
  'activity': Activity,
  'message-square': MessageSquare,
  'book': Book,
  'dumbbell': Dumbbell,
  'heart': Heart,
  'monitor-play': MonitorPlay,
  'bar-chart-3': BarChart3,
  'clipboard-list': ClipboardList,
}

export default function Facilities() {
  const { items: firestoreItems, loading, error } = useFasilitas()
  const facilities = firestoreItems

  const [activeNode, setActiveNode] = useState(0)
  const [paused, setPaused] = useState(false)
  const [reducedMotion, setReducedMotion] = useState(() => window.matchMedia('(prefers-reduced-motion: reduce)').matches)
  const currentNode = facilities.length ? activeNode % facilities.length : 0
  const active = facilities[currentNode]
  const ActiveIcon = ICON_MAP[active?.ikonName] ?? Zap

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    const updatePreference = () => setReducedMotion(mediaQuery.matches)
    mediaQuery.addEventListener('change', updatePreference)
    return () => mediaQuery.removeEventListener('change', updatePreference)
  }, [])

  useEffect(() => {
    if (paused || reducedMotion || facilities.length < 2) return
    const timer = window.setInterval(() => {
      setActiveNode((index) => (index + 1) % facilities.length)
    }, 4500)
    return () => window.clearInterval(timer)
  }, [facilities.length, paused, reducedMotion])

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowRight') setActiveNode((prev) => (prev + 1) % facilities.length)
    if (e.key === 'ArrowLeft') setActiveNode((prev) => (prev - 1 + facilities.length) % facilities.length)
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8" aria-busy="true">
        <div className="mb-12 space-y-3 text-center"><Skeleton className="mx-auto h-10 w-72 bg-white/20" /><Skeleton className="mx-auto h-5 w-80 max-w-full bg-white/20" /></div>
        <div className="mx-auto flex max-w-3xl flex-col items-center gap-8 md:flex-row md:justify-center"><Skeleton className="h-64 w-64 flex-shrink-0 rounded-full bg-white/15 md:h-80 md:w-80" /><div className="w-full max-w-md space-y-4">{Array.from({ length: 3 }).map((_, index) => <div key={index} className="rounded-2xl border border-white/10 bg-white/5 p-5"><Skeleton className="mb-3 h-5 w-40 bg-white/20" /><Skeleton className="h-4 w-full bg-white/20" /></div>)}</div></div>
        <span className="sr-only">Memuat fasilitas...</span>
      </div>
    )
  }

  if (!active) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <h2 className="mb-3 text-3xl font-bold text-white sm:text-4xl">Siklus Belajar G-System</h2>
        <p role={error ? 'alert' : undefined} className="text-blue-200">
          {error ? 'Fasilitas belum dapat dimuat. Silakan coba lagi nanti.' : 'Belum ada fasilitas aktif.'}
        </p>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8">
      <div className="text-center mb-12">
        <h2 className="text-3xl sm:text-4xl font-bold text-white mb-3">Siklus Belajar G-System</h2>
        <p className="text-lg text-blue-200 max-w-xl mx-auto">Ekosistem belajar lengkap dalam satu sistem terintegrasi</p>
      </div>

      {/* Desktop: Orbit visual */}
      <div className="hidden md:block">
        <div
          className="relative mx-auto"
          style={{ width: 480, height: 480 }}
          onKeyDown={handleKey}
          tabIndex={0}
          role="group"
            aria-label="G-System orbit, gunakan panah kiri atau kanan untuk navigasi"
        >
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-28 h-28 rounded-full bg-yellow-400 flex items-center justify-center shadow-[0_0_40px_rgba(246,204,70,0.4)] z-10">
              <span className="text-[#22539F] font-bold text-lg text-center leading-tight">G-System</span>
            </div>
          </div>

          <svg className="absolute inset-0 w-full h-full" viewBox="0 0 480 480" aria-hidden="true">
            <circle cx="240" cy="240" r="180" fill="none" stroke="rgba(143,180,227,0.25)" strokeWidth="1.5" strokeDasharray="6 4" />
          </svg>

          {facilities.map((f, index) => {
            const angle = (index / facilities.length) * 2 * Math.PI - Math.PI / 2
            const r = 180
            const x = 240 + r * Math.cos(angle)
            const y = 240 + r * Math.sin(angle)
            const NodeIcon = ICON_MAP[f.ikonName] ?? Zap
            const isActive = currentNode === index
            return (
              <button
                key={f.id}
                onClick={() => setActiveNode(index)}
                style={{ left: x - 28, top: y - 28 }}
                className={cn(
                  'absolute w-14 h-14 rounded-full flex items-center justify-center transition-all duration-300 cursor-pointer',
                  isActive ? 'bg-yellow-400 shadow-[0_0_20px_rgba(246,204,70,0.5)] scale-125 z-10' : 'bg-[#3173B8] hover:bg-yellow-400/80 hover:scale-110'
                )}
                aria-label={f.nama}
                aria-pressed={isActive}
              >
                <NodeIcon className={cn('w-6 h-6', isActive ? 'text-[#22539F]' : 'text-blue-200')} aria-hidden="true" />
              </button>
            )
          })}
        </div>

        <div className="mt-6 max-w-md mx-auto bg-[#3173B8] rounded-2xl p-6 border border-blue-400/20 text-center">
          <div className="w-12 h-12 bg-yellow-400/20 rounded-xl flex items-center justify-center mx-auto mb-3">
            <ActiveIcon className="w-6 h-6 text-yellow-400" aria-hidden="true" />
          </div>
          <h3 className="text-lg font-bold text-white mb-2">{active.nama}</h3>
          <p className="text-blue-200 text-sm">{active.deskripsi}</p>
        </div>

        <div className="flex justify-center mt-4">
          <button
            onClick={() => setPaused((value) => !value)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-[#3173B8] text-white rounded-full text-sm hover:bg-blue-700 transition-colors cursor-pointer"
            aria-label={paused ? 'Putar animasi orbit' : 'Jeda animasi orbit'}
          >
            {paused ? <><Play className="w-4 h-4" aria-hidden="true" /> Putar</> : <><Pause className="w-4 h-4" aria-hidden="true" /> Jeda</>}
          </button>
        </div>
      </div>

      {/* Mobile: Vertical stepper */}
      <div className="md:hidden space-y-0">
        {facilities.map((f, index) => {
          const NodeIcon = ICON_MAP[f.ikonName] ?? Zap
          const isActive = currentNode === index
          return (
            <div key={f.id} className="flex gap-4">
              <div className="flex flex-col items-center">
                <button
                  onClick={() => setActiveNode(index)}
                  className={cn('w-12 h-12 rounded-full flex items-center justify-center transition-all cursor-pointer flex-shrink-0', isActive ? 'bg-yellow-400' : 'bg-[#3173B8]')}
                  aria-label={f.nama}
                  aria-pressed={isActive}
                >
                  <NodeIcon className={cn('w-5 h-5', isActive ? 'text-[#22539F]' : 'text-blue-200')} aria-hidden="true" />
                </button>
                {index < facilities.length - 1 && <div className="w-px flex-1 bg-blue-400/20 my-1 min-h-[24px]" aria-hidden="true" />}
              </div>
              <div className={cn('pb-6 pt-1', !isActive ? 'opacity-50' : '')}>
                <h3 className="font-bold text-white text-base">{f.nama}</h3>
                {isActive && <p className="text-blue-200 text-sm mt-1">{f.deskripsi}</p>}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
