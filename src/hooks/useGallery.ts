import { useEffect, useRef, useState, useCallback } from 'react'
import {
  collection,
  query,
  orderBy,
  limit,
  startAfter,
  getDocs,
  QueryDocumentSnapshot,
  DocumentData,
} from 'firebase/firestore'
import { db } from '../firebase'

export interface GaleriItem {
  id: string
  judul: string
  deskripsi: string
  imageUrl: string
  urutan: number
}

const PAGE_SIZE = 12

export function useGallery() {
  const [items, setItems] = useState<GaleriItem[]>([])
  const [loading, setLoading] = useState(true)
  const [hasMore, setHasMore] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const lastDocRef = useRef<QueryDocumentSnapshot<DocumentData> | null>(null)

  const fetchPage = useCallback(async (reset = false) => {
    setLoading(true)
    try {
      let cursor = reset ? null : lastDocRef.current
      let exhausted = false
      const fetched: GaleriItem[] = []

      // Order by one field only; filtering active records in Firestore together
      // with this order can require a composite index that may not be deployed.
      while (fetched.length < PAGE_SIZE && !exhausted) {
        const q = query(
          collection(db, 'galeri_foto'),
          orderBy('urutan'),
          ...(cursor ? [startAfter(cursor)] : []),
          limit(PAGE_SIZE),
        )
        const snap = await getDocs(q)
        exhausted = snap.docs.length < PAGE_SIZE
        cursor = snap.docs.at(-1) ?? cursor

        for (const d of snap.docs) {
          const data = d.data()
          if (data.aktif !== true || typeof data.image_url !== 'string' || !data.image_url) continue
          fetched.push({
            id: d.id,
            judul: data.judul ?? '',
            deskripsi: data.deskripsi ?? '',
            imageUrl: data.image_url,
            urutan: data.urutan ?? 0,
          })
          if (fetched.length === PAGE_SIZE) break
        }

        lastDocRef.current = cursor
      }

      setItems((prev) => (reset ? fetched : [...prev, ...fetched]))
      setHasMore(!exhausted)
      setError(null)
    } catch (e) {
      setError(`Gagal memuat galeri: ${e instanceof Error ? e.message : 'Unknown error'}`)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchPage(true)
  }, [fetchPage])

  const loadMore = useCallback(() => fetchPage(false), [fetchPage])

  return { items, loading, hasMore, error, loadMore }
}
