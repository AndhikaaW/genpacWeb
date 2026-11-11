import { useState } from 'react'
import { ArrowRight } from 'lucide-react'
import { waLink } from '../lib/config'
import { useAppSettings } from '../hooks/AppSettingsContext'
import { cn } from '../lib/utils'
import { useJenjang } from '../hooks/useJenjang'
import { Skeleton } from './ui/skeleton'

// Icon map lucide → komponen inline SVG sederhana (agar tidak perlu install lucide-react per icon)
// Fallback ke GraduationCap icon jika ikon belum dikenal
import {
  BookOpen, GraduationCap, BookHeart, UserCheck, Laptop, Monitor,
} from 'lucide-react'

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  'book-open': BookOpen,
  'graduation-cap': GraduationCap,
  'book-heart': BookHeart,
  'user-check': UserCheck,
  laptop: Laptop,
  monitor: Monitor,
}

export default function Programs() {
  const settings = useAppSettings()
  const { items: firestoreItems, loading } = useJenjang()
  const programs = firestoreItems
  const [active, setActive] = useState(0)
  const prog = programs[active] ?? programs[0]
  const Icon = ICON_MAP[prog?.ikonName] ?? GraduationCap

  if (loading) {
    return (
      <div className="container mx-auto px-4 sm:px-6 lg:px-8" aria-busy="true">
        <div className="mb-12 space-y-3"><Skeleton className="h-10 w-64" /><Skeleton className="h-5 w-72" /></div>
        <div className="flex flex-col gap-6 lg:flex-row"><div className="flex gap-2 overflow-hidden lg:w-64 lg:flex-col">{Array.from({ length: 5 }).map((_, index) => <Skeleton key={index} className="h-12 w-36 flex-shrink-0 rounded-2xl lg:w-full" />)}</div><div className="flex-1 space-y-6 rounded-[24px] border border-slate-100 bg-white p-8"><div className="flex gap-4"><Skeleton className="h-14 w-14 flex-shrink-0 rounded-2xl" /><div className="flex-1 space-y-3"><Skeleton className="h-7 w-48" /><Skeleton className="h-5 w-full" /></div></div><Skeleton className="h-5 w-40" /><div className="flex gap-2"><Skeleton className="h-8 w-24 rounded-xl" /><Skeleton className="h-8 w-28 rounded-xl" /><Skeleton className="h-8 w-20 rounded-xl" /></div><Skeleton className="h-12 w-44 rounded-full" /></div></div>
        <span className="sr-only">Memuat jenjang...</span>
      </div>
    )
  }
  if (!prog) return null

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8">
      <div className="mb-12">
        <h2 className="text-3xl sm:text-4xl font-bold text-slate-800 mb-3">Kamu kelas berapa?</h2>
        <p className="text-lg text-slate-500">Pilih jenjangmu, lihat detail programnya.</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        <div className="flex lg:flex-col gap-2 overflow-x-auto lg:overflow-visible pb-2 lg:pb-0 lg:w-64 flex-shrink-0" role="tablist" aria-label="Pilih program">
          {programs.map((p, index) => {
            const TabIcon = ICON_MAP[p.ikonName] ?? GraduationCap
            return (
              <button
                key={p.id}
                role="tab"
                aria-selected={active === index}
                aria-controls={`panel-${p.id}`}
                id={`tab-${p.id}`}
                onClick={() => setActive(index)}
                className={cn(
                  'flex items-center gap-3 px-4 py-3 rounded-2xl text-left font-semibold text-sm whitespace-nowrap transition-all duration-300 cursor-pointer',
                  active === index ? 'bg-[#22539F] text-white shadow-card' : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-100'
                )}
              >
                <TabIcon className="w-5 h-5 flex-shrink-0" aria-hidden="true" />
                {p.title}
              </button>
            )
          })}
        </div>

        <div id={`panel-${prog.id}`} role="tabpanel" aria-labelledby={`tab-${prog.id}`} className="flex-1 bg-white rounded-[24px] p-8 border border-slate-100 shadow-card">
          <div className="flex items-start gap-4 mb-6">
            <div className="w-14 h-14 bg-[#F4F6FE] rounded-2xl flex items-center justify-center flex-shrink-0">
              <Icon className="w-7 h-7 text-[#22539F]" aria-hidden="true" />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-slate-800">{prog.title}</h3>
              <p className="text-slate-500 mt-1">{prog.description}</p>
            </div>
          </div>

          <div className="mb-6">
            <p className="text-sm font-semibold text-slate-400 uppercase tracking-wide mb-3">Mata Pelajaran</p>
            <div className="flex flex-wrap gap-2">
              {prog.subjects.map((s) => (
                <span key={s} className="px-3 py-1.5 bg-[#F4F6FE] text-[#22539F] text-sm font-medium rounded-xl">{s}</span>
              ))}
            </div>
          </div>

          <div className="mb-8">
            <p className="text-sm font-semibold text-slate-400 uppercase tracking-wide mb-3">Fasilitas G-System</p>
            <div className="flex flex-wrap gap-2">
              {prog.facilities.map((f) => (
                <span key={f} className="px-3 py-1.5 bg-yellow-50 text-[#22539F] text-sm font-semibold rounded-xl border border-yellow-200">{f}</span>
              ))}
            </div>
          </div>

          <a
            href={waLink(`Halo Genza ${settings.branch}, saya ingin tanya program ${prog.title}.`, settings.whatsappNumber)}
            target="_blank"
            rel="noopener"
            className="inline-flex items-center gap-2 px-6 py-3 bg-yellow-400 text-[#22539F] font-bold rounded-full hover:bg-yellow-400/90 transition-all hover:shadow-card active:scale-95"
          >
            Tanya program ini
            <ArrowRight className="w-4 h-4" aria-hidden="true" />
          </a>
        </div>
      </div>
    </div>
  )
}
