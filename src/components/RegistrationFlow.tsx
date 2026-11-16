import { waLink } from '../lib/config'
import { useAppSettings } from '../hooks/AppSettingsContext'
import { Activity, MessageSquare, Play, ArrowRight, ClipboardList } from 'lucide-react'

const steps = [
  { icon: Activity, num: '01', title: 'Tes Diagnostik', description: 'Petakan kemampuan awal untuk mengetahui level dan kebutuhan belajar.' },
  { icon: MessageSquare, num: '02', title: 'Konsultasi', description: 'Pilih program dan jadwal bersama admin kami.' },
  { icon: ClipboardList, num: '03', title: 'Isi Formulir', description: 'Lengkapi data pendaftaran secara online. Mudah dan cepat.' },
  { icon: Play, num: '04', title: 'Mulai Belajar', description: 'Bergabung di kelas dan pantau perkembangan belajarmu.' },
]

export default function RegistrationFlow() {
  const settings = useAppSettings()
  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8">
      <div className="mb-12">
        <h2 className="text-3xl sm:text-4xl font-bold text-slate-800 mb-3">Alur Pendaftaran</h2>
        <p className="text-lg text-slate-500">Empat langkah untuk mulai belajar bersama Genza.</p>
      </div>

      <div className="relative max-w-5xl mx-auto">
        <div className="grid grid-cols-2 items-stretch gap-x-4 gap-y-8 md:grid-cols-4 md:gap-6">
          {steps.map((step) => {
            const Icon = step.icon
            return (
              <article key={step.num} className="relative flex h-full min-w-0 flex-col text-center">
                <div className="relative z-10 mx-auto mb-5 flex h-20 w-20 flex-shrink-0 items-center justify-center rounded-[20px] bg-yellow-400 shadow-card">
                  <Icon className="w-9 h-9 text-[#22539F]" aria-hidden="true" />
                </div>
                <div className="flex min-h-[220px] flex-1 flex-col items-center rounded-[20px] border border-slate-100 bg-white p-4 shadow-sm sm:p-5">
                  <div className="mb-2 text-xs font-bold uppercase tracking-widest text-amber-600">Langkah {step.num}</div>
                  <h3 className="mb-2 text-base font-bold text-slate-800 sm:text-lg">{step.title}</h3>
                  <p className="text-sm leading-relaxed text-slate-600">{step.description}</p>
                </div>
              </article>
            )
          })}
        </div>
      </div>

      <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-10">
        <a
          href="https://genzaeducationpacitan.online/#/daftar"
          className="inline-flex items-center gap-2 px-8 py-4 bg-yellow-400 text-[#22539F] font-bold rounded-full hover:bg-yellow-300 transition-all hover:shadow-card active:scale-95"
        >
          Daftar Online Sekarang
          <ArrowRight className="w-5 h-5" aria-hidden="true" />
        </a>
        <a
          href={waLink(`Halo Genza ${settings.branch}, saya ingin tanya tentang pendaftaran.`, settings.whatsappNumber)}
          target="_blank"
          rel="noopener"
          className="inline-flex items-center gap-2 px-8 py-4 bg-[#22539F] text-white font-bold rounded-full hover:bg-[#22539F] transition-all hover:shadow-card active:scale-95"
        >
          Tanya via WhatsApp
        </a>
      </div>
    </div>
  )
}
