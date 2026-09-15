import { useEffect, useState } from 'react'
import { PageHeader } from '../components/common/PageHeader'
import { getAnalytics } from '../services/analytics'
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts'

export default function Analytics(){
  const [range, setRange] = useState('30D')
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  useEffect(()=>{ setLoading(true); getAnalytics(range).then(d=>{ setData(d); setLoading(false)}) },[range])
  if(loading) return <div className="space-y-4"><div className="h-64 rounded-2xl bg-slate-100 dark:bg-[#0b1218] animate-pulse"/><div className="h-64 rounded-2xl bg-slate-100 dark:bg-[#0b1218] animate-pulse"/></div>
  return (
    <div className="space-y-6">
      <PageHeader title="Analytics" subtitle="Real security metrics from the gateway API" actions={
        <div className="flex p-1 rounded-full bg-slate-100 dark:bg-[#12202f] border border-slate-200 dark:border-[#1e2e42]">
          {['24H','7D','30D','90D'].map(r=> (
            <button key={r} onClick={()=>setRange(r)} className={`px-4 py-1.5 rounded-full text-xs font-bold ${range===r ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow' : 'text-slate-600 dark:text-slate-400'}`}>{r}</button>
          ))}
        </div>
      }/>
      <div className="rounded-2xl border bg-white dark:bg-[#0f1720] border-slate-200 dark:border-[#1f2e42] p-5">
        <div className="text-sm font-semibold text-slate-900 dark:text-white">Scans Over Time</div>
        <div className="h-[280px] mt-4">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data.trend}>
              <XAxis dataKey="date" tick={{fontSize:11, fill:'#94a3b8'}} axisLine={false} tickLine={false}/>
              <YAxis tick={{fontSize:11, fill:'#94a3b8'}} axisLine={false} tickLine={false} width={30}/>
              <Tooltip/>
              <Area type="monotone" dataKey="scans" stroke="#0f172a" strokeWidth={2} fill="#0f172a" fillOpacity={0.08}/>
              <Area type="monotone" dataKey="blocked" stroke="#ef4444" strokeWidth={1.5} fillOpacity={0}/>
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="rounded-2xl border bg-white dark:bg-[#0f1720] border-slate-200 dark:border-[#1f2e42] p-5">
          <div className="text-sm font-semibold text-slate-900 dark:text-white">Threat Categories</div>
          <div className="h-[220px] mt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.threatCategories} layout="vertical">
                <XAxis type="number" hide/>
                <YAxis type="category" dataKey="name" width={110} tick={{fontSize:11, fill:'#64748b'}} axisLine={false} tickLine={false}/>
                <Tooltip/>
                <Bar dataKey="value" radius={[8,8,8,8]} fill="#0f172a"/>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="rounded-2xl border bg-white dark:bg-[#0f1720] border-slate-200 dark:border-[#1f2e42] p-5">
          <div className="text-sm font-semibold text-slate-900 dark:text-white">Severity Distribution</div>
          <div className="h-[220px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart><Pie data={data.severityDist} dataKey="value" nameKey="name" innerRadius={50} outerRadius={80} paddingAngle={3}>
                {data.severityDist.map((e:any,i:number)=> <Cell key={i} fill={['#10b981','#f59e0b','#f97316','#ef4444'][i]}/> )}
              </Pie><Tooltip/></PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex flex-wrap gap-2 text-xs">{data.severityDist.map((d:any)=> <span key={d.name} className="px-2.5 py-1 rounded-full bg-slate-100 dark:bg-[#0b1218] border border-slate-200 dark:border-[#1e2e42] font-medium">{d.name}: {d.value}%</span>)}</div>
        </div>
        <div className="rounded-2xl border bg-white dark:bg-[#0f1720] border-slate-200 dark:border-[#1f2e42] p-5">
          <div className="text-sm font-semibold text-slate-900 dark:text-white">Input Type Distribution</div>
          <div className="h-[220px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart><Pie data={data.inputTypeDist} dataKey="value" nameKey="name" innerRadius={50} outerRadius={80} paddingAngle={3}>
                {data.inputTypeDist.map((e:any,i:number)=> <Cell key={i} fill={['#0ea5e9','#8b5cf6','#10b981'][i%3]}/> )}
              </Pie><Tooltip/></PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex flex-wrap gap-2 text-xs">{data.inputTypeDist.map((d:any)=> <span key={d.name} className="px-2.5 py-1 rounded-full bg-slate-100 dark:bg-[#0b1218] border border-slate-200 dark:border-[#1e2e42] font-medium">{d.name}: {d.value}%</span>)}</div>
        </div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="rounded-2xl border bg-white dark:bg-[#0f1720] border-slate-200 dark:border-[#1f2e42] p-5">
          <div className="text-sm font-semibold text-slate-900 dark:text-white">Security Decisions</div>
          <div className="h-[220px] mt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.decisions}>
                <XAxis dataKey="name" tick={{fontSize:11, fill:'#64748b'}} axisLine={false} tickLine={false}/>
                <YAxis tick={{fontSize:11, fill:'#64748b'}} axisLine={false} tickLine={false}/>
                <Tooltip/>
                <Bar dataKey="value" radius={[10,10,0,0]} fill="#0f172a"/>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="rounded-2xl border bg-white dark:bg-[#0f1720] border-slate-200 dark:border-[#1f2e42] p-5">
          <div className="text-sm font-semibold text-slate-900 dark:text-white">Average Processing Time</div>
          <p className="text-xs text-slate-500">By input type (milliseconds)</p>
          <div className="h-[220px] mt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.avgProcessing}>
                <XAxis dataKey="type" tick={{fontSize:11, fill:'#64748b'}} axisLine={false} tickLine={false}/>
                <YAxis tick={{fontSize:11, fill:'#64748b'}} axisLine={false} tickLine={false}/>
                <Tooltip/>
                <Bar dataKey="ms" radius={[10,10,0,0]} fill="#334155"/>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  )
}
