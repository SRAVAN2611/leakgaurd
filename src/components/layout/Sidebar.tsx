import { NavLink, useLocation } from 'react-router-dom'
import { LayoutDashboard, FileText, Code2, Image as ImageIcon, History, Radar, ShieldCheck, BarChart3, Settings, ChevronLeft, ChevronRight, X, Shield } from 'lucide-react'

const nav = [
  { label:'Overview', to:'/', icon: LayoutDashboard },
  { section:'Security Analysis' },
  { label:'Text Scanner', to:'/scanner/text', icon: FileText },
  { label:'Code Scanner', to:'/scanner/code', icon: Code2 },
  { label:'Image Scanner', to:'/scanner/image', icon: ImageIcon },
  { section:'Security Operations' },
  { label:'Scan History', to:'/history', icon: History },
  { label:'Threat Explorer', to:'/threats', icon: Radar },
  { section:'Management' },
  { label:'Policies', to:'/policies', icon: ShieldCheck },
  { label:'Analytics', to:'/analytics', icon: BarChart3 },
  { label:'Settings', to:'/settings', icon: Settings },
]

export function Sidebar({ collapsed, onToggle, mobileOpen, onCloseMobile }: { collapsed:boolean; onToggle:()=>void; mobileOpen:boolean; onCloseMobile:()=>void }){
  const loc = useLocation()
  const width = collapsed ? 'w-[72px]' : 'w-[264px]'
  return (
    <>
      {/* desktop */}
      <aside className={`hidden lg:flex shrink-0 ${width} transition-all duration-300 border-r bg-white dark:bg-[#0b1218] border-slate-200 dark:border-[#162435] flex-col sticky top-0 h-screen overflow-hidden`}>
        <div className="h-[64px] flex items-center gap-3 px-4 border-b border-slate-200 dark:border-[#162435] shrink-0">
          <div className="w-9 h-9 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 grid place-items-center shrink-0"><Shield className="w-5 h-5"/></div>
          {!collapsed && (
            <div className="min-w-0">
              <div className="text-[13.5px] font-extrabold tracking-tight leading-none text-slate-900 dark:text-white">LeakGuard AI</div>
              <div className="text-[11px] font-medium tracking-wide text-slate-500 dark:text-slate-400">Pre-LLM Security Gateway</div>
            </div>
          )}
        </div>
        <nav className="flex-1 overflow-y-auto py-4 px-2 space-y-1">
          {nav.map((item:any, idx)=> item.section ? (
            !collapsed ? <div key={idx} className="px-3 pt-4 pb-1 text-[10px] font-bold tracking-widest text-slate-400 uppercase">{item.section}</div> : <div key={idx} className="h-4"/>
          ) : (
            <NavLink key={item.to} to={item.to} className={({isActive})=> `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition ${collapsed?'justify-center':''} ${isActive ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-sm' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-[#12202f] hover:text-slate-900 dark:hover:text-white'}` }>
              <item.icon className="w-[18px] h-[18px] shrink-0"/>
              {!collapsed && <span className="truncate">{item.label}</span>}
            </NavLink>
          ))}
        </nav>
        <div className="p-3 border-t border-slate-200 dark:border-[#162435] flex items-center justify-between">
          {!collapsed && <div className="text-[11px] text-slate-500 leading-tight">Enterprise<br/><span className="font-semibold text-slate-700 dark:text-slate-300">v2.4.1 • SOC2 Ready</span></div>}
          <button onClick={onToggle} aria-label={collapsed? 'Expand sidebar':'Collapse sidebar'} className="w-8 h-8 rounded-xl border bg-white dark:bg-[#12202f] border-slate-200 dark:border-[#1e2e42] grid place-items-center hover:bg-slate-50 dark:hover:bg-[#162435]">
            {collapsed ? <ChevronRight className="w-4 h-4"/> : <ChevronLeft className="w-4 h-4"/>}
          </button>
        </div>
      </aside>
      {/* mobile drawer */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-40 flex">
          <div className="flex-1 bg-black/40 backdrop-blur-sm" onClick={onCloseMobile}/>
          <div className="w-[280px] bg-white dark:bg-[#0b1218] border-r border-slate-200 dark:border-[#162435] flex flex-col h-full shadow-2xl">
            <div className="h-[64px] flex items-center justify-between px-4 border-b border-slate-200 dark:border-[#162435]">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 grid place-items-center"><Shield className="w-5 h-5"/></div>
                <div>
                  <div className="text-[13.5px] font-extrabold leading-none text-slate-900 dark:text-white">LeakGuard AI</div>
                  <div className="text-[11px] text-slate-500">Pre-LLM Security Gateway</div>
                </div>
              </div>
              <button onClick={onCloseMobile} className="w-8 h-8 grid place-items-center rounded-xl hover:bg-slate-100 dark:hover:bg-[#12202f]"><X className="w-5 h-5"/></button>
            </div>
            <nav className="flex-1 overflow-y-auto py-4 px-2 space-y-1">
              {nav.map((item:any, idx)=> item.section ? (
                <div key={idx} className="px-3 pt-4 pb-1 text-[10px] font-bold tracking-widest text-slate-400 uppercase">{item.section}</div>
              ) : (
                <NavLink key={item.to} to={item.to} onClick={onCloseMobile} className={({isActive})=> `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium ${isActive ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-[#12202f]'}`}>
                  <item.icon className="w-[18px] h-[18px]"/>{item.label}
                </NavLink>
              ))}
            </nav>
          </div>
        </div>
      )}
    </>
  )
}
