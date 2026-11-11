import { useState } from 'react'
import { Plus, X } from 'lucide-react'
import { cn } from '../lib/utils'

const faqs = [
  {
    question: 'Jenjang apa saja yang dilayani?',
    answer: 'Genza Education Pacitan melayani jenjang SD/MI, SMP/MTs, SMA/MA, hingga alumni. Kami juga menyediakan program khusus persiapan UTBK-SNBT dan seleksi sekolah kedinasan (Sekdin/TNI/Polri).',
  },
  {
    question: 'Apakah ada tes awal untuk menentukan level?',
    answer: 'Ya, kami menyediakan Tes Diagnostik gratis untuk memetakan kemampuan awal siswa. Hasil tes membantu kami menentukan program dan pendekatan belajar yang paling sesuai.',
  },
  {
    question: 'Bagaimana jadwal dan sistem belajarnya?',
    answer: 'Jadwal belajar dapat disesuaikan dengan kebutuhan siswa. Sistem belajar menggunakan G-System dengan pendampingan tutor personal, latihan soal berkala, dan tryout simulasi ujian.',
  },
  {
    question: 'Apakah ada kelas online?',
    answer: 'Ya, program G-Advanced tersedia secara online untuk UTBK-SNBT dan SKD Sekdin/TNI/Polri. Kurikulum sama dengan kelas offline.',
  },
  {
    question: 'Bagaimana cara mendaftar?',
    answer: 'Hubungi admin kami via WhatsApp. Admin akan membantu mendaftar, jadwalkan Tes Diagnostik, dan memilih program yang sesuai.',
  },
  {
    question: 'Berapa biaya belajarnya?',
    answer: 'Biaya disesuaikan dengan jenjang dan program yang dipilih. Hubungi admin kami via WhatsApp untuk info biaya terbaru.',
  },
]

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(0)

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8">
      <div className="mb-12">
        <h2 className="text-3xl sm:text-4xl font-bold text-slate-800 mb-3">
          Pertanyaan Umum
        </h2>
        <p className="text-lg text-slate-500">Hal yang sering ditanyakan sebelum daftar.</p>
      </div>

      <div className="max-w-3xl mx-auto space-y-3">
        {faqs.map((faq, index) => {
          const isOpen = openIndex === index
          return (
            <div
              key={index}
              className={cn(
                'rounded-[16px] overflow-hidden border transition-all duration-200',
                isOpen ? 'border-[#22539F]/30 shadow-card' : 'border-slate-200'
              )}
            >
              <button
                onClick={() => setOpenIndex(isOpen ? null : index)}
                className="w-full flex items-center justify-between px-6 py-5 text-left hover:bg-slate-50 transition-colors cursor-pointer"
                aria-expanded={isOpen}
                aria-controls={`faq-${index}`}
              >
                <span className="font-semibold text-slate-800 pr-4">{faq.question}</span>
                <span className="flex-shrink-0 w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center transition-colors">
                  {isOpen
                    ? <X className="w-4 h-4 text-[#22539F]" aria-hidden="true" />
                    : <Plus className="w-4 h-4 text-slate-500" aria-hidden="true" />
                  }
                </span>
              </button>

              <div
                id={`faq-${index}`}
                className={cn(
                  'grid transition-all duration-300',
                  isOpen ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'
                )}
                role="region"
              >
                <div className="overflow-hidden">
                  <div className="px-6 pb-5 text-slate-600 leading-relaxed border-t border-slate-100 pt-4">
                    {faq.answer}
                  </div>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
