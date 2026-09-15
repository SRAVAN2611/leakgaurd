import { Scan } from '../mocks/data'

const SCANS_KEY = 'lg-scans-v2'
const POLICIES_KEY = 'lg-policies-v2'
const SETTINGS_KEY = 'lg-settings-v2'
const API_BASE_KEY = 'lg-api-base'

export type AppSettings = {
  pii: boolean
  secrets: boolean
  injection: boolean
  ocr: boolean
  sensitivity: number
  strictMode: boolean
  autoRedactLow: boolean
  alwaysMaskEvidence: boolean
  retainOriginal: boolean
  extendedRetention: boolean
  retentionDays: number
  notifyScanComplete: boolean
  notifyBlocked: boolean
  compactDensity: boolean
}

export const defaultSettings: AppSettings = {
  pii: true,
  secrets: true,
  injection: true,
  ocr: true,
  sensitivity: 70,
  strictMode: false,
  autoRedactLow: false,
  alwaysMaskEvidence: true,
  retainOriginal: true,
  extendedRetention: false,
  retentionDays: 7,
  notifyScanComplete: true,
  notifyBlocked: true,
  compactDensity: false,
}

export function loadSettings(): AppSettings {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY)
    if (raw) return { ...defaultSettings, ...JSON.parse(raw) }
    const legacy = localStorage.getItem('lg-prefs')
    if (legacy) return { ...defaultSettings, ...JSON.parse(legacy) }
  } catch {}
  return { ...defaultSettings }
}
export function saveSettings(s: AppSettings) {
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(s))
  // also keep legacy key for Settings page backwards compat
  localStorage.setItem('lg-prefs', JSON.stringify(s))
}

export function getApiBaseOverride(): string | null {
  try { return localStorage.getItem(API_BASE_KEY) } catch { return null }
}
export function setApiBaseOverride(v: string) {
  if (v) localStorage.setItem(API_BASE_KEY, v)
  else localStorage.removeItem(API_BASE_KEY)
}

export function loadScansSeed(seed: Scan[]): Scan[] {
  try {
    const raw = localStorage.getItem(SCANS_KEY)
    if (raw) {
      const parsed = JSON.parse(raw) as Scan[]
      if (Array.isArray(parsed) && parsed.length) return parsed
    }
  } catch {}
  // seed if empty
  saveScans(seed)
  return seed
}
export function saveScans(scans: Scan[]) {
  try { localStorage.setItem(SCANS_KEY, JSON.stringify(scans)) } catch {}
  // notify listeners
  window.dispatchEvent(new CustomEvent('lg-scans-updated'))
}
export function addScanToStore(scan: Scan) {
  const current = loadScansSeed([])
  const next = [scan, ...current]
  // retention
  const settings = loadSettings()
  const maxAgeMs = (settings.extendedRetention ? 30 : settings.retentionDays) * 86400000
  const cutoff = Date.now() - maxAgeMs
  const filtered = next.filter(s => new Date(s.timestamp).getTime() >= cutoff)
  // keep at most 500 for performance
  const trimmed = filtered.slice(0, 500)
  saveScans(trimmed)
}

export function loadPoliciesSeed<T>(seed: T[]): T[] {
  try {
    const raw = localStorage.getItem(POLICIES_KEY)
    if (raw) {
      const parsed = JSON.parse(raw) as T[]
      if (Array.isArray(parsed) && parsed.length) return parsed
    }
  } catch {}
  savePolicies(seed as any)
  return seed
}
export function savePolicies(policies: any[]) {
  try { localStorage.setItem(POLICIES_KEY, JSON.stringify(policies)) } catch {}
  window.dispatchEvent(new CustomEvent('lg-policies-updated'))
}
