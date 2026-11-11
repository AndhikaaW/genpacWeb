import { useEffect, useState } from 'react'
import { collection, getDocs } from 'firebase/firestore'
import { db } from '../firebase'

export interface LandingBanner {
  id: string
  judul: string
  deskripsi: string
  imageUrl: string
  urutan: number
}

export function useBanners() {
  const [items, setItems] = useState<LandingBanner[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    getDocs(collection(db, 'landing_banners'))
      .then((snapshot) => {
        if (cancelled) return
        const activeBanners = snapshot.docs
          .map((banner) => {
            const data = banner.data()
            return {
              id: banner.id,
              judul: typeof data.judul === 'string' ? data.judul : '',
              deskripsi: typeof data.deskripsi === 'string' ? data.deskripsi : '',
              imageUrl: typeof data.image_url === 'string' ? data.image_url : '',
              urutan: typeof data.urutan === 'number' ? data.urutan : Number.MAX_SAFE_INTEGER,
              aktif: data.aktif === true,
            }
          })
          .filter((banner) => banner.aktif && banner.imageUrl)
          .sort((a, b) => a.urutan - b.urutan || a.judul.localeCompare(b.judul))
          .map(({ aktif: _aktif, ...banner }) => banner)
        setItems(activeBanners)
      })
      .catch((error) => console.error('Gagal memuat banner landing:', error))
      .finally(() => { if (!cancelled) setLoading(false) })

    return () => { cancelled = true }
  }, [])

  return { items, loading }
}
