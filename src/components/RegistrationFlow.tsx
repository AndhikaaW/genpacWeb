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
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {steps.map((step, index) => {
            const Icon = step.icon
            return (
              <div key={index} className="relative text-center">
                <div className="inline-flex items-center justify-center w-20 h-20 bg-yellow-400 rounded-[20px] mb-6 relative z-10 shadow-card mx-auto">
                  <Icon className="w-9 h-9 text-[#22539F]" aria-hidden="true" />
                </div>
                <div className="bg-white rounded-[20px] p-5 border border-slate-100 shadow-sm">
                  <div className="text-xs font-bold text-yellow-500 uppercase tracking-widest mb-2">Langkah {step.num}</div>
                  <h3 className="text-base font-bold text-slate-800 mb-2">{step.title}</h3>
                  <p className="text-slate-500 leading-relaxed text-sm">{step.description}</p>
                </div>
              </div>
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
