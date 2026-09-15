import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { getScanById } from '../services/scans'
import { Scan } from '../mocks/data'
import { StatusBadge } from '../components/common/StatusBadge'
import { UnifiedScanResult } from '../components/common/UnifiedScanResult'
import { ErrorState } from '../components/common/EmptyState'
import { ArrowLeft, Clock } from 'lucide-react'

export default function ScanDetails(){
  const { scanId } = useParams()
  const [scan, setScan] = useState<Scan|null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string|null>(null)

  const reload = ()=>{
    if(!scanId) return
    setLoading(true); setError(null)
    getScanById(scanId).then(s=>{
      if(!s) setError('Scan not found')
      else setScan(s)
    }).catch(e=> setError(e.message)).finally(()=> setLoading(false))
  }

  useEffect(()=>{
    if(!scanId) return
    let active = true
    getScanById(scanId).then(s=>{
      if(!active) return
      if(!s) setError('Scan not found')
      else setScan(s)
      setLoading(false)
    }).catch(e=>{
      if(!active) return
      setError(e.message)
      setLoading(false)
    })
    return ()=>{ active = false }
  }, [scanId])
  if(loading) return <div className="space-y-3"><div className="h-32 rounded-2xl bg-slate-100 dark:bg-[#0b1218] animate-pulse"/><div className="h-64 rounded-2xl bg-slate-100 dark:bg-[#0b1218] animate-pulse"/></div>
  if(error) return <ErrorState message={error} onRetry={reload}/>
  if(!scan) return null
  return (
    <div className="space-y-6">
      <Link to="/history" className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"><ArrowLeft className="w-4 h-4"/>Back to history</Link>
      <div className="rounded-2xl border bg-white dark:bg-[#0f1720] border-slate-200 dark:border-[#1f2e42] p-5">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="text-xs font-bold tracking-widest text-slate-500 uppercase">Scan ID</div>
            <div className="text-lg font-mono font-bold text-slate-900 dark:text-white">{scan.id.toUpperCase()}</div>
            <div className="text-xs text-slate-500 mt-1 flex items-center gap-2"><Clock className="w-3.5 h-3.5"/>{new Date(scan.timestamp).toLocaleString()} • {scan.inputType} • {scan.source} • {scan.processingTimeMs}ms</div>
          </div>
          <div className="flex items-center gap-2"><StatusBadge decision={scan.decision}/></div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-5">
          {[{k:'Input Type',v:scan.inputType},{k:'Source',v:scan.source},{k:'Threats',v:String(scan.threatCount)},{k:'Decision',v:scan.decision}].map(i=> (
            <div key={i.k} className="rounded-xl bg-slate-50 dark:bg-[#0b1218] border border-slate-200 dark:border-[#1e2e42] p-3">
              <div className="text-[11px] font-bold tracking-widest text-slate-500 uppercase">{i.k}</div>
              <div className="text-sm font-semibold text-slate-900 dark:text-white mt-1">{i.v}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        <div className="lg:col-span-2 space-y-4">
          <UnifiedScanResult scan={scan} />
          {scan.imageUrl && (
            <div className="rounded-2xl border bg-white dark:bg-[#0f1720] border-slate-200 dark:border-[#1f2e42] p-4">
              <div className="text-sm font-semibold text-slate-900 dark:text-white mb-3">Image Preview</div>
              <img src={scan.imageUrl} alt="Scan" className="w-full max-h-[360px] object-contain rounded-xl border border-slate-200 dark:border-[#1e2e42] bg-slate-50 dark:bg-[#0b1218]"/>
            </div>
          )}
        </div>
        <div className="space-y-4">
          <div className="rounded-2xl border bg-white dark:bg-[#0f1720] border-slate-200 dark:border-[#1f2e42] p-4">
            <div className="text-xs font-bold tracking-widest text-slate-500 uppercase mb-3">Gateway Scan Details</div>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between py-1 border-b border-slate-100 dark:border-[#162435]"><span className="text-slate-500">Scan ID</span><span className="font-mono font-bold text-slate-900 dark:text-white">{scan.id}</span></div>
              <div className="flex justify-between py-1 border-b border-slate-100 dark:border-[#162435]"><span className="text-slate-500">Input Type</span><span className="font-semibold text-slate-900 dark:text-white">{scan.inputType}</span></div>
              <div className="flex justify-between py-1 border-b border-slate-100 dark:border-[#162435]"><span className="text-slate-500">Source</span><span className="font-semibold text-slate-900 dark:text-white">{scan.source}</span></div>
              <div className="flex justify-between py-1 border-b border-slate-100 dark:border-[#162435]"><span className="text-slate-500">Processing Time</span><span className="font-semibold text-slate-900 dark:text-white">{scan.processingTimeMs}ms</span></div>
              <div className="flex justify-between py-1 border-b border-slate-100 dark:border-[#162435]"><span className="text-slate-500">Risk Score</span><span className="font-semibold text-slate-900 dark:text-white">{scan.riskScore} / 100 ({scan.severity})</span></div>
              <div className="flex justify-between py-1"><span className="text-slate-500">Decision</span><span className="font-bold text-slate-900 dark:text-white">{scan.decision}</span></div>
            </div>
          </div>

          <div className="rounded-2xl border bg-white dark:bg-[#0f1720] border-slate-200 dark:border-[#1f2e42] p-4">
            <div className="text-xs font-bold tracking-widest text-slate-500 uppercase">Pipeline Timeline</div>
            <div className="mt-3 space-y-2.5 text-xs">
              <div className="flex gap-3"><span className="w-2 h-2 rounded-full bg-slate-900 dark:bg-white mt-1 shrink-0"/><div><span className="font-semibold text-slate-900 dark:text-white">1. USER INPUT</span><span className="block text-slate-500">Received {scan.inputType} via {scan.source}</span></div></div>
              <div className="flex gap-3"><span className="w-2 h-2 rounded-full bg-sky-500 mt-1 shrink-0"/><div><span className="font-semibold text-slate-900 dark:text-white">2. SECURITY ANALYSIS</span><span className="block text-slate-500">{scan.processingTimeMs}ms execution engine pass</span></div></div>
              <div className="flex gap-3"><span className="w-2 h-2 rounded-full bg-amber-500 mt-1 shrink-0"/><div><span className="font-semibold text-slate-900 dark:text-white">3. THREAT DETECTION</span><span className="block text-slate-500">{scan.threatCount} finding(s) identified</span></div></div>
              <div className="flex gap-3"><span className="w-2 h-2 rounded-full bg-violet-500 mt-1 shrink-0"/><div><span className="font-semibold text-slate-900 dark:text-white">4. RISK EVALUATION</span><span className="block text-slate-500">Risk Score {scan.riskScore} ({scan.severity})</span></div></div>
              <div className="flex gap-3"><span className="w-2 h-2 rounded-full bg-emerald-500 mt-1 shrink-0"/><div><span className="font-semibold text-slate-900 dark:text-white">5. POLICY EVALUATION</span><span className="block text-slate-500">Precedence decision: {scan.decision}</span></div></div>
              <div className="flex gap-3"><span className="w-2 h-2 rounded-full bg-slate-400 mt-1 shrink-0"/><div><span className="font-semibold text-slate-900 dark:text-white">6. SANITIZATION</span><span className="block text-slate-500">{scan.decision === 'BLOCK' ? 'Blocked & logged' : 'Sanitized & safe for LLM'}</span></div></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
