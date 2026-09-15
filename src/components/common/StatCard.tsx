import { LucideIcon } from 'lucide-react'
export function StatCard({ label, value, sub, icon: Icon, trend, tone='slate' }: { label:string; value:string|number; sub?:string; icon: LucideIcon; trend?:string; tone?: string }){
  const toneMap:Record<string,string> = {
    slate:'bg-slate-900 text-white dark:bg-white dark:text-slate-900',
    emerald:'bg-emerald-600 text-white',
    red:'bg-red-600 text-white',
    amber:'bg-amber-500 text-white',
    sky:'bg-sky-600 text-white',
  }
  return (
    <div className="rounded-2xl border bg-white dark:bg-[#0f1720] border-slate-200 dark:border-[#1f2e42] p-5 flex flex-col gap-4">
      <div className="flex items-start justify-between">
        <div className={`w-9 h-9 rounded-xl grid place-items-center ${toneMap[tone] || toneMap.slate}`}><Icon className="w-4.5 h-4.5"/></div>
        {trend && <span className="text-[11px] font-semibold px-2 py-1 rounded-full bg-slate-100 dark:bg-[#1a2a3a] text-slate-600 dark:text-slate-300">{trend}</span>}
      </div>
      <div>
        <div className="text-[11px] font-semibold tracking-widest text-slate-500 dark:text-slate-400 uppercase">{label}</div>
        <div className="text-[28px] font-extrabold tracking-tight text-slate-900 dark:text-white leading-none mt-1">{value}</div>
        {sub && <div className="text-xs text-slate-500 dark:text-slate-400 mt-1.5">{sub}</div>}
      </div>
    </div>
  )
}
