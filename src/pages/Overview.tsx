import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { PageHeader } from '../components/common/PageHeader'
import { StatCard } from '../components/common/StatCard'
import { RiskBadge } from '../components/common/RiskBadge'
import { StatusBadge } from '../components/common/StatusBadge'
import { EmptyState, ErrorState } from '../components/common/EmptyState'
import { CardSkeleton, Skeleton } from '../components/common/Skeleton'
import { getScans } from '../services/scans'
import { getAnalytics } from '../services/analytics'
import { getPolicies } from '../services/policies'
import { Scan } from '../mocks/data'
import { ShieldAlert, Ban, Activity, ShieldCheck, FileText, Code2, Image as ImageIcon, ArrowUpRight, Calendar } from 'lucide-react'
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar } from 'recharts'

export default function Overview(){
  const [scans, setScans] = useState<Scan[]>([])
  const [analytics, setAnalytics] = useState<any>(null)
  const [policies, setPolicies] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string|null>(null)
  const [range, setRange] = useState('7D')
  const [customFrom, setCustomFrom] = useState('')
  const [customTo, setCustomTo] = useState('')
  const navigate = useNavigate()

  const load = async ()=>{
    setLoading(true); setError(null)
    try{
      const [s, p] = await Promise.all([getScans(), getPolicies()])
      setScans(s)
      setPolicies(p)
      // analytics derived from same scans
      const a = await getAnalytics(range, (range==='Custom' ? { from: customFrom || undefined, to: customTo || undefined } : undefined) as any)
      setAnalytics(a)
    }catch(e:any){ setError(e.message || 'Failed to load overview') }
    finally{ setLoading(false) }
  }
  useEffect(()=>{ load() },[range])
  // also re-load when scans update (event)
  useEffect(()=>{
    const handler = ()=> load()
    window.addEventListener('lg-scans-updated', handler)
    window.addEventListener('lg-policies-updated', handler)
    return ()=>{ window.removeEventListener('lg-scans-updated', handler); window.removeEventListener('lg-policies-updated', handler)}
  },[range, customFrom, customTo])

  const applyCustom = async ()=>{
    setRange('Custom')
    setLoading(true)
    try{
      const [s, p] = await Promise.all([getScans(), getPolicies()])
      setScans(s); setPolicies(p)
      const a = await getAnalytics('Custom', { from: customFrom || undefined, to: customTo || undefined } as any)
      setAnalytics(a)
    } finally { setLoading(false)}
  }

  if(loading) return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <CardSkeleton/><CardSkeleton/><CardSkeleton/><CardSkeleton/>
      </div>
      <Skeleton className="h-[320px] w-full"/>
    </div>
  )
  if(error) return <ErrorState message={error} onRetry={load}/>
  if(scans.length===0) return (
    <div>
      <PageHeader title="Security Overview" subtitle="Monitor AI input security and protection activity"/>
      <EmptyState icon={ShieldAlert} title="No scans yet" description="Start protecting your AI inputs. Run your first security scan to see activity here." actions={
        <>
          <Link to="/scanner/text" className="px-4 py-2 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-sm font-semibold">Scan Text</Link>
          <Link to="/scanner/code" className="px-4 py-2 rounded-xl border bg-white dark:bg-[#0f1720] text-sm font-semibold">Scan Code</Link>
          <Link to="/scanner/image" className="px-4 py-2 rounded-xl border bg-white dark:bg-[#0f1720] text-sm font-semibold">Scan Image</Link>
        </>
      }/>
    </div>
  )

  const blocked = scans.filter(s=>s.decision==='BLOCK').length
  const high = scans.filter(s=> s.severity==='High' || s.severity==='Critical').length
  const recent = scans.slice(0,6)

  return (
    <div className="space-y-6">
      <PageHeader title="Security Overview" subtitle="Monitor AI input security and protection activity" actions={
        <div className="flex items-center gap-2">
          <Link to="/scanner/text" className="hidden sm:inline-flex px-4 py-2 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-sm font-semibold hover:opacity-90">New Scan</Link>
          <Link to="/history" className="px-4 py-2 rounded-xl border bg-white dark:bg-[#0f1720] border-slate-200 dark:border-[#223041] text-sm font-semibold">View History</Link>
        </div>
      }/>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total Scans" value={scans.length} sub="All input types" icon={Activity} trend={`${analytics?.trend?.reduce((a:number,b:any)=>a+b.scans,0) ?? scans.length} in range`} tone="slate"/>
        <StatCard label="Blocked Inputs" value={blocked} sub={`${scans.length?((blocked/scans.length)*100).toFixed(0):0}% of scans`} icon={Ban} tone="red"/>
        <StatCard label="High/Critical Threats" value={high} sub="High + Critical severity" icon={ShieldAlert} tone="amber"/>
        <StatCard label="Active Policies" value={policies.filter(p=>p.enabled).length} sub={`${policies.length} total policies`} icon={ShieldCheck} tone="sky"/>
      </div>

      {/* range controls */}
      <div className="flex flex-wrap items-center gap-2">
        <div className="flex items-center gap-1 p-1 rounded-full bg-slate-100 dark:bg-[#12202f] border border-slate-200 dark:border-[#1e2e42]">
          {['24H','7D','30D','90D','Custom'].map(r=> (
            <button key={r} onClick={()=> r==='Custom' ? null : setRange(r)} className={`px-3 py-1 rounded-full text-xs font-semibold ${range===r ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow' : 'text-slate-600 dark:text-slate-400'}`}>{r}</button>
          ))}
        </div>
        <div className="flex items-center gap-2 ml-1">
          <div className="relative">
            <Calendar className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400"/>
            <input type="date" value={customFrom} onChange={e=>setCustomFrom(e.target.value)} className="pl-8 pr-2 py-1.5 rounded-xl border bg-white dark:bg-[#0f1720] border-slate-200 dark:border-[#1e2e42] text-xs"/>
          </div>
          <span className="text-xs text-slate-400">to</span>
          <input type="date" value={customTo} onChange={e=>setCustomTo(e.target.value)} className="px-2 py-1.5 rounded-xl border bg-white dark:bg-[#0f1720] border-slate-200 dark:border-[#1e2e42] text-xs"/>
          <button onClick={applyCustom} className="px-3 py-1.5 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-xs font-semibold">Apply</button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 rounded-2xl border bg-white dark:bg-[#0f1720] border-slate-200 dark:border-[#1f2e42] p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="text-sm font-semibold text-slate-900 dark:text-white">Scans Over Time</div>
            <div className="text-[11px] text-slate-500">{range} • {analytics?.total ?? scans.length} scans</div>
          </div>
          {analytics?.trend?.every((t:any)=>t.scans===0) ? (
            <div className="h-[260px] grid place-items-center text-sm text-slate-500">No data for this range</div>
          ) : (
            <div className="h-[260px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={analytics?.trend || []}>
                  <defs>
                    <linearGradient id="g1" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#0f172a" stopOpacity={0.18}/><stop offset="100%" stopColor="#0f172a" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="g2" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#ef4444" stopOpacity={0.18}/><stop offset="100%" stopColor="#ef4444" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="date" tick={{fontSize:11, fill:'#94a3b8'}} axisLine={false} tickLine={false}/>
                  <YAxis tick={{fontSize:11, fill:'#94a3b8'}} axisLine={false} tickLine={false} width={30}/>
                  <Tooltip contentStyle={{ borderRadius:12, border:'1px solid #e2e8f0', fontSize:12 }}/>
                  <Area type="monotone" dataKey="scans" stroke="#0f172a" strokeWidth={2} fill="url(#g1)" dot={false} name="Total"/>
                  <Area type="monotone" dataKey="highRisk" stroke="#f59e0b" strokeWidth={1.7} fillOpacity={0} dot={false} name="High-risk"/>
                  <Area type="monotone" dataKey="blocked" stroke="#ef4444" strokeWidth={1.5} fill="url(#g2)" dot={false} name="Blocked"/>
                </AreaChart>
              </ResponsiveContainer>
            </div>
          )}
          <div className="flex items-center gap-4 mt-2 text-[11px] text-slate-500"><span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-slate-900"/> Total</span><span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-amber-500"/> High-risk</span><span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-red-500"/> Blocked</span></div>
        </div>

        <div className="rounded-2xl border bg-white dark:bg-[#0f1720] border-slate-200 dark:border-[#1f2e42] p-5">
          <div className="text-sm font-semibold text-slate-900 dark:text-white">Severity Distribution</div>
          <p className="text-xs text-slate-500 mt-1">By severity level — from live scans</p>
          <div className="h-[200px] mt-2">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={analytics?.severityDist||[]} dataKey="value" nameKey="name" innerRadius={52} outerRadius={78} paddingAngle={3}>
                  {(analytics?.severityDist||[]).map((e:any,i:number)=>{
                    const colors:Record<string,string> = { Low:'#10b981', Medium:'#f59e0b', High:'#f97316', Critical:'#ef4444' }
                    return <Cell key={i} fill={colors[e.name]||'#64748b'}/>
                  })}
                </Pie>
                <Tooltip/>
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="grid grid-cols-2 gap-2 text-xs">
            {(analytics?.severityDist||[]).map((d:any)=> (
              <div key={d.name} className="flex items-center justify-between px-2.5 py-2 rounded-xl bg-slate-50 dark:bg-[#0b1218] border border-slate-200 dark:border-[#1e2e42]">
                <span className="font-medium text-slate-700 dark:text-slate-300">{d.name}</span><span className="font-bold text-slate-900 dark:text-white">{d.value}% • {d.count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="rounded-2xl border bg-white dark:bg-[#0f1720] border-slate-200 dark:border-[#1f2e42] p-5">
          <div className="text-sm font-semibold text-slate-900 dark:text-white">Threat Categories</div>
          <p className="text-xs text-slate-500 mt-1">Ranked by detection count — live</p>
          <div className="mt-4 space-y-3">
            {(analytics?.threatCategories?.length ? analytics.threatCategories.slice(0,6) : [{name:'No detections', value:0}]).map((c:any)=> (
              <div key={c.name} className="flex items-center gap-3">
                <div className="flex-1">
                  <div className="flex items-center justify-between text-xs"><span className="font-medium text-slate-700 dark:text-slate-300">{c.name}</span><span className="font-bold text-slate-900 dark:text-white">{c.value}</span></div>
                  <div className="h-1.5 rounded-full bg-slate-100 dark:bg-[#0b1218] mt-1.5 overflow-hidden"><div className="h-full bg-slate-900 dark:bg-white" style={{ width: `${analytics?.threatCategories?.length ? Math.min(100, (c.value / Math.max(1, analytics.threatCategories[0].value))*100) : 0}%` }}/></div>
                </div>
              </div>
            ))}
          </div>
          <Link to="/threats" className="mt-5 inline-flex text-xs font-semibold text-slate-700 dark:text-slate-300 hover:underline">Explore all threats →</Link>
        </div>

        <div className="rounded-2xl border bg-white dark:bg-[#0f1720] border-slate-200 dark:border-[#1f2e42] p-5">
          <div className="text-sm font-semibold text-slate-900 dark:text-white">Input Type Distribution</div>
          <div className="h-[180px] mt-2">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={analytics?.inputTypeDist||[]} dataKey="value" nameKey="name" innerRadius={46} outerRadius={72} paddingAngle={3}>
                  {(analytics?.inputTypeDist||[]).map((_:any,i:number)=> <Cell key={i} fill={['#0ea5e9','#8b5cf6','#10b981'][i%3]}/> )}
                </Pie>
                <Tooltip/>
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex flex-wrap gap-2 text-xs">{(analytics?.inputTypeDist||[]).map((d:any)=> <span key={d.name} className="px-2.5 py-1 rounded-full bg-slate-100 dark:bg-[#0b1218] border border-slate-200 dark:border-[#1e2e42] font-medium">{d.name}: {d.value}%</span>)}</div>
        </div>

        <div className="space-y-4">
          <div className="rounded-2xl border bg-white dark:bg-[#0f1720] border-slate-200 dark:border-[#1f2e42] p-5">
            <div className="text-sm font-semibold text-slate-900 dark:text-white">Security Decisions</div>
            <div className="h-[140px] mt-2">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={analytics?.decisions||[]}>
                  <XAxis dataKey="name" tick={{fontSize:10, fill:'#64748b'}} axisLine={false} tickLine={false}/>
                  <YAxis hide/>
                  <Tooltip/>
                  <Bar dataKey="value" radius={[8,8,0,0]} fill="#0f172a"/>
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="flex flex-wrap gap-1.5 text-[11px]">{(analytics?.decisions||[]).map((d:any)=> <span key={d.name} className="px-2 py-1 rounded-full bg-slate-50 dark:bg-[#0b1218] border border-slate-200 dark:border-[#1e2e42]">{d.name}: {d.value}%</span>)}</div>
          </div>
          <div className="rounded-2xl border bg-white dark:bg-[#0f1720] border-slate-200 dark:border-[#1f2e42] p-5">
            <div className="text-sm font-semibold text-slate-900 dark:text-white">Avg Processing Time</div>
            <p className="text-xs text-slate-500">ms by input type</p>
            <div className="h-[110px] mt-2">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={analytics?.avgProcessing||[]}>
                  <XAxis dataKey="type" tick={{fontSize:10, fill:'#64748b'}} axisLine={false} tickLine={false}/>
                  <YAxis tick={{fontSize:10, fill:'#64748b'}} axisLine={false} tickLine={false} width={30}/>
                  <Tooltip/>
                  <Bar dataKey="ms" radius={[8,8,0,0]} fill="#334155"/>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border bg-white dark:bg-[#0f1720] border-slate-200 dark:border-[#1f2e42] overflow-hidden">
        <div className="p-5 flex items-center justify-between border-b border-slate-200 dark:border-[#1f2e42]">
          <div className="text-sm font-semibold text-slate-900 dark:text-white">Recent Security Events</div>
          <Link to="/history" className="text-xs font-semibold text-slate-600 dark:text-slate-300 hover:underline flex items-center gap-1">View all <ArrowUpRight className="w-3.5 h-3.5"/></Link>
        </div>
        <div className="divide-y divide-slate-100 dark:divide-[#162435]">
          {recent.map(s=> {
            const preview = (s.original || s.extractedText || '').slice(0,64).replace(/\n/g,' ')
            return (
              <button key={s.id} onClick={()=>navigate(`/history/${s.id}`)} className="w-full text-left px-5 py-4 hover:bg-slate-50 dark:hover:bg-[#0b1218] flex items-center gap-4">
                <div className={`w-9 h-9 rounded-xl grid place-items-center shrink-0 ${s.inputType==='Text'?'bg-sky-50 text-sky-600 dark:bg-sky-500/10 dark:text-sky-300': s.inputType==='Code'?'bg-violet-50 text-violet-600 dark:bg-violet-500/10 dark:text-violet-300':'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-300'}`}>
                  {s.inputType==='Text'?<FileText className="w-4 h-4"/>: s.inputType==='Code'?<Code2 className="w-4 h-4"/>:<ImageIcon className="w-4 h-4"/>}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-slate-900 dark:text-white truncate flex items-center gap-2">{s.id.toUpperCase()} <span className="text-xs text-slate-500">{new Date(s.timestamp).toLocaleTimeString([],{hour:'2-digit',minute:'2-digit'})} • {s.source}</span></div>
                  <div className="text-xs text-slate-500 truncate">{s.inputType} • {preview || 'No preview'} • {s.threatCount} threats</div>
                </div>
                <div className="hidden sm:flex items-center gap-2"><RiskBadge score={s.riskScore}/><StatusBadge decision={s.decision}/></div>
                <div className="sm:hidden"><RiskBadge score={s.riskScore}/></div>
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
