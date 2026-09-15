import { getRiskLevel, getDecisionMeta } from '../../constants'
import { RiskBadge } from './RiskBadge'
import { StatusBadge } from './StatusBadge'

export function RiskScore({ score, decision, variant='standard' }: { score:number; decision:string; variant?: 'compact'|'standard'|'large' }){
  const lvl = getRiskLevel(score)
  const dm = getDecisionMeta(decision)
  if(variant==='compact') return (
    <div className="flex items-center gap-2">
      <div className="w-10 h-10 rounded-full grid place-items-center text-xs font-bold border" style={{ borderColor: lvl.dot==='bg-emerald-500' ? '#10b981' : lvl.dot==='bg-amber-500' ? '#f59e0b' : lvl.dot==='bg-orange-500' ? '#f97316' : '#ef4444', color: lvl.dot==='bg-emerald-500' ? '#059669' : lvl.dot==='bg-amber-500' ? '#d97706' : lvl.dot==='bg-orange-500' ? '#ea580c' : '#dc2626', background: 'var(--risk-bg)' }}>
        {score}
      </div>
      <div className="text-xs leading-tight">
        <div className="font-semibold text-slate-900 dark:text-slate-100">{lvl.label}</div>
        <div className="text-slate-500">{dm.desc}</div>
      </div>
    </div>
  )
  if(variant==='large') return (
    <div className="flex gap-4 items-center p-5 rounded-2xl border bg-white dark:bg-[#101820] border-slate-200 dark:border-[#223041]">
      <div className="relative w-[96px] h-[96px] shrink-0 grid place-items-center">
        <svg width="96" height="96" viewBox="0 0 96 96" className="absolute inset-0 -rotate-90">
          <circle cx="48" cy="48" r="40" fill="none" stroke="currentColor" className="text-slate-100 dark:text-[#1e2e42]" strokeWidth="8"/>
          <circle cx="48" cy="48" r="40" fill="none" stroke={lvl.dot==='bg-emerald-500' ? '#10b981' : lvl.dot==='bg-amber-500' ? '#f59e0b' : lvl.dot==='bg-orange-500' ? '#f97316' : '#ef4444'} strokeWidth="8" strokeLinecap="round" strokeDasharray={`${(score/100)*251} 251`} />
        </svg>
        <div className="text-center">
          <div className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white">{score}</div>
          <div className={`text-[10px] font-bold tracking-widest ${lvl.text}`}>{lvl.label.toUpperCase()}</div>
        </div>
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-[11px] font-semibold tracking-widest text-slate-400 uppercase">Risk evaluation</div>
        <div className="text-[15px] font-semibold text-slate-900 dark:text-white mt-1">{dm.desc}</div>
        <div className="mt-2 flex gap-2"><RiskBadge score={score} size="md"/><StatusBadge decision={decision}/></div>
      </div>
    </div>
  )
  return (
    <div className="flex items-center gap-3 p-4 rounded-xl border bg-white dark:bg-[#0f1720] border-slate-200 dark:border-[#223041]">
      <div className="w-12 h-12 rounded-full grid place-items-center font-bold border text-slate-900 dark:text-white" style={{ borderColor: lvl.dot==='bg-emerald-500' ? '#10b981' : lvl.dot==='bg-amber-500' ? '#f59e0b' : lvl.dot==='bg-orange-500' ? '#f97316' : '#ef4444' }}>{score}</div>
      <div className="flex-1">
        <div className="text-sm font-semibold text-slate-900 dark:text-white flex items-center gap-2">{lvl.label} <span className="text-slate-400 font-normal">• {decision}</span></div>
        <div className="text-xs text-slate-500">{dm.desc}</div>
      </div>
      <StatusBadge decision={decision}/>
    </div>
  )
}
