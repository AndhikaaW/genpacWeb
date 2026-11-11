import { MessageSquare, GraduationCap, Target } from 'lucide-react'
import { useAppSettings, useAppSettingsLoading } from '../hooks/AppSettingsContext'
import { Skeleton } from './ui/skeleton'

export default function About() {
  const settings = useAppSettings()
  const settingsLoading = useAppSettingsLoading()
  const statement = "Membangun generasi cerdas dan berprestasi melalui pendidikan berkualitas, dengan pendekatan yang dekat dengan cara Gen Z."

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8">
      <div className="grid lg:grid-cols-2 gap-12 items-center">
        {/* Left Content - Typography Statement */}
        <div className="space-y-6">
          <h2 className="text-3xl sm:text-4xl font-bold text-slate-800 mb-6">
            Mengenal Genza Education Pacitan
          </h2>

          {/* Statement with highlight */}
          <div className="text-lg sm:text-xl text-slate-700 leading-relaxed whitespace-pre-line">
            {/* {statement.split(' ').map((word, index) => (
              <span
                key={index}
                className="inline-block transition-all duration-300 rounded-lg -mx-1 px-1 highlight-text"
              >
                {word}
              </span>
            ))} */}
          </div>

          {/* Profile paragraph */}
          <p className="text-base sm:text-lg text-slate-600 leading-relaxed max-w-lg">
            Genza Education adalah lembaga bimbingan belajar nonformal berpusat di Yogyakarta dengan lebih dari 150 center di Indonesia. Cabang Pacitan hadir untuk menemani siswa Pacitan dan sekitarnya meraih prestasi dengan pendekatan personal.
          </p>

          {/* Sticker notes */}
          <div className="flex flex-wrap gap-3">
            <div className="flex items-center gap-2 px-4 py-2.5 bg-blue-50 border border-blue-100 rounded-2xl">
              <Target className="w-5 h-5 text-blue-500" />
              <span className="text-sm font-semibold text-slate-700">Visi Kami</span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2.5 bg-yellow-50 border border-yellow-100 rounded-2xl">
              <MessageSquare className="w-5 h-5 text-[#22539F]" />
              <span className="text-sm font-semibold text-slate-700">Pendekatan Gen Z</span>
            </div>
          </div>
        </div>

        {/* Right Content - Image with blob frame */}
        <div className="relative">
          <div className="absolute -inset-4 bg-gradient-to-br from-blue-100/50 to-yellow-100/50 rounded-[40px] blur-2xl" />

          <div className="relative bg-white rounded-[32px] p-8 shadow-card border border-slate-100">
            <div className="relative aspect-[4/3] bg-gradient-to-br from-slate-50 to-blue-50 rounded-2xl overflow-hidden flex items-center justify-center">
              {/* Decorative wave line */}
              <div className="absolute top-4 left-0 right-0 h-px bg-gradient-to-r from-transparent via-yellow-400 to-transparent" />

              {settingsLoading ? (
                <Skeleton className="absolute inset-0 h-full w-full rounded-none" />
              ) : settings.buildingImage ? (
                <img src={settings.buildingImage} alt={`Gedung Genza ${settings.branch}`} width={720} height={540} className="absolute inset-0 h-full w-full object-cover" />
              ) : <div className="text-center">
                <div className="w-32 h-32 mx-auto mb-4 bg-gradient-to-br from-blue-100 to-yellow-50 rounded-[24px] flex items-center justify-center shadow-sm">
                  <GraduationCap className="w-16 h-16 text-[#22539F]" />
                </div>
                <p className="text-slate-500 font-medium text-lg">
                  Gedung Genza Pacitan
                </p>
                <p className="text-sm text-slate-400 mt-2">
                  Foto gedung dapat diatur melalui Pengaturan Aplikasi.
                </p>
              </div>}

              {/* Decorative bottom wave */}
              <svg viewBox="0 0 1440 120" fill="none" className="absolute bottom-0 left-0 right-0 h-24">
                <path
                  d="M0 120L60 110C120 100 240 80 360 70C480 60 600 60 720 65C840 70 960 80 1080 75C1200 70 1320 60 1380 55L1440 50V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z"
                  fill="#F6CC46"
                  opacity="0.3"
                />
              </svg>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
