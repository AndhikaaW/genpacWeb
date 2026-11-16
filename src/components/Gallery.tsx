import { useState } from 'react'
import { useGallery } from '../hooks/useGallery'
import type { GaleriItem } from '../hooks/useGallery'
import { Skeleton } from './ui/skeleton'
import ResponsiveCarousel from './ResponsiveCarousel'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from './ui/dialog'

export default function Gallery() {
  const { items, loading, hasMore, error, loadMore } = useGallery()
  const photos = items
  const [selectedPhoto, setSelectedPhoto] = useState<GaleriItem | null>(null)

  if (!loading && photos.length === 0 && !error) return null

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8">
      <div className="mb-12">
        <h2 className="text-3xl sm:text-4xl font-bold text-slate-800 mb-3">Galeri</h2>
        <p className="text-lg text-slate-500">Dokumentasi kegiatan dan fasilitas Genza Pacitan.</p>
      </div>

      {error && <p role="alert" className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</p>}

      {photos.length > 0 && <ResponsiveCarousel count={photos.length} label="Foto galeri" gridClassName="md:grid-cols-3">
        {photos.map((item, index) => (
          <figure key={item.id} className="w-[82vw] max-w-[360px] flex-shrink-0 snap-start md:w-auto md:max-w-none md:flex-shrink">
            <button
              type="button"
              onClick={() => setSelectedPhoto(item)}
              aria-label={`Perbesar foto: ${item.judul}`}
              className="block w-full rounded-[20px] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#F6CC46]"
            >
              <span
                className="block aspect-[4/3] overflow-hidden rounded-[20px] transition-transform duration-300"
                style={{ transform: `rotate(${(index % 3 - 1) * 1.5}deg)` }}
                onMouseEnter={(event) => { event.currentTarget.style.transform = 'rotate(0deg) scale(1.03)' }}
                onMouseLeave={(event) => { event.currentTarget.style.transform = `rotate(${(index % 3 - 1) * 1.5}deg)` }}
              >
                <img src={item.imageUrl} alt={item.judul} loading="lazy" width={400} height={300} className="h-full w-full object-cover" />
              </span>
            </button>
            <figcaption className="mt-3 px-1 text-sm font-semibold leading-snug text-slate-800 sm:text-base">{item.judul}</figcaption>
          </figure>
        ))}
      </ResponsiveCarousel>}

      <Dialog open={!!selectedPhoto} onOpenChange={(open) => { if (!open) setSelectedPhoto(null) }}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-4xl">
          <DialogHeader>
            <DialogTitle>{selectedPhoto?.judul}</DialogTitle>
            {selectedPhoto?.deskripsi && <DialogDescription>{selectedPhoto.deskripsi}</DialogDescription>}
          </DialogHeader>
          {selectedPhoto && <img src={selectedPhoto.imageUrl} alt={selectedPhoto.judul} width={1600} height={1200} className="max-h-[72vh] w-full rounded-lg bg-slate-100 object-contain" />}
        </DialogContent>
      </Dialog>

      {/* Skeleton saat loading halaman pertama */}
      {loading && items.length === 0 && (
        <div aria-busy="true" className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="aspect-[4/3] rounded-[20px]" />
          ))}
          <span className="sr-only">Memuat galeri...</span>
        </div>
      )}

      {/* Tombol load more */}
      {hasMore && (
        <div className="flex justify-center mt-8">
          <button
            onClick={loadMore}
            disabled={loading}
            className="px-6 py-3 rounded-xl bg-blue-600 text-white font-semibold hover:bg-blue-700 disabled:opacity-50 transition-colors"
          >
            {loading ? 'Memuat...' : 'Muat Lebih Banyak'}
          </button>
        </div>
      )}
    </div>
  )
}
