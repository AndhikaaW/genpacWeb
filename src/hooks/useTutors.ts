import { useEffect, useState } from 'react'
import { collection, query, where, orderBy, getDocs } from 'firebase/firestore'
import { db } from '../firebase'

export interface TutorItem {
  id: string
  nama: string
  mapel: string
  fotoBa64: string // base64 string dengan prefix data:image/jpeg;base64,...
  urutan: number
}

export function useTutors() {
  const [items, setItems] = useState<TutorItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    getDocs(query(collection(db, 'tutors'), where('aktif', '==', true), orderBy('urutan')))
      .then((snap) => {
        if (cancelled) return
        setItems(snap.docs.map((d) => ({
          id: d.id,
          nama: d.data().nama ?? '',
          mapel: d.data().mapel ?? '',
          fotoBa64: d.data().foto_base64 ?? '',
          urutan: d.data().urutan ?? 0,
        })))
      })
      .catch(console.error)
      .finally(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [])

  return { items, loading }
}
