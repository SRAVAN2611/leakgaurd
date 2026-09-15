import { getRiskLevel } from '../../constants'
export function RiskBadge({ score, size='sm' }: { score:number; size?: 'sm'|'md'|'lg' }){
  const lvl = getRiskLevel(score)
  const pad = size==='lg' ? 'px-3 py-1 text-sm' : size==='md' ? 'px-2.5 py-1 text-xs' : 'px-2 py-0.5 text-[11px]'
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border font-semibold tracking-wide ${lvl.bg} ${lvl.text} ${lvl.border} ${pad}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${lvl.dot}`} />
      {lvl.label} • {score}
    </span>
  )
}
