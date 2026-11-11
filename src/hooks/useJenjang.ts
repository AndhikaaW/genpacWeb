import { useEffect, useState } from 'react'
import { collection, query, where, orderBy, getDocs } from 'firebase/firestore'
import { db } from '../firebase'

export interface JenjangItem {
  id: string
  title: string
  description: string
  subjects: string[]
  facilities: string[]
  ikonName: string
  urutan: number
}

export function useJenjang() {
  const [items, setItems] = useState<JenjangItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    getDocs(query(collection(db, 'jenjang_program'), where('aktif', '==', true), orderBy('urutan')))
      .then((snap) => {
        if (cancelled) return
        setItems(snap.docs.map((d) => ({ id: d.id, ...d.data() }) as JenjangItem))
      })
      .catch(console.error)
      .finally(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [])

  return { items, loading }
}
