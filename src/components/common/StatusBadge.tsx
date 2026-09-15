import { CheckCircle2, AlertTriangle, Eraser, Ban } from 'lucide-react'
export function StatusBadge({ decision }: { decision: string }){
  const map: Record<string, { cls:string; icon:any; label:string }> = {
    ALLOW: { cls:'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-300 dark:border-emerald-500/20', icon: CheckCircle2, label:'ALLOW' },
    WARN: { cls:'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-500/10 dark:text-amber-300 dark:border-amber-500/20', icon: AlertTriangle, label:'WARN' },
    REDACT:{ cls:'bg-sky-50 text-sky-700 border-sky-200 dark:bg-sky-500/10 dark:text-sky-300 dark:border-sky-500/20', icon: Eraser, label:'REDACT' },
    BLOCK:{ cls:'bg-red-50 text-red-700 border-red-200 dark:bg-red-500/10 dark:text-red-300 dark:border-red-500/20', icon: Ban, label:'BLOCK' },
  }
  const m = map[decision] || { cls:'bg-slate-50 text-slate-700 border-slate-200', icon: AlertTriangle, label: decision }
  const Icon=m.icon
  return <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[11px] font-bold tracking-widest ${m.cls}`}><Icon className="w-3.5 h-3.5"/>{m.label}</span>
}
