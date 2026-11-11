import { Award, Target, TrendingUp, FileText, CheckCircle, Globe } from 'lucide-react'

export default function WhyGenza() {
  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8">
      <div className="mb-12">
        <h2 className="text-3xl sm:text-4xl font-bold text-slate-800 mb-3">
          Kenapa Genza?
        </h2>
        <p className="text-lg text-slate-500">Bukan klaim. Ini sistem yang sudah terbukti.</p>
      </div>

      {/* Bento grid - varied tile sizes per spec §6.6 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4 auto-rows-min">
        {/* Tile 1: Jaringan Nasional — large (spans 3-col on lg) */}
        <div className="lg:col-span-3 lg:row-span-2 relative bg-[#22539F] rounded-[20px] p-8 overflow-hidden min-h-[220px] flex flex-col justify-between group hover:shadow-cardHover transition-all duration-300">
          {/* Network dot decoration */}
          <svg className="absolute inset-0 w-full h-full opacity-20" viewBox="0 0 400 300" aria-hidden="true">
            {[
              [80, 60], [160, 40], [240, 80], [320, 60], [60, 140], [140, 160],
              [220, 130], [300, 150], [100, 220], [200, 200], [310, 240],
            ].map(([cx, cy], i) => (
              <circle key={i} cx={cx} cy={cy} r="3" fill="#8FB4E3" />
            ))}
            {/* Lines */}
            <line x1="80" y1="60" x2="160" y2="40" stroke="#8FB4E3" strokeWidth="0.8" />
            <line x1="160" y1="40" x2="240" y2="80" stroke="#8FB4E3" strokeWidth="0.8" />
            <line x1="240" y1="80" x2="320" y2="60" stroke="#8FB4E3" strokeWidth="0.8" />
            <line x1="60" y1="140" x2="140" y2="160" stroke="#8FB4E3" strokeWidth="0.8" />
            <line x1="140" y1="160" x2="220" y2="130" stroke="#8FB4E3" strokeWidth="0.8" />
            <line x1="80" y1="60" x2="60" y2="140" stroke="#8FB4E3" strokeWidth="0.8" />
            {/* Pacitan node — yellow pulsing */}
            <circle cx="200" cy="200" r="8" fill="#F6CC46" className="animate-pulse" />
            <circle cx="200" cy="200" r="4" fill="#F6CC46" />
          </svg>
          <div className="relative z-10">
            <Globe className="w-10 h-10 text-blue-300 mb-4" aria-hidden="true" />
            <h3 className="text-2xl font-bold text-white mb-2">Jaringan Nasional</h3>
            <p className="text-blue-200 text-sm leading-relaxed">150+ center di seluruh Indonesia. Titik kuning = Genza Pacitan.</p>
          </div>
          <div className="relative z-10 mt-4">
            <span className="text-5xl font-bold text-yellow-400">150+</span>
            <span className="text-blue-300 text-lg ml-2">center</span>
          </div>
        </div>

        {/* Tile 2: G-Tutor Terseleksi */}
        <div className="lg:col-span-3 bg-white rounded-[20px] p-6 border border-slate-100 hover:shadow-card transition-all duration-300 group">
          <Award className="w-8 h-8 text-[#22539F] mb-4 group-hover:scale-110 transition-transform" aria-hidden="true" />
          <h3 className="text-lg font-bold text-slate-800 mb-2">G-Tutor Terseleksi</h3>
          <p className="text-slate-500 text-sm leading-relaxed">Seleksi standar nasional dan pelatihan intensif sebelum mengajar.</p>
          <div className="mt-4 h-1 w-0 bg-yellow-400 rounded-full group-hover:w-full transition-all duration-500" aria-hidden="true" />
        </div>

        {/* Tile 3: Materi Terstruktur */}
        <div className="lg:col-span-3 bg-[#F4F6FE] rounded-[20px] p-6 hover:shadow-card transition-all duration-300 group">
          <Target className="w-8 h-8 text-[#22539F] mb-4 group-hover:scale-110 transition-transform" aria-hidden="true" />
          <h3 className="text-lg font-bold text-slate-800 mb-2">Materi Terstruktur</h3>
          <p className="text-slate-500 text-sm leading-relaxed">G-System: materi terencana, terukur, dan dapat dipantau per sesi.</p>
          <div className="mt-4 h-1 w-0 bg-yellow-400 rounded-full group-hover:w-full transition-all duration-500" aria-hidden="true" />
        </div>

        {/* Tile 4: Tes Diagnostik */}
        <div className="lg:col-span-2 bg-yellow-400 rounded-[20px] p-6 hover:shadow-card transition-all duration-300 group">
          <TrendingUp className="w-8 h-8 text-[#22539F] mb-4 group-hover:scale-110 transition-transform" aria-hidden="true" />
          <h3 className="text-lg font-bold text-[#22539F] mb-2">Tes Diagnostik</h3>
          <p className="text-[#22539F]/70 text-sm leading-relaxed">Pemetaan kemampuan awal untuk pendekatan personal.</p>
        </div>

        {/* Tile 5: Tryout Berkala */}
        <div className="lg:col-span-2 bg-white rounded-[20px] p-6 border border-slate-100 hover:shadow-card transition-all duration-300 group">
          <FileText className="w-8 h-8 text-[#22539F] mb-4 group-hover:scale-110 transition-transform" aria-hidden="true" />
          <h3 className="text-lg font-bold text-slate-800 mb-2">Tryout Berkala</h3>
          <p className="text-slate-500 text-sm leading-relaxed">Simulasi ujian nyata untuk mempersiapkan siswa.</p>
          <div className="mt-4 h-1 w-0 bg-yellow-400 rounded-full group-hover:w-full transition-all duration-500" aria-hidden="true" />
        </div>

        {/* Tile 6: Laporan Perkembangan */}
        <div className="lg:col-span-2 bg-[#22539F] rounded-[20px] p-6 hover:shadow-card transition-all duration-300 group">
          <CheckCircle className="w-8 h-8 text-blue-300 mb-4 group-hover:scale-110 transition-transform" aria-hidden="true" />
          <h3 className="text-lg font-bold text-white mb-2">Laporan Perkembangan</h3>
          <p className="text-blue-200 text-sm leading-relaxed">Monitoring kemajuan belajar berkala untuk orang tua dan siswa.</p>
        </div>
      </div>
    </div>
  )
}
