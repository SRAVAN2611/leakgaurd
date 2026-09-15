import { CheckCircle2, AlertTriangle, Eraser, Ban } from 'lucide-react'
export function SecurityDecision({ decision, reason, matched }: { decision: string; reason?: string; matched?: string[] }){
  const cfg:Record<string,{icon:any,title:string,desc:string,cls:string}> = {
    ALLOW:{ icon:CheckCircle2, title:'Safe to Proceed', desc:'No high-risk content detected. Input can be forwarded to the LLM.', cls:'bg-emerald-50 border-emerald-200 text-emerald-800 dark:bg-emerald-500/10 dark:border-emerald-500/20 dark:text-emerald-300' },
    WARN:{ icon:AlertTriangle, title:'Review Recommended', desc:'Potential risks found. Human review is advised before forwarding.', cls:'bg-amber-50 border-amber-200 text-amber-800 dark:bg-amber-500/10 dark:border-amber-500/20 dark:text-amber-300' },
    REDACT:{ icon:Eraser, title:'Sanitization Required', desc:'Sensitive content was redacted. Use the sanitized output instead of the original.', cls:'bg-sky-50 border-sky-200 text-sky-800 dark:bg-sky-500/10 dark:border-sky-500/20 dark:text-sky-300' },
    BLOCK:{ icon:Ban, title:'Blocked by Security Policy', desc:'Critical threats detected. Input must not be sent to external LLMs.', cls:'bg-red-50 border-red-200 text-red-800 dark:bg-red-500/10 dark:border-red-500/20 dark:text-red-300' },
  }
  const c = cfg[decision] || cfg.ALLOW
  const Icon=c.icon
  return (
    <div className={`rounded-2xl border p-4 flex gap-3 ${c.cls}`}>
      <div className="w-9 h-9 rounded-xl bg-white/70 dark:bg-white/10 grid place-items-center shrink-0"><Icon className="w-5 h-5"/></div>
      <div className="flex-1 min-w-0">
        <div className="text-sm font-bold">{c.title}</div>
        <div className="text-xs opacity-80 mt-0.5 leading-relaxed">{c.desc}</div>
        <div className="text-[11px] font-bold tracking-widest mt-2 opacity-60">{decision}</div>
        {reason && <div className="mt-2 text-xs opacity-80 leading-relaxed bg-white/40 dark:bg-black/20 rounded-xl p-2.5 border border-black/5 dark:border-white/10">{reason}</div>}
        {matched && matched.length>0 && <div className="mt-1.5 text-[11px] opacity-60">Matched policies: <span className="font-mono">{matched.join(', ')}</span></div>}
      </div>
    </div>
  )
}
