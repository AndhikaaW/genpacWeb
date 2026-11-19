import { useEffect, useState } from 'react'
import { collection, onSnapshot, orderBy, query, where } from 'firebase/firestore'
import { db } from '../firebase'
import Navbar from './Navbar'
import Footer from './Footer'
import FloatingWA from './FloatingWA'
import { AppSettingsProvider } from '../hooks/AppSettingsContext'
import { ExternalLink, Megaphone, X } from 'lucide-react'

interface PengumumanItem {
  id: string
  judul: string
  konten: string
  coverBase64: string
  lampiranUrl: string
  lampiranLabel: string
  createdAt: Date | null
}

function formatTanggal(date: Date | null) {
  if (!date) return ''
  return date.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })
}

function usePengumuman() {
  const [items, setItems] = useState<PengumumanItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  useEffect(() => onSnapshot(
    query(collection(db, 'pengumuman'), where('aktif', '==', true), orderBy('urutan')),
    (snapshot) => {
      setItems(snapshot.docs.map((document) => {
        const data = document.data()
        return {
          id: document.id,
          judul: data.judul ?? '',
          konten: data.konten ?? '',
          coverBase64: data.cover_base64 ?? '',
          lampiranUrl: data.lampiran_url ?? '',
          lampiranLabel: data.lampiran_label ?? 'Lihat Lampiran',
          createdAt: data.created_at?.toDate?.() ?? null,
        }
      }))
      setLoading(false)
    },
    (loadError) => {
      console.error('Gagal memuat pengumuman dari Firestore:', loadError)
      setLoading(false)
      setError(true)
    },
  ), [])

  return { items, loading, error }
}

function ImageLightbox({ src, alt, onClose }: { src: string; alt: string; onClose: () => void }) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [onClose])

  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center bg-black/80 p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={alt}
    >
      <button
        type="button"
        onClick={onClose}
        aria-label="Tutup gambar"
        className="absolute top-4 right-4 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors cursor-pointer"
      >
        <X className="w-5 h-5" aria-hidden="true" />
      </button>
      <img
        src={src}
        alt={alt}
        className="max-w-full max-h-[90vh] rounded-xl object-contain shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      />
    </div>
  )
}

function PengumumanCard({ item }: { item: PengumumanItem }) {
  const [lightbox, setLightbox] = useState(false)

  return (
    <>
      {lightbox && item.coverBase64 && (
        <ImageLightbox
          src={item.coverBase64}
          alt={`Cover ${item.judul}`}
          onClose={() => setLightbox(false)}
        />
      )}
      <article className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow">
        {item.coverBase64 && (
          <div className="bg-slate-50 flex items-center justify-center p-2">
            <img
              src={item.coverBase64}
              alt={`Cover ${item.judul}`}
              className="max-w-full h-auto max-h-[480px] rounded-xl object-contain cursor-zoom-in"
              onClick={() => setLightbox(true)}
            />
          </div>
        )}
        <div className="p-6">
          {item.createdAt && (
            <p className="text-xs font-medium text-blue-500 mb-2 uppercase tracking-wide">
              {formatTanggal(item.createdAt)}
            </p>
          )}
          <h2 className="font-heading text-xl font-bold text-slate-800 mb-3 leading-snug">
            {item.judul}
          </h2>
          <p className="text-slate-600 text-sm leading-relaxed whitespace-pre-line">
            {item.konten}
          </p>
          {item.lampiranUrl && (
            <a
              href={item.lampiranUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-5 inline-flex items-center gap-2 px-4 py-2.5 bg-[#22539F] text-white text-sm font-semibold rounded-lg hover:bg-blue-800 transition-colors cursor-pointer"
            >
              <ExternalLink className="w-4 h-4" aria-hidden="true" />
              {item.lampiranLabel}
            </a>
          )}
        </div>
      </article>
    </>
  )
}

export default function AnnouncementPage() {
  const [isScrolled, setIsScrolled] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const { items, loading, error } = usePengumuman()

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 80)
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <AppSettingsProvider>
      <main className="min-h-screen bg-[#F4F6FE]">
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[100] focus:px-4 focus:py-2 focus:bg-yellow-400 focus:text-[#22539F] focus:font-bold focus:rounded-lg"
        >
          Lewati ke konten
        </a>

        <Navbar
          isScrolled={isScrolled}
          mobileMenuOpen={mobileMenuOpen}
          onMobileMenuToggle={() => setMobileMenuOpen(!mobileMenuOpen)}
        />

        {/* Page header — same visual rhythm as #fasilitas (blue bg) */}
        <div className="bg-[#22539F] pt-28 pb-16 px-4">
          <div className="container mx-auto max-w-4xl text-center">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-white/15 mb-5" aria-hidden="true">
              <Megaphone className="w-7 h-7 text-white" />
            </div>
            <h1 className="font-heading text-3xl sm:text-4xl font-bold text-white mb-3">
              Pengumuman
            </h1>
            <p className="text-blue-200 text-base max-w-md mx-auto">
              Informasi terbaru dari Genza Education Pacitan.
            </p>
          </div>
        </div>

        <div id="main-content" className="container mx-auto max-w-4xl px-4 py-14">
          {loading && (
            <div className="space-y-6" aria-busy="true" aria-label="Memuat pengumuman">
              {[1, 2, 3].map((n) => (
                <div key={n} className="bg-white rounded-2xl border border-slate-200 overflow-hidden animate-pulse">
                  <div className="h-40 bg-slate-200" />
                  <div className="p-6 space-y-3">
                    <div className="h-3 w-24 bg-slate-200 rounded" />
                    <div className="h-5 w-3/4 bg-slate-200 rounded" />
                    <div className="h-4 w-full bg-slate-100 rounded" />
                    <div className="h-4 w-5/6 bg-slate-100 rounded" />
                  </div>
                </div>
              ))}
              <span className="sr-only">Memuat pengumuman...</span>
            </div>
          )}

          {error && (
            <div role="alert" className="rounded-xl border border-red-200 bg-red-50 p-6 text-center text-sm text-red-700">
              Gagal memuat pengumuman. Periksa koneksi internet dan coba lagi.
            </div>
          )}

          {!loading && !error && items.length === 0 && (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-white py-20 text-center px-4">
              <Megaphone className="w-10 h-10 text-slate-300 mx-auto mb-4" aria-hidden="true" />
              <p className="font-semibold text-slate-700 mb-1">Belum ada pengumuman</p>
              <p className="text-sm text-slate-500">Pantau terus halaman ini untuk informasi terbaru.</p>
            </div>
          )}

          {!loading && !error && items.length > 0 && (
            <div className="space-y-6">
              {items.map((item) => (
                <PengumumanCard key={item.id} item={item} />
              ))}
            </div>
          )}
        </div>

        <Footer />
        <FloatingWA />
      </main>
    </AppSettingsProvider>
  )
}
