import { createContext, useContext, useEffect, useState, ReactNode } from 'react'

type Theme = 'light' | 'dark' | 'system'
type Resolved = 'light' | 'dark'

interface ThemeCtx {
  theme: Theme
  resolved: Resolved
  setTheme: (t: Theme) => void
  toggle: () => void
}
const Ctx = createContext<ThemeCtx>({ theme: 'light', resolved: 'light', setTheme: () => {}, toggle: () => {} })

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<Theme>(() => (localStorage.getItem('lg-theme') as Theme) || 'light')
  const [resolved, setResolved] = useState<Resolved>('light')

  const apply = (t: Theme) => {
    const sysDark = window.matchMedia('(prefers-color-scheme: dark)').matches
    const r: Resolved = t === 'system' ? (sysDark ? 'dark' : 'light') : t
    setResolved(r)
    document.documentElement.classList.toggle('dark', r === 'dark')
    document.documentElement.style.colorScheme = r
  }

  useEffect(() => {
    apply(theme)
    const m = window.matchMedia('(prefers-color-scheme: dark)')
    const handler = () => theme === 'system' && apply('system')
    m.addEventListener('change', handler)
    return () => m.removeEventListener('change', handler)
  }, [theme])

  const setTheme = (t: Theme) => {
    localStorage.setItem('lg-theme', t)
    setThemeState(t)
    apply(t)
  }
  const toggle = () => setTheme(resolved === 'dark' ? 'light' : 'dark')

  return <Ctx.Provider value={{ theme, resolved, setTheme, toggle }}>{children}</Ctx.Provider>
}
export const useTheme = () => useContext(Ctx)
