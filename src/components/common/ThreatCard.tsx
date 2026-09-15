import { ShieldAlert, KeyRound, Fingerprint, FileKey2, Braces, Lock, Database, MessageSquareWarning, EyeOff, Bug, Lightbulb } from 'lucide-react'
import { Finding } from '../../mocks/data'
const iconMap: Record<string, any> = {
  'PII': Fingerprint, 'Credentials': KeyRound, 'Credentials and Secrets': KeyRound, 'API Keys': Braces, 'Passwords': Lock, 'JWT Tokens': FileKey2, 'Private Keys': FileKey2, 'Database Secrets': Database, 'Prompt Injection': MessageSquareWarning, 'System Prompt Extraction': EyeOff, 'Suspicious Instructions': Bug,
}
export function ThreatCard({ finding, onClick, active }: { finding: Finding; onClick?:()=>void; active?:boolean }){
  const Icon = iconMap[finding.category] || ShieldAlert
  const sevColor:Record<string,string> = { Low:'text-emerald-600 bg-emerald-50 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-300 dark:border-emerald-500/20', Medium:'text-amber-600 bg-amber-50 border-amber-200 dark:bg-amber-500/10 dark:text-amber-300 dark:border-amber-500/20', High:'text-orange-600 bg-orange-50 border-orange-200 dark:bg-orange-500/10 dark:text-orange-300 dark:border-orange-500/20', Critical:'text-red-600 bg-red-50 border-red-200 dark:bg-red-500/10 dark:text-red-300 dark:border-red-500/20' }
  return (
    <button onClick={onClick} className={`w-full text-left rounded-xl border p-4 flex gap-3 hover:shadow-sm transition ${active ? 'bg-slate-900 text-white border-slate-900 dark:bg-white dark:text-slate-900' : 'bg-white dark:bg-[#0f1720] border-slate-200 dark:border-[#223041]'}`}>
      <div className={`w-9 h-9 rounded-xl grid place-items-center border shrink-0 ${active ? 'bg-white/10 border-white/20 text-white dark:bg-slate-900 dark:text-white' : sevColor[finding.severity]}`}>
        <Icon className="w-4.5 h-4.5"/>
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className={`text-xs font-bold tracking-wide ${active ? 'text-white dark:text-slate-900' : 'text-slate-900 dark:text-white'}`}>{finding.category}</span>
          {!active && <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full border ${sevColor[finding.severity]}`}>{finding.severity}</span>}
          <span className={`text-[11px] ${active ? 'text-white/60 dark:text-slate-500' : 'text-slate-500'}`}>{Math.round(finding.confidence*100)}% • {finding.detector}</span>
        </div>
        <div className={`text-xs mt-1 leading-relaxed ${active ? 'text-white/70 dark:text-slate-600' : 'text-slate-600 dark:text-slate-400'}`}>{finding.explanation}</div>
        <div className={`mt-2 font-mono text-[11px] px-2 py-1 rounded-lg border truncate ${active ? 'bg-white/10 border-white/10 text-white/80 dark:bg-slate-100 dark:text-slate-700 dark:border-slate-200' : 'bg-slate-50 dark:bg-[#0b1218] border-slate-200 dark:border-[#1e2e42] text-slate-700 dark:text-slate-300'}`}>{finding.maskedEvidence}</div>
        {finding.recommendedAction && (
          <div className={`mt-2 flex gap-1.5 items-start text-[11px] ${active ? 'text-emerald-200 dark:text-emerald-700' : 'text-emerald-700 dark:text-emerald-300'}`}><Lightbulb className="w-3 h-3 mt-[1px] shrink-0"/><span>{finding.recommendedAction}</span></div>
        )}
        {(finding.line || finding.location) && <div className={`text-[11px] mt-1.5 ${active ? 'text-white/50 dark:text-slate-500' : 'text-slate-500'}`}>{finding.line ? `Line ${finding.line}` : finding.location} • {finding.detector}</div>}
      </div>
    </button>
  )
}
