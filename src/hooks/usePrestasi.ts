import { useEffect, useState } from 'react'
import { collection, getDocs, query, where } from 'firebase/firestore'
import { db } from '../firebase'

export interface PrestasiItem {
  id: string
  nama: string
  prestasi: string
  keterangan: string
  sekolah: string
  fotoBase64: string
  urutan: number
}

export function usePrestasi() {
  const [items, setItems] = useState<PrestasiItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  useEffect(() => {
    let cancelled = false
    getDocs(query(collection(db, 'prestasi_siswa'), where('aktif', '==', true)))
      .then((snapshot) => {
        if (cancelled) return
        setItems(snapshot.docs.map((document) => {
          const data = document.data()
          return {
            id: document.id,
            nama: data.nama ?? '',
            prestasi: data.prestasi ?? '',
            keterangan: data.keterangan ?? '',
            sekolah: data.sekolah ?? '',
            fotoBase64: data.foto_base64 ?? '',
            urutan: data.urutan ?? 0,
          }
        }).sort((left, right) => left.urutan - right.urutan))
      })
      .catch((loadError) => {
        console.error('Gagal memuat prestasi siswa:', loadError)
        if (!cancelled) setError(true)
      })
      .finally(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [])

  return { items, loading, error }
}
