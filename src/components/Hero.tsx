import { useState, useEffect } from 'react'
import { ArrowRight, CheckCircle, Star, BookOpen } from 'lucide-react'
import { waLink } from '../lib/config'
import { cn } from '../lib/utils'
import { useAppSettings } from '../hooks/AppSettingsContext'

const wordCyclerTexts = [
  'Untuk kamu yang di SD / SMP / SMA / UTBK / Kedinasan',
  'Untuk kamu yang ingin naik level dengan sistem terstruktur',
  'Untuk kamu yang butuh pendampingan personal yang tepat',
]

export default function Hero() {
  const settings = useAppSettings()
  const [currentWord, setCurrentWord] = useState(0)
  const [isTyping, setIsTyping] = useState(true)

  useEffect(() => {
    const timer = setInterval(() => {
      setIsTyping(true)
      setTimeout(() => {
        setCurrentWord((prev) => (prev + 1) % wordCyclerTexts.length)
        setIsTyping(false)
      }, 600)
    }, 2200)
    return () => clearInterval(timer)
  }, [])

  return (
    <section id="hero" className="relative min-h-screen overflow-hidden bg-[#22539F]">
      {/* Dot Grid Background */}
      <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(#F6CC46 1px, transparent 1px)', backgroundSize: '40px 40px' }} />

      {/* Animated Wave Layers */}
      <div className="absolute bottom-0 left-0 right-0 overflow-hidden">
        {/* Yellow wave (thick line) */}
        <svg viewBox="0 0 1440 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-auto">
          <path
            d="M0 100L60 85C120 70 240 40 360 30C480 20 600 30 720 40C840 50 960 60 1080 55C1200 50 1320 30 1380 20L1440 10V100H1380C1320 100 1200 100 1080 100C960 100 840 100 720 100C600 100 480 100 360 100C240 100 120 100 60 100H0Z"
            fill="#F6CC46"
            className="wave-layer"
          />
        </svg>

        {/* Blue medium wave */}
        <svg viewBox="0 0 1440 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-auto">
          <path
            d="M0 100L60 90C120 80 240 60 360 50C480 40 600 45 720 55C840 65 960 75 1080 70C1200 65 1320 55 1380 50L1440 45V100H1380C1320 100 1200 100 1080 100C960 100 840 100 720 100C600 100 480 100 360 100C240 100 120 100 60 100H0Z"
            fill="#3173B8"
            className="wave-layer"
            style={{ animationDelay: '0.5s' }}
          />
        </svg>

        {/* Blue dark transparent wave */}
        <svg viewBox="0 0 1440 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-auto">
          <path
            d="M0 100L60 95C120 90 240 80 360 75C480 70 600 72 720 78C840 84 960 90 1080 85C1200 80 1320 75 1380 72L1440 70V100H1380C1320 100 1200 100 1080 100C960 100 840 100 720 100C600 100 480 100 360 100C240 100 120 100 60 100H0Z"
            fill="#22539F"
            className="wave-layer"
            style={{ animationDelay: '1s' }}
          />
        </svg>
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 h-full relative z-10">
        <div className="flex min-h-[calc(100vh-160px)] items-center py-28 sm:py-32">
          <div className="w-full max-w-5xl space-y-8">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm text-yellow-400 rounded-full text-sm font-semibold">
              <span>{settings.branch} - Genza Education</span>
            </div>

            {/* H1 - with yellow highlight */}
            <h1 className="max-w-5xl text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-tight">
              Bimbel yang Kamu Banget,
              <span className="text-yellow-400"> kini di Pacitan</span>
            </h1>

            {/* Word Cycler */}
            <div className="h-8 overflow-hidden">
              <p className={cn(
                'text-lg text-slate-200 transition-all duration-300',
                isTyping ? 'opacity-100' : 'opacity-0'
              )}>
                {wordCyclerTexts[currentWord]}
              </p>
            </div>

            {/* Subtitle */}
            <p className="text-lg sm:text-xl text-slate-300 max-w-xl leading-relaxed">
              Belajar jadi lebih terarah dengan tutor terseleksi, materi terstruktur, dan pendampingan personal untuk SD, SMP, SMA, hingga persiapan UTBK dan kedinasan.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-3">
              <a
                href={waLink(`Halo Genza ${settings.branch}, saya ingin mendaftar program bimbingan belajar.`, settings.whatsappNumber)}
                target="_blank"
                rel="noopener"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-yellow-400 text-[#22539F] font-bold rounded-full hover:bg-yellow-400/90 transition-all hover:shadow-card active:scale-95 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:ring-offset-2 focus:ring-offset-[#22539F]"
              >
                Daftar Sekarang
                <ArrowRight className="w-5 h-5" />
              </a>
              <a
                href={waLink(`Halo Genza ${settings.branch}, saya ingin konsultasi gratis tentang program bimbel.`, settings.whatsappNumber)}
                target="_blank"
                rel="noopener"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 border-2 border-white/30 text-white font-semibold rounded-full hover:bg-white/10 transition-all active:scale-95 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-[#22539F]"
              >
                Konsultasi Gratis
                <CheckCircle className="w-5 h-5" />
              </a>
            </div>

            {/* Chips */}
            <div className="flex flex-wrap gap-2">
              {['SD/MI', 'SMP/MTs', 'SMA/MA', 'Alumni'].map((chip) => (
                <span
                  key={chip}
                  className="px-4 py-2 bg-white/10 backdrop-blur-sm text-slate-200 text-sm font-medium rounded-full border border-white/20"
                >
                  {chip}
                </span>
              ))}
            </div>

            {/* Trust indicators */}
            <div className="flex flex-wrap items-center gap-4 text-slate-400 text-sm">
              <div className="flex items-center gap-1.5">
                <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                <span>Tutor terseleksi</span>
              </div>
              <div className="flex items-center gap-1.5">
                <BookOpen className="w-4 h-4 text-blue-400" />
                <span>Materi terstruktur</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle className="w-4 h-4 text-blue-400" />
                <span>Laporan perkembangan</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
