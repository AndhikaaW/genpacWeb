import { useEffect, useState } from 'react'
import {
  doc,
  getDoc,
  collection,
  getDocs,
  query,
  where,
  orderBy,
} from 'firebase/firestore'
import { db } from '../firebase'
import type { Branch, Program, LandingContent } from '../types'

export function useBranch(branchId: string) {
  const [branch, setBranch] = useState<Branch | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    if (!branchId) {
      setLoading(false)
      setError('ID cabang tidak valid')
      return
    }
    const ref = doc(db, 'branches', branchId)
    getDoc(ref)
      .then((snap) => {
        if (cancelled) return
        if (snap.exists()) {
          setBranch({ id: snap.id, ...snap.data() } as Branch)
        } else {
          setError('Cabang tidak ditemukan')
        }
      })
      .catch((e) => {
        if (cancelled) return
        setError(`Gagal memuat data cabang: ${e instanceof Error ? e.message : 'Unknown error'}`)
      })
      .finally(() => {
        if (cancelled) return
        setLoading(false)
      })
    return () => { cancelled = true }
  }, [branchId])

  return { branch, loading, error }
}

export function usePrograms() {
  const [programs, setPrograms] = useState<Program[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    const ref = collection(db, 'programs')
    const q = query(ref, where('aktif', '==', true))
    getDocs(q)
      .then((snap) => {
        if (cancelled) return
        const list = snap.docs.map(
          (d) => ({ id: d.id, ...d.data() }) as Program
        )
        setPrograms(list)
      })
      .catch((e) => {
        if (cancelled) return
        setError(`Gagal memuat program: ${e instanceof Error ? e.message : 'Unknown error'}`)
      })
      .finally(() => {
        if (cancelled) return
        setLoading(false)
      })
    return () => { cancelled = true }
  }, [])

  return { programs, loading, error }
}

export function useLandingContent(branchId: string) {
  const [contents, setContents] = useState<LandingContent[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    if (!branchId) {
      setLoading(false)
      return
    }
    const ref = collection(db, 'landing_content', branchId, 'sections')
    const q = query(ref, orderBy('urutanTampil', 'asc'))
    getDocs(q)
      .then((snap) => {
        if (cancelled) return
        const list = snap.docs.map(
          (d) => ({ id: d.id, ...d.data() }) as LandingContent
        )
        setContents(list)
      })
      .catch((e) => {
        if (cancelled) return
        setError(`Gagal memuat konten: ${e instanceof Error ? e.message : 'Unknown error'}`)
      })
      .finally(() => {
        if (cancelled) return
        setLoading(false)
      })
    return () => { cancelled = true }
  }, [branchId])

  return { contents, loading, error }
}
