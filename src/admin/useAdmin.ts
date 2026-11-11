import { useEffect, useRef, useState, useCallback } from 'react'
import {
  collection, query, orderBy, onSnapshot, doc, getDoc,
  updateDoc, deleteDoc, serverTimestamp, limit, startAfter,
  getDocs, where, type DocumentSnapshot,
} from 'firebase/firestore'
import { db } from '../firebase'
import { registrationFromDoc, type RegistrationModel, type PaymentData } from './types'

// ── Real-time list ──
export function useRegistrations() {
  const [items, setItems] = useState<RegistrationModel[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const q = query(collection(db, 'registrations'), orderBy('created_at', 'desc'), limit(200))
    return onSnapshot(q, (snap) => {
      setItems(snap.docs.map((d) => registrationFromDoc(d.id, d.data())))
      setLoading(false)
    })
  }, [])

  return { items, loading }
}

// ── Single doc ──
export function useRegistration(id: string) {
  const [item, setItem] = useState<RegistrationModel | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!id) return
    return onSnapshot(doc(db, 'registrations', id), (snap) => {
      setItem(snap.exists() ? registrationFromDoc(snap.id, snap.data()) : null)
      setLoading(false)
    })
  }, [id])

  return { item, loading }
}

export async function updateStatus(id: string, status: string) {
  await updateDoc(doc(db, 'registrations', id), { status, updated_at: serverTimestamp() })
}

export async function updatePetugas(id: string, petugas: string) {
  await updateDoc(doc(db, 'registrations', id), { petugas_cabang: petugas, updated_at: serverTimestamp() })
}

export async function updatePayment(id: string, payment: PaymentData) {
  await updateDoc(doc(db, 'registrations', id), {
    payment_data: {
      biaya_bimbingan: payment.biayaBimbingan,
      asf_pendaftaran: payment.asfPendaftaran,
      installments: payment.installments.map((i) => ({
        label: i.label,
        persentase: i.persentase,
        nominal: i.nominal,
        tanggal_jatuh_tempo: i.tanggalJatuhTempo ?? null,
        sudah_bayar: i.sudahBayar,
        tanggal_bayar: i.tanggalBayar ?? null,
      })),
    },
    updated_at: serverTimestamp(),
  })
}

export async function deleteRegistration(id: string) {
  await deleteDoc(doc(db, 'registrations', id))
}
