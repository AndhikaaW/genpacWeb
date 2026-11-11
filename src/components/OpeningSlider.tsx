import { useEffect, useState } from 'react'
import { ArrowLeft, ArrowRight, ChevronRight } from 'lucide-react'
import { useBanners } from '../hooks/useBanners'
import { waLink } from '../lib/config'
import Hero from './Hero'
import { useAppSettings, useAppSettingsLoading } from '../hooks/AppSettingsContext'
import { Skeleton } from './ui/skeleton'

const AUTO_ADVANCE_MS = 6000

export default function OpeningSlider() {
  const settings = useAppSettings()
  const settingsLoading = useAppSettingsLoading()
  const { items, loading } = useBanners()
  const [activeIndex, setActiveIndex] = useState(0)
  const [paused, setPaused] = useState(false)

  useEffect(() => {
    setActiveIndex((index) => Math.min(index, Math.max(items.length - 1, 0)))
  }, [items.length])

  useEffect(() => {
    if (paused || items.length < 2) return
    const timer = window.setInterval(() => {
      setActiveIndex((index) => (index + 1) % items.length)
    }, AUTO_ADVANCE_MS)
    return () => window.clearInterval(timer)
  }, [items.length, paused])

  if (loading || settingsLoading) {
    return (
      <section id="hero" aria-busy="true" aria-label="Memuat banner utama" className="relative flex min-h-[min(760px,100svh)] items-center overflow-hidden bg-[#22539F] text-white">
        <div className="absolute inset-0 opacity-15" aria-hidden="true" style={{ backgroundImage: 'radial-gradient(#F6CC46 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
        <div className="container mx-auto w-full px-5 py-32 sm:px-8 lg:px-12">
          <div className="max-w-3xl space-y-6">
            <Skeleton className="h-9 w-52 rounded-full bg-white/20" />
            <div className="space-y-3"><Skeleton className="h-12 w-full max-w-3xl bg-white/20 sm:h-14" /><Skeleton className="h-12 w-4/5 max-w-2xl bg-white/20 sm:h-14" /></div>
            <div className="space-y-2"><Skeleton className="h-5 w-full max-w-2xl bg-white/20" /><Skeleton className="h-5 w-3/4 max-w-xl bg-white/20" /></div>
            <Skeleton className="h-12 w-44 rounded-full bg-white/20" />
          </div>
        </div>
        <span className="sr-only">Memuat banner dari Firebase...</span>
      </section>
    )
  }

  if (items.length === 0) return <Hero />

  const activeBanner = items[activeIndex]
  const showPrevious = () => setActiveIndex((index) => (index - 1 + items.length) % items.length)
  const showNext = () => setActiveIndex((index) => (index + 1) % items.length)

  return (
    <section
      id="hero"
      aria-label="Banner utama Genza Education"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      className="relative isolate flex min-h-[min(760px,100svh)] items-center overflow-hidden bg-[#22539F] text-white"
    >
      <div className="absolute inset-0 -z-20" aria-hidden="true">
        {items.map((banner, index) => (
          <img
            key={banner.id}
            src={banner.imageUrl}
            alt=""
            fetchPriority={index === activeIndex ? 'high' : 'auto'}
            className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-700 ${index === activeIndex ? 'opacity-100' : 'opacity-0'}`}
          />
        ))}
      </div>
      <div className="absolute inset-0 -z-10 bg-gradient-to-r from-[#22539F]/90 via-[#22539F]/65 to-[#22539F]/20" aria-hidden="true" />

      <div className="container mx-auto w-full px-5 py-32 sm:px-8 lg:px-12">
        <div key={activeBanner.id} className="max-w-3xl animate-fade-up">
          <span className="mb-5 inline-flex rounded-full border border-white/25 bg-white/10 px-4 py-2 text-sm font-semibold text-yellow-300 backdrop-blur-sm">
            {settings.branch} · Genza Education
          </span>
          <h1 className="max-w-3xl text-4xl font-bold leading-tight sm:text-5xl lg:text-6xl">{activeBanner.judul}</h1>
          {activeBanner.deskripsi && <p className="mt-5 max-w-2xl text-lg leading-relaxed text-white/90 sm:text-xl">{activeBanner.deskripsi}</p>}
          <a
            href={waLink(`Halo Genza ${settings.branch}, saya ingin bertanya tentang ${activeBanner.judul}.`, settings.whatsappNumber)}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-8 inline-flex min-h-12 items-center gap-2 rounded-full bg-yellow-400 px-6 py-3 font-bold text-[#22539F] transition hover:bg-yellow-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[#22539F]"
          >
            Tanya program ini <ChevronRight className="h-5 w-5" aria-hidden="true" />
          </a>
        </div>
      </div>

      {items.length > 1 && (
        <div className="absolute inset-x-0 bottom-6 flex items-center justify-center gap-4 sm:bottom-8">
          <button onClick={showPrevious} aria-label="Banner sebelumnya" className="flex h-10 w-10 items-center justify-center rounded-full border border-white/50 bg-black/10 text-white backdrop-blur-sm transition hover:bg-white/20">
            <ArrowLeft className="h-5 w-5" aria-hidden="true" />
          </button>
          <div className="flex items-center gap-2" role="tablist" aria-label="Pilih banner">
            {items.map((banner, index) => (
              <button
                key={banner.id}
                type="button"
                role="tab"
                aria-label={`Tampilkan banner ${index + 1}: ${banner.judul}`}
                aria-selected={index === activeIndex}
                onClick={() => setActiveIndex(index)}
                className={`h-2.5 rounded-full transition-all ${index === activeIndex ? 'w-8 bg-yellow-400' : 'w-2.5 bg-white/70 hover:bg-white'}`}
              />
            ))}
          </div>
          <button onClick={showNext} aria-label="Banner berikutnya" className="flex h-10 w-10 items-center justify-center rounded-full border border-white/50 bg-black/10 text-white backdrop-blur-sm transition hover:bg-white/20">
            <ArrowRight className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>
      )}
    </section>
  )
}
