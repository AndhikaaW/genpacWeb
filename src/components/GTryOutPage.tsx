import { useEffect, useState } from 'react'
import { collection, onSnapshot, query, where } from 'firebase/firestore'
import { ArrowUpRight, ClipboardCheck } from 'lucide-react'
import { db } from '../firebase'
import Navbar from './Navbar'
import Footer from './Footer'
import FloatingWA from './FloatingWA'
import { AppSettingsProvider } from '../hooks/AppSettingsContext'
import TryOutResultsPage from './TryOutResultsPage'
import { Dialog, DialogContent, DialogTitle } from './ui/dialog'

interface GTryOutItem {
  id: string
  judul: string
  ringkasan: string
  deskripsi: string
  jadwal: string
  poster: string
  tombolLabel: string
  linkUrl: string
  urutan: number
}

function safeHttpsUrl(value: string) {
  try {
    const url = new URL(value)
    return url.protocol === 'https:' ? url.toString() : null
  } catch {
    return null
  }
}

function useGTryOuts() {
  const [items, setItems] = useState<GTryOutItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  useEffect(() => onSnapshot(
    query(collection(db, 'g_tryouts'), where('aktif', '==', true)),
    (snapshot) => {
      const activeItems = snapshot.docs.map((document) => {
        const data = document.data()
        return {
          id: document.id,
          judul: typeof data.judul === 'string' ? data.judul : '',
          ringkasan: typeof data.ringkasan === 'string' ? data.ringkasan : '',
          deskripsi: typeof data.deskripsi === 'string' ? data.deskripsi : '',
          jadwal: typeof data.jadwal === 'string' ? data.jadwal : '',
          poster: typeof data.poster_base64 === 'string' ? data.poster_base64 : '',
          tombolLabel: typeof data.tombol_label === 'string' ? data.tombol_label : 'Masuk ke G-Try Out',
          linkUrl: typeof data.link_url === 'string' ? data.link_url : '',
          urutan: typeof data.urutan === 'number' ? data.urutan : 0,
        }
      })
      setItems(activeItems.sort((a, b) => a.urutan - b.urutan))
      setLoading(false)
      setError(false)
    },
    (loadError) => {
      console.error('Gagal memuat G-Try Out:', loadError)
      setLoading(false)
      setError(true)
    },
  ), [])

  return { items, loading, error }
}

function TryOutCard({ item }: { item: GTryOutItem }) {
  const [showPoster, setShowPoster] = useState(false)
  const destination = safeHttpsUrl(item.linkUrl)

  return (
    <article className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      {item.poster && (
        <button
          type="button"
          onClick={() => setShowPoster(true)}
          aria-label={`Perbesar poster ${item.judul}`}
          className="flex max-h-[440px] w-full cursor-zoom-in items-center justify-center bg-slate-50 p-3 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-blue-700"
        >
          <img
            src={item.poster}
            alt={`Poster ${item.judul}`}
            className="max-h-[414px] max-w-full rounded-lg object-contain"
          />
        </button>
      )}

      <div className="p-5 sm:p-7">
        {item.jadwal && (
          <p className="mb-2 text-sm font-semibold text-blue-700">{item.jadwal}</p>
        )}
        <h2 className="font-heading text-xl font-bold leading-snug text-slate-900 sm:text-2xl">
          {item.judul}
        </h2>
        {item.ringkasan && (
          <p className="mt-3 font-medium leading-relaxed text-slate-700">{item.ringkasan}</p>
        )}
        {item.deskripsi && (
          <p className="mt-3 whitespace-pre-line text-sm leading-relaxed text-slate-600">{item.deskripsi}</p>
        )}
        {destination && (
          <a
            href={destination}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-5 inline-flex min-h-11 items-center gap-2 rounded-lg bg-[#22539F] px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-blue-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-700 focus-visible:ring-offset-2"
          >
            {item.tombolLabel || 'Masuk ke G-Try Out'}
            <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
          </a>
        )}
      </div>

      <Dialog open={showPoster} onOpenChange={setShowPoster}>
        <DialogContent className="max-h-[95vh] max-w-5xl overflow-y-auto border-0 bg-black/95 p-3 sm:p-5">
          <DialogTitle className="sr-only">Poster {item.judul}</DialogTitle>
          {item.poster && (
            <img
              src={item.poster}
              alt={`Poster ${item.judul}`}
              className="mx-auto max-h-[85vh] max-w-full object-contain"
            />
          )}
        </DialogContent>
      </Dialog>
    </article>
  )
}

function GTryOutContent() {
  const [isScrolled, setIsScrolled] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const { items, loading, error } = useGTryOuts()

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 80)
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <main className="min-h-screen bg-[#F4F6FE]">
      <a href="#main-content" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-lg focus:bg-yellow-400 focus:px-4 focus:py-2 focus:font-bold focus:text-[#22539F]">
        Lewati ke konten
      </a>
      <Navbar
        isScrolled={isScrolled}
        mobileMenuOpen={mobileMenuOpen}
        onMobileMenuToggle={() => setMobileMenuOpen((open) => !open)}
      />

      <header className="bg-[#22539F] px-4 pb-14 pt-28 text-center sm:pb-16">
        <div className="container mx-auto max-w-4xl">
          <div className="mb-5 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-white/15" aria-hidden="true">
            <ClipboardCheck className="h-7 w-7 text-white" />
          </div>
          <h1 className="font-heading text-3xl font-bold text-white sm:text-4xl">G-Try Out</h1>
          <p className="mx-auto mt-3 max-w-xl text-base leading-relaxed text-blue-100">
            Informasi try out dan akses ke platform G-Try Out Genza.
          </p>
        </div>
      </header>

      <section id="main-content" className="container mx-auto max-w-5xl px-4 py-10 sm:py-14" aria-label="Informasi G-Try Out">
        {loading && (
          <div className="space-y-5" aria-busy="true" aria-label="Memuat informasi G-Try Out">
            {[0, 1].map((item) => <div key={item} className="h-64 animate-pulse rounded-2xl border border-slate-200 bg-white" />)}
            <p className="sr-only">Memuat informasi G-Try Out...</p>
          </div>
        )}
        {error && (
          <div role="alert" className="rounded-xl border border-red-200 bg-red-50 p-5 text-center text-sm text-red-800">
            Informasi G-Try Out belum dapat dimuat. Silakan coba lagi nanti.
          </div>
        )}
        {!loading && !error && items.length === 0 && (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-5 py-16 text-center">
            <ClipboardCheck className="mx-auto mb-4 h-10 w-10 text-slate-400" aria-hidden="true" />
            <h2 className="font-semibold text-slate-800">Belum ada informasi try out</h2>
            <p className="mt-2 text-sm text-slate-600">Informasi yang tersedia akan ditampilkan di halaman ini.</p>
          </div>
        )}
        {!loading && !error && items.length > 0 && (
          <div className="space-y-6">
            {items.map((item) => <TryOutCard key={item.id} item={item} />)}
          </div>
        )}
      </section>

      <TryOutResultsPage />

      <Footer />
      <FloatingWA />
    </main>
  )
}

export default function GTryOutPage() {
  return <AppSettingsProvider><GTryOutContent /></AppSettingsProvider>
}
