import { useState } from 'react'
import { Sidebar } from './Sidebar'
import { Header } from './Header'
import { useTheme } from '../../context/ThemeContext'

export function AppShell({ children }: { children: React.ReactNode }){
  const [collapsed, setCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const { resolved, toggle, theme, setTheme } = useTheme()
  return (
    <div className="min-h-screen bg-[#f6f8fb] dark:bg-[#070c12] text-slate-900 dark:text-slate-100 flex">
      <Sidebar collapsed={collapsed} onToggle={()=>setCollapsed(v=>!v)} mobileOpen={mobileOpen} onCloseMobile={()=>setMobileOpen(false)} />
      <div className="flex-1 min-w-0 flex flex-col">
        <Header collapsed={collapsed} onToggleSidebar={()=>setCollapsed(v=>!v)} onOpenMobile={()=>setMobileOpen(true)} resolved={resolved} toggleTheme={toggle} theme={theme} setTheme={setTheme} />
        <main className="flex-1 p-4 md:p-6 lg:p-7 max-w-[1440px] w-full mx-auto">
          {children}
        </main>
        <footer className="px-6 py-4 text-center text-[11px] text-slate-400 dark:text-slate-500 border-t border-slate-200/60 dark:border-[#1a2a3a]">
          LeakGuard AI • Pre-LLM Security Gateway • Enterprise • Workflows: USER INPUT → ANALYSIS → THREAT DETECTION → RISK EVALUATION → SECURITY DECISION → SANITIZED OUTPUT
        </footer>
      </div>
    </div>
  )
}
