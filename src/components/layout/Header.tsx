import { useLocation, Link } from 'react-router-dom'
import { Menu, Sun, Moon, Monitor, Circle, WifiOff } from 'lucide-react'
import { useEffect, useState } from 'react'
import { healthCheck } from '../../services/scans'

const titles:Record<string,string> = {
  '/': 'Security Overview',
  '/scanner/text':'Text Scanner',
  '/scanner/code':'Code Scanner',
  '/scanner/image':'Image Scanner',
  '/history':'Scan History',
  '/threats':'Threat Explorer',
  '/policies':'Policies',
  '/analytics':'Analytics',
  '/settings':'Settings',
}

export function Header({ onOpenMobile, resolved, toggleTheme, theme, setTheme }: any){
  const loc = useLocation()
  const title = titles[loc.pathname] || (loc.pathname.startsWith('/history/') ? 'Scan Details' : 'LeakGuard AI')
  const [health, setHealth] = useState<'ok'|'mock'|'down'|'checking'>('checking')
  const [latency, setLatency] = useState<number| null>(null)

  const check = async ()=>{
    setHealth('checking')
    try{
      const h = await healthCheck()
      if(h.status==='mock') setHealth('mock')
      else setHealth(h.status==='ok' ? 'ok':'down')
      setLatency(h.latencyMs)
    }catch{ setHealth('down') }
  }
  useEffect(()=>{ check(); const id=setInterval(check, 30000); return ()=>clearInterval(id)},[])

  return (
    <header className="h-[64px] sticky top-0 z-20 backdrop-blur bg-white/80 dark:bg-[#0b1218]/80 border-b border-slate-200 dark:border-[#162435] flex items-center gap-3 px-4 md:px-6">
      <button onClick={onOpenMobile} className="lg:hidden w-9 h-9 grid place-items-center rounded-xl border border-slate-200 dark:border-[#1e2e42] bg-white dark:bg-[#0f1720]">
        <Menu className="w-5 h-5"/>
      </button>
      <div className="min-w-0">
        <div className="text-[13px] font-semibold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
          {title}
          {loc.pathname.startsWith('/history/') && <Link to="/history" className="text-slate-400 font-normal hover:text-slate-600">/ Scan Details</Link>}
        </div>
        <div className="hidden sm:flex items-center gap-2 text-[11px] text-slate-500">
          <span>Workspace</span><span className="w-1 h-1 rounded-full bg-slate-300"/><span className="font-medium text-slate-700 dark:text-slate-300">Production • us-east-1</span>
        </div>
      </div>
      <div className="flex-1"/>
      <button onClick={check} className={`hidden sm:inline-flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-medium ${health==='ok' ? 'bg-emerald-50 border-emerald-200 text-emerald-700 dark:bg-emerald-500/10 dark:border-emerald-500/20 dark:text-emerald-300' : health==='mock' ? 'bg-amber-50 border-amber-200 text-amber-700 dark:bg-amber-500/10 dark:border-amber-500/20 dark:text-amber-300' : health==='down' ? 'bg-red-50 border-red-200 text-red-700 dark:bg-red-500/10 dark:border-red-500/20 dark:text-red-300' : 'bg-slate-50 border-slate-200 text-slate-600 dark:bg-[#12202f] dark:border-[#1e2e42] dark:text-slate-400'}`}>
        {health==='ok' ? <Circle className="w-2 h-2 fill-emerald-500 text-emerald-500"/> : health==='mock' ? <Circle className="w-2 h-2 fill-amber-500 text-amber-500"/> : health==='down' ? <WifiOff className="w-3.5 h-3.5"/> : <Circle className="w-2 h-2 fill-amber-500 text-amber-500 animate-pulse"/>}
        {health==='ok' ? `API Connected${latency?` • ${latency}ms`:''}` : health==='mock' ? `Mock Engine • ${latency}ms` : health==='down' ? 'API Disconnected • Retry' : 'Checking...'}
      </button>
      <div className="flex items-center gap-1.5 p-1 rounded-full border bg-slate-100 dark:bg-[#12202f] border-slate-200 dark:border-[#1e2e42]">
        <button onClick={()=>setTheme('light')} aria-label="Light mode" title="Light mode" className={`w-7 h-7 rounded-full grid place-items-center ${theme==='light' ? 'bg-white dark:bg-white text-amber-500 shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700'}`}><Sun className="w-4 h-4"/></button>
        <button onClick={()=>setTheme('dark')} aria-label="Dark mode" title="Dark mode" className={`w-7 h-7 rounded-full grid place-items-center ${theme==='dark' ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700'}`}><Moon className="w-4 h-4"/></button>
        <button onClick={()=>setTheme('system')} aria-label="System theme" title="System" className={`w-7 h-7 rounded-full grid place-items-center ${theme==='system' ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm border border-slate-200 dark:border-transparent' : 'text-slate-500 dark:text-slate-400'}`}><Monitor className="w-3.5 h-3.5"/></button>
        <span className="hidden sm:inline text-[11px] font-semibold px-1 pr-2 text-slate-600 dark:text-slate-300">{resolved==='dark' ? 'Dark' : 'Light'}</span>
      </div>
      <div className="hidden md:flex items-center gap-3 pl-3 ml-1 border-l border-slate-200 dark:border-[#1e2e42]">
        <img src="https://i.pravatar.cc/100?img=32" alt="User" className="w-8 h-8 rounded-full object-cover"/>
        <div className="hidden lg:block leading-tight">
          <div className="text-xs font-semibold text-slate-900 dark:text-white">Alex Morgan</div>
          <div className="text-[11px] text-slate-500">Security Admin</div>
        </div>
      </div>
    </header>
  )
}
