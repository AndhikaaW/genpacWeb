import { useGallery } from '../hooks/useGallery'
import { Skeleton } from './ui/skeleton'

export default function Gallery() {
  const { items, loading, hasMore, error, loadMore } = useGallery()
  const photos = items

  if (!loading && photos.length === 0 && !error) return null

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8">
      <div className="mb-12">
        <h2 className="text-3xl sm:text-4xl font-bold text-slate-800 mb-3">Galeri</h2>
        <p className="text-lg text-slate-500">Dokumentasi kegiatan dan fasilitas Genza Pacitan.</p>
      </div>

      {error && <p role="alert" className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</p>}

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        {photos.map((item, index) => (
          <figure
            key={item.id}
            className="group min-w-0"
          >
            <div
              className="relative aspect-[4/3] overflow-hidden rounded-[20px]"
              style={{ transform: `rotate(${(index % 3 - 1) * 1.5}deg)`, transition: 'transform 0.3s ease' }}
              onMouseEnter={(event) => { event.currentTarget.style.transform = 'rotate(0deg) scale(1.03)' }}
              onMouseLeave={(event) => { event.currentTarget.style.transform = `rotate(${(index % 3 - 1) * 1.5}deg)` }}
            >
              <img
                src={item.imageUrl}
                alt={item.judul}
                loading="lazy"
                width={400}
                height={300}
                className="h-full w-full object-cover"
              />
            </div>
            <figcaption className="mt-3 px-1 text-sm font-semibold leading-snug text-slate-800 sm:text-base">
              {item.judul}
            </figcaption>
          </figure>
        ))}
      </div>

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
