import { useState } from 'react'
import { Quote } from 'lucide-react'
import { useTestimoni, submitTestimoni } from '../hooks/useTestimoni'
import { Skeleton } from './ui/skeleton'

export default function Testimonials() {
  const { items, loading } = useTestimoni(6)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ nama: '', asalSekolah: '', program: '', quote: '', nilai: '' })
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.nama || !form.quote) return
    setSubmitting(true)
    try {
      await submitTestimoni(form)
      setSubmitted(true)
      setShowForm(false)
      setForm({ nama: '', asalSekolah: '', program: '', quote: '', nilai: '' })
    } catch {
      alert('Gagal mengirim. Coba lagi.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <section id="testimonials" className="bg-[#F4F6FE] py-20">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold text-slate-800 mb-3">Apa Kata Mereka?</h2>
          <p className="text-lg text-slate-500">Pengalaman siswa yang telah bergabung bersama Genza Education</p>
        </div>

        {loading ? (
          <div aria-busy="true" className="mb-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 3 }).map((_, index) => <div key={index} className="space-y-4 rounded-[20px] border border-slate-100 bg-white p-6"><Skeleton className="h-6 w-8" /><Skeleton className="h-4 w-full" /><Skeleton className="h-4 w-4/5" /><div className="flex items-center gap-3 pt-2"><Skeleton className="h-10 w-10 rounded-full" /><div className="space-y-2"><Skeleton className="h-4 w-28" /><Skeleton className="h-3 w-20" /></div></div></div>)}
            <span className="sr-only">Memuat testimoni...</span>
          </div>
        ) : items.length > 0 && (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
            {items.map((t) => (
              <div key={t.id} className="bg-white rounded-[20px] p-6 border border-slate-100 shadow-card">
                <Quote size={24} className="text-[#22539F]/30 mb-3" />
                <p className="text-slate-700 italic mb-4">"{t.quote}"</p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full overflow-hidden bg-[#22539F] flex items-center justify-center flex-shrink-0">
                    {t.fotoBa64 ? (
                      <img src={t.fotoBa64} alt={t.nama} className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-white font-bold">{t.nama.charAt(0)}</span>
                    )}
                  </div>
                  <div>
                    <p className="font-semibold text-slate-800 text-sm">{t.nama}</p>
                    <p className="text-slate-500 text-xs">{t.asalSekolah}</p>
                    {t.nilai && <p className="text-slate-400 text-xs">Nilai: {t.nilai}</p>}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* CTA kirim testimoni */}
        {submitted ? (
          <p className="text-center text-green-600 font-semibold">✓ Testimonimu berhasil dikirim dan sedang ditinjau. Terima kasih!</p>
        ) : showForm ? (
          <form onSubmit={handleSubmit} className="max-w-lg mx-auto bg-white rounded-[20px] p-6 border border-slate-100 shadow-card space-y-4">
            <h3 className="font-bold text-slate-800 text-lg">Bagikan Pengalamanmu</h3>
            <input required value={form.nama} onChange={(e) => setForm({ ...form, nama: e.target.value })} placeholder="Namamu *" className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-200" />
            <input value={form.asalSekolah} onChange={(e) => setForm({ ...form, asalSekolah: e.target.value })} placeholder="Asal sekolah" className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-200" />
            <input value={form.program} onChange={(e) => setForm({ ...form, program: e.target.value })} placeholder="Program yang diikuti (mis. UTBK-SNBT)" className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-200" />
            <textarea required value={form.quote} onChange={(e) => setForm({ ...form, quote: e.target.value })} placeholder="Ceritakan pengalamanmu belajar di Genza *" rows={3} className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-200 resize-none" />
            <input value={form.nilai} onChange={(e) => setForm({ ...form, nilai: e.target.value })} placeholder="Nilai ujian (opsional)" className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-200" />
            <div className="flex gap-3">
              <button type="submit" disabled={submitting} className="flex-1 py-2.5 bg-[#22539F] text-white font-bold rounded-xl hover:bg-[#22539F] disabled:opacity-50 transition-colors text-sm">
                {submitting ? 'Mengirim...' : 'Kirim Testimoni'}
              </button>
              <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2.5 border border-slate-200 rounded-xl text-slate-600 text-sm hover:bg-slate-50 transition-colors">
                Batal
              </button>
            </div>
          </form>
        ) : (
          <div className="text-center">
            <button onClick={() => setShowForm(true)} className="inline-flex items-center gap-2 px-6 py-3 border-2 border-[#22539F] text-[#22539F] font-bold rounded-full hover:bg-[#22539F] hover:text-white transition-all cursor-pointer">
              Bagikan Pengalamanmu
            </button>
          </div>
        )}
      </div>
    </section>
  )
}
