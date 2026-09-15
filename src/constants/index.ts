export const RISK_LEVELS = [
  { label: 'Low', min: 0, max: 24, color: 'emerald', bg: 'bg-emerald-50 dark:bg-emerald-500/10', text: 'text-emerald-700 dark:text-emerald-400', border: 'border-emerald-200 dark:border-emerald-500/20', dot: 'bg-emerald-500' },
  { label: 'Medium', min: 25, max: 49, color: 'amber', bg: 'bg-amber-50 dark:bg-amber-500/10', text: 'text-amber-700 dark:text-amber-400', border: 'border-amber-200 dark:border-amber-500/20', dot: 'bg-amber-500' },
  { label: 'High', min: 50, max: 74, color: 'orange', bg: 'bg-orange-50 dark:bg-orange-500/10', text: 'text-orange-700 dark:text-orange-400', border: 'border-orange-200 dark:border-orange-500/20', dot: 'bg-orange-500' },
  { label: 'Critical', min: 75, max: 100, color: 'red', bg: 'bg-red-50 dark:bg-red-500/10', text: 'text-red-700 dark:text-red-400', border: 'border-red-200 dark:border-red-500/20', dot: 'bg-red-500' },
] as const

export function getRiskLevel(score: number){
  return RISK_LEVELS.find(r=> score>=r.min && score<=r.max) ?? RISK_LEVELS[0]
}
export function getDecisionMeta(decision: string){
  switch(decision){
    case 'ALLOW': return { label: 'Allow', color: 'emerald', icon: 'check', desc: 'Safe to Proceed' }
    case 'WARN': return { label: 'Warn', color: 'amber', icon: 'alert', desc: 'Review Recommended' }
    case 'REDACT': return { label: 'Redact', color: 'sky', icon: 'eraser', desc: 'Sanitization Required' }
    case 'BLOCK': return { label: 'Block', color: 'red', icon: 'ban', desc: 'Blocked by Security Policy' }
    default: return { label: decision, color: 'slate', icon: 'info', desc: decision }
  }
}

export const THREAT_CATEGORIES = [
  'PII','Credentials','API Keys','Passwords','JWT Tokens','Private Keys','Database Secrets','Prompt Injection','System Prompt Extraction','Suspicious Instructions'
]
