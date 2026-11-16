import axios from 'axios'

function getBaseURL(): string {
  try {
    const override = typeof window !== 'undefined' ? localStorage.getItem('lg-api-base') : null
    if (override && override.trim()) return override.trim()
  } catch (err) {
    void err
  }
  return (import.meta.env.VITE_API_BASE_URL as string) || 'http://127.0.0.1:8000/api/v1'
}

export function getApiBase(): string {
  return getBaseURL()
}

const baseURL = getBaseURL()
const useMockEnv = import.meta.env.VITE_USE_MOCK_DATA === 'true'

export const api = axios.create({
  baseURL: baseURL || undefined,
  timeout: 60000,
  headers: { 'Content-Type': 'application/json' }
})

api.interceptors.request.use(cfg => {
  const current = getBaseURL()
  if (current) cfg.baseURL = current
  const token = (() => { try { return localStorage.getItem('lg-token') } catch { return null } })()
  if (token) cfg.headers.Authorization = `Bearer ${token}`
  return cfg
})

export const isMockMode = (): boolean => {
  return useMockEnv
}

export type ApiState<T> = { data: T | null; loading: boolean; error: string | null; disconnected: boolean }
