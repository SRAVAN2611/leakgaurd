import { createContext, useContext, useState, ReactNode, useCallback } from 'react'
import { X, CheckCircle2, AlertCircle, Info } from 'lucide-react'

type Toast = { id: number; title: string; desc?: string; variant: 'success' | 'error' | 'info' }
const Ctx = createContext<{ push: (t: Omit<Toast,'id'>)=>void } | null>(null)
let idSeq=0

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])
  const push = useCallback((t: Omit<Toast,'id'>) => {
    const id = ++idSeq
    setToasts(s => [...s, { ...t, id }])
    setTimeout(()=> setToasts(s=> s.filter(x=>x.id!==id)), 3500)
  },[])
  return (
    <Ctx.Provider value={{ push }}>
      {children}
      <div className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2 w-[360px] max-w-[92vw]">
        {toasts.map(t=> (
          <div key={t.id} className="flex gap-3 p-4 rounded-xl border shadow-lg bg-white dark:bg-[#151c24] border-slate-200 dark:border-[#223041] backdrop-blur">
            <div className="mt-0.5">{t.variant==='success'?<CheckCircle2 className="w-5 h-5 text-emerald-500"/>: t.variant==='error'?<AlertCircle className="w-5 h-5 text-red-500"/>:<Info className="w-5 h-5 text-sky-500"/>}</div>
            <div className="flex-1 min-w-0">
              <div className="text-[13.5px] font-semibold text-slate-900 dark:text-slate-100 leading-none">{t.title}</div>
              {t.desc && <div className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">{t.desc}</div>}
            </div>
            <button onClick={()=>setToasts(s=>s.filter(x=>x.id!==t.id))} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"><X className="w-4 h-4"/></button>
          </div>
        ))}
      </div>
    </Ctx.Provider>
  )
}
export const useToast = () => {
  const c = useContext(Ctx)
  if(!c) throw new Error('no toast')
  return c
}
