import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { PageHeader } from '../components/common/PageHeader'
import { RiskBadge } from '../components/common/RiskBadge'
import { StatusBadge } from '../components/common/StatusBadge'
import { EmptyState, ErrorState } from '../components/common/EmptyState'
import { getScans } from '../services/scans'
import { Scan } from '../mocks/data'
import { Search, ChevronLeft, ChevronRight, FileText, Code2, Image as ImageIcon } from 'lucide-react'

export default function ScanHistory(){
  const [scans, setScans] = useState<Scan[]>([])
  const [filtered, setFiltered] = useState<Scan[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string|null>(null)
  const [search, setSearch] = useState('')
  const [inputType, setInputType] = useState('All')
  const [decision, setDecision] = useState('All')
  const [severity, setSeverity] = useState('All')
  const [page, setPage] = useState(1)
  const pageSize = 8

  const load = async ()=>{
    setLoading(true); setError(null)
    try{ const s=await getScans(); setScans(s)}
    catch(e:any){ setError(e.message)}
    finally{ setLoading(false)}
  }
  useEffect(()=>{ load() },[])
  useEffect(()=>{
    let list=[...scans]
    if(search) list=list.filter(s=> s.id.toLowerCase().includes(search.toLowerCase()) || (s.original||'').toLowerCase().includes(search.toLowerCase()))
    if(inputType!=='All') list=list.filter(s=> s.inputType===inputType)
    if(decision!=='All') list=list.filter(s=> s.decision===decision)
    if(severity!=='All') list=list.filter(s=> s.severity===severity)
    setFiltered(list); setPage(1)
  },[scans, search, inputType, decision, severity])

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize))
  const pageData = filtered.slice((page-1)*pageSize, page*pageSize)

  if(loading) return <div className="space-y-3">{Array.from({length:6}).map((_,i)=><div key={i} className="h-14 rounded-xl bg-slate-100 dark:bg-[#0b1218] animate-pulse"/>)}</div>
  if(error) return <ErrorState message={error} onRetry={load}/>

  return (
    <div className="space-y-4">
      <PageHeader title="Scan History" subtitle="Review, filter and audit all security scans"/>
      <div className="rounded-2xl border bg-white dark:bg-[#0f1720] border-slate-200 dark:border-[#1f2e42] p-4 flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 min-w-[220px]">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"/>
          <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search by Scan ID or content" className="w-full pl-10 pr-4 py-2.5 rounded-xl border bg-slate-50 dark:bg-[#0b1218] border-slate-200 dark:border-[#1e2e42] text-sm focus:outline-none focus:ring-2 focus:ring-slate-900/10"/>
        </div>
        <select value={inputType} onChange={e=>setInputType(e.target.value)} className="px-3 py-2.5 rounded-xl border bg-white dark:bg-[#0b1218] border-slate-200 dark:border-[#1e2e42] text-sm font-medium">
          <option>All</option><option>Text</option><option>Code</option><option>Image</option>
        </select>
        <select value={decision} onChange={e=>setDecision(e.target.value)} className="px-3 py-2.5 rounded-xl border bg-white dark:bg-[#0b1218] border-slate-200 dark:border-[#1e2e42] text-sm font-medium">
          <option>All</option><option>ALLOW</option><option>WARN</option><option>REDACT</option><option>BLOCK</option>
        </select>
        <select value={severity} onChange={e=>setSeverity(e.target.value)} className="px-3 py-2.5 rounded-xl border bg-white dark:bg-[#0b1218] border-slate-200 dark:border-[#1e2e42] text-sm font-medium">
          <option>All</option><option>Low</option><option>Medium</option><option>High</option><option>Critical</option>
        </select>
      </div>

      {filtered.length===0 ? (
        <EmptyState title="No matching scans" description="Try adjusting filters or run a new scan." actions={<Link to="/scanner/text" className="px-4 py-2 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-sm font-semibold">Scan Text</Link>}/>
      ) : (
        <>
          <div className="hidden md:block rounded-2xl border bg-white dark:bg-[#0f1720] border-slate-200 dark:border-[#1f2e42] overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-slate-50 dark:bg-[#0b1218] text-[11px] font-bold tracking-widest text-slate-500 uppercase">
                  <tr><th className="text-left px-4 py-3">Scan ID</th><th className="text-left px-4 py-3">Timestamp</th><th className="text-left px-4 py-3">Input Type</th><th className="text-left px-4 py-3">Source</th><th className="text-left px-4 py-3">Threats</th><th className="text-left px-4 py-3">Risk</th><th className="text-left px-4 py-3">Decision</th><th className="text-right px-4 py-3">View</th></tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-[#162435]">
                  {pageData.map(s=> (
                    <tr key={s.id} className="hover:bg-slate-50 dark:hover:bg-[#0b1218]">
                      <td className="px-4 py-3 font-mono text-xs font-semibold text-slate-900 dark:text-white">{s.id.toUpperCase()}</td>
                      <td className="px-4 py-3 text-xs text-slate-600 dark:text-slate-400">{new Date(s.timestamp).toLocaleString()}</td>
                      <td className="px-4 py-3"><span className="inline-flex items-center gap-1.5 text-xs font-medium">{s.inputType==='Text'?<FileText className="w-3.5 h-3.5"/>: s.inputType==='Code'?<Code2 className="w-3.5 h-3.5"/>:<ImageIcon className="w-3.5 h-3.5"/>}{s.inputType}</span></td>
                      <td className="px-4 py-3 text-xs text-slate-600 dark:text-slate-400">{s.source}</td>
                      <td className="px-4 py-3 text-xs font-semibold">{s.threatCount}</td>
                      <td className="px-4 py-3"><RiskBadge score={s.riskScore}/></td>
                      <td className="px-4 py-3"><StatusBadge decision={s.decision}/></td>
                      <td className="px-4 py-3 text-right"><Link to={`/history/${s.id}`} className="inline-flex px-3 py-1.5 rounded-xl border bg-white dark:bg-[#0b1218] border-slate-200 dark:border-[#1e2e42] text-xs font-semibold hover:bg-slate-50">View</Link></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          {/* mobile cards */}
          <div className="md:hidden space-y-3">
            {pageData.map(s=> (
              <Link key={s.id} to={`/history/${s.id}`} className="block rounded-2xl border bg-white dark:bg-[#0f1720] border-slate-200 dark:border-[#1f2e42] p-4">
                <div className="flex items-center justify-between"><span className="font-mono text-xs font-bold text-slate-900 dark:text-white">{s.id.toUpperCase()}</span><StatusBadge decision={s.decision}/></div>
                <div className="text-xs text-slate-500 mt-1">{new Date(s.timestamp).toLocaleString()} • {s.inputType} • {s.threatCount} threats</div>
                <div className="mt-2"><RiskBadge score={s.riskScore}/></div>
              </Link>
            ))}
          </div>
          <div className="flex items-center justify-between">
            <div className="text-xs text-slate-500">Page {page} of {totalPages} • {filtered.length} scans</div>
            <div className="flex items-center gap-2">
              <button disabled={page===1} onClick={()=>setPage(p=>Math.max(1,p-1))} className="w-9 h-9 grid place-items-center rounded-xl border bg-white dark:bg-[#0f1720] border-slate-200 dark:border-[#1e2e42] disabled:opacity-40"><ChevronLeft className="w-4 h-4"/></button>
              <button disabled={page===totalPages} onClick={()=>setPage(p=>Math.min(totalPages,p+1))} className="w-9 h-9 grid place-items-center rounded-xl border bg-white dark:bg-[#0f1720] border-slate-200 dark:border-[#1e2e42] disabled:opacity-40"><ChevronRight className="w-4 h-4"/></button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
