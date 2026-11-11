import { useEffect, useState } from 'react'
import { collection, query, where, orderBy, limit, getDocs, addDoc, serverTimestamp } from 'firebase/firestore'
import { db } from '../firebase'

export interface TestimoniItem {
  id: string
  nama: string
  asalSekolah: string
  program: string
  quote: string
  fotoBa64: string
  nilai: string
}

export function useTestimoni(maxItems = 6) {
  const [items, setItems] = useState<TestimoniItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    getDocs(query(
      collection(db, 'testimoni'),
      where('status', '==', 'disetujui'),
      orderBy('created_at', 'desc'),
      limit(maxItems),
    ))
      .then((snap) => {
        if (cancelled) return
        setItems(snap.docs.map((d) => ({
          id: d.id,
          nama: d.data().nama ?? '',
          asalSekolah: d.data().asal_sekolah ?? '',
          program: d.data().program ?? '',
          quote: d.data().quote ?? '',
          fotoBa64: d.data().foto_base64 ?? '',
          nilai: d.data().nilai ?? '',
        })))
      })
      .catch(console.error)
      .finally(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [maxItems])

  return { items, loading }
}

/** Submit testimoni dari landing page (status: pending) */
export async function submitTestimoni(data: {
  nama: string
  asalSekolah: string
  program: string
  quote: string
  nilai?: string
}): Promise<void> {
  await addDoc(collection(db, 'testimoni'), {
    nama: data.nama,
    asal_sekolah: data.asalSekolah,
    program: data.program,
    quote: data.quote,
    nilai: data.nilai ?? '',
    foto_base64: '',
    status: 'pending',
    created_at: serverTimestamp(),
  })
}
