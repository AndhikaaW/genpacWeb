import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import { doc, onSnapshot } from 'firebase/firestore'
import { db } from '../firebase'
import { SITE_CONFIG } from '../lib/config'

export interface AppSettings {
  branch: string
  whatsappNumber: string
  address: string
  mapsEmbedUrl: string
  mapsLink: string
  openingHours: string
  instagram: string
  hqWebsite: string
  buildingImage: string
}

const DEFAULT_SETTINGS: AppSettings = {
  branch: SITE_CONFIG.branch,
  whatsappNumber: SITE_CONFIG.whatsappNumber,
  address: SITE_CONFIG.address,
  mapsEmbedUrl: SITE_CONFIG.mapsEmbedUrl,
  mapsLink: SITE_CONFIG.mapsLink,
  openingHours: SITE_CONFIG.openingHours,
  instagram: SITE_CONFIG.instagram,
  hqWebsite: SITE_CONFIG.hqWebsite,
  buildingImage: '',
}

const AppSettingsContext = createContext<AppSettings>(DEFAULT_SETTINGS)
const AppSettingsLoadingContext = createContext(true)

export function AppSettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState(DEFAULT_SETTINGS)
  const [loading, setLoading] = useState(true)

  useEffect(() => onSnapshot(doc(db, 'app_settings', 'public'), (snapshot) => {
    if (snapshot.exists()) {
      const data = snapshot.data()
      setSettings({
        branch: typeof data.branch === 'string' ? data.branch : DEFAULT_SETTINGS.branch,
        whatsappNumber: typeof data.whatsapp_number === 'string' ? data.whatsapp_number : DEFAULT_SETTINGS.whatsappNumber,
        address: typeof data.address === 'string' ? data.address : DEFAULT_SETTINGS.address,
        mapsEmbedUrl: typeof data.maps_embed_url === 'string' ? data.maps_embed_url : DEFAULT_SETTINGS.mapsEmbedUrl,
        mapsLink: typeof data.maps_link === 'string' ? data.maps_link : DEFAULT_SETTINGS.mapsLink,
        openingHours: typeof data.opening_hours === 'string' ? data.opening_hours : DEFAULT_SETTINGS.openingHours,
        instagram: typeof data.instagram_url === 'string' ? data.instagram_url : DEFAULT_SETTINGS.instagram,
        hqWebsite: typeof data.hq_website === 'string' ? data.hq_website : DEFAULT_SETTINGS.hqWebsite,
        buildingImage: typeof data.building_image === 'string' ? data.building_image : '',
      })
    }
    setLoading(false)
  }, (error) => {
    console.error('Gagal memuat pengaturan aplikasi:', error)
    setLoading(false)
  }), [])

  return <AppSettingsContext.Provider value={settings}><AppSettingsLoadingContext.Provider value={loading}>{children}</AppSettingsLoadingContext.Provider></AppSettingsContext.Provider>
}

export function useAppSettings() {
  return useContext(AppSettingsContext)
}

export function useAppSettingsLoading() {
  return useContext(AppSettingsLoadingContext)
}
