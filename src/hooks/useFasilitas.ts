import { useEffect, useState } from 'react'
import { collection, getDocs } from 'firebase/firestore'
import { db } from '../firebase'

export interface FasilitasItem {
  id: string
  nama: string
  deskripsi: string
  ikonName: string
  urutan: number
}

export function useFasilitas() {
  const [items, setItems] = useState<FasilitasItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  useEffect(() => {
    let cancelled = false
    // Filter and sort client-side so this read does not depend on a composite
    // Firestore index being present in each deployment.
    getDocs(collection(db, 'fasilitas_gsystem'))
      .then((snap) => {
        if (cancelled) return
        const rows = snap.docs
          .map((d) => {
            const data = d.data()
            return {
              id: d.id,
              nama: typeof data.nama === 'string' ? data.nama : '',
              deskripsi: typeof data.deskripsi === 'string' ? data.deskripsi : '',
              ikonName: typeof data.ikonName === 'string' ? data.ikonName : (typeof data.ikon_name === 'string' ? data.ikon_name : 'zap'),
              urutan: typeof data.urutan === 'number' ? data.urutan : Number.MAX_SAFE_INTEGER,
              aktif: data.aktif === true,
            }
          })
          .filter((item) => item.aktif && item.nama)
          .sort((a, b) => a.urutan - b.urutan || a.nama.localeCompare(b.nama))
          .map(({ aktif: _aktif, ...item }) => item)
        setItems(rows)
      })
      .catch((err) => {
        console.error('Gagal memuat fasilitas dari Firestore:', err)
        if (!cancelled) setError(true)
      })
      .finally(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [])

  return { items, loading, error }
}
