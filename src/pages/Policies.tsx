import { useEffect, useState } from 'react'
import { PageHeader } from '../components/common/PageHeader'
import { getPolicies, createPolicy, updatePolicy, deletePolicy, Policy } from '../services/policies'
import { useToast } from '../context/ToastContext'
import { Plus, Pencil, Trash2, ShieldCheck, X, Loader2 } from 'lucide-react'

export default function Policies(){
  const [policies, setPolicies] = useState<Policy[]>([])
  const [loading, setLoading] = useState(true)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [editing, setEditing] = useState<Policy|null>(null)
  const [form, setForm] = useState<any>({ name:'', description:'', category:'PII', severity:'High', action:'BLOCK', enabled:true })
  const [saving, setSaving] = useState(false)
  const { push } = useToast()

  const load = async ()=>{ setLoading(true); try{ setPolicies(await getPolicies()) }catch{} finally{ setLoading(false)} }
  useEffect(()=>{ load() },[])

  const openCreate = ()=>{ setEditing(null); setForm({ name:'', description:'', category:'PII', severity:'High', action:'BLOCK', enabled:true }); setDrawerOpen(true)}
  const openEdit = (p:Policy)=>{ setEditing(p); setForm({ ...p }); setDrawerOpen(true)}
  const save = async ()=>{
    if(!form.name.trim()) return push({title:'Policy name required', variant:'error'})
    setSaving(true)
    try{
      if(editing) await updatePolicy(editing.id, form)
      else await createPolicy(form)
      push({title: editing? 'Policy updated':'Policy created', variant:'success'})
      setDrawerOpen(false); load()
    }catch(e:any){ push({title:'Save failed', desc:e.message, variant:'error'})}
    finally{ setSaving(false)}
  }
  const remove = async (id:string)=>{
    if(!confirm('Delete this policy?')) return
    await deletePolicy(id); push({title:'Policy deleted', variant:'success'}); load()
  }

  return (
    <div className="space-y-4">
      <PageHeader title="Policies" subtitle="Configure how LeakGuard handles each threat category" actions={<button onClick={openCreate} className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-sm font-semibold"><Plus className="w-4 h-4"/>New Policy</button>}/>
      {loading ? <div className="space-y-2">{Array.from({length:4}).map((_,i)=><div key={i} className="h-16 rounded-xl bg-slate-100 dark:bg-[#0b1218] animate-pulse"/>)}</div> : (
        <div className="rounded-2xl border bg-white dark:bg-[#0f1720] border-slate-200 dark:border-[#1f2e42] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 dark:bg-[#0b1218] text-[11px] font-bold tracking-widest text-slate-500 uppercase">
                <tr><th className="text-left px-4 py-3">Policy</th><th className="text-left px-4 py-3">Category</th><th className="text-left px-4 py-3">Action</th><th className="text-left px-4 py-3">Severity</th><th className="text-left px-4 py-3">Status</th><th className="text-left px-4 py-3">Updated</th><th className="text-right px-4 py-3">Actions</th></tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-[#162435]">
                {policies.map(p=> (
                  <tr key={p.id} className="hover:bg-slate-50 dark:hover:bg-[#0b1218]">
                    <td className="px-4 py-3"><div className="font-semibold text-slate-900 dark:text-white">{p.name}</div><div className="text-xs text-slate-500 max-w-[320px] truncate">{p.description}</div></td>
                    <td className="px-4 py-3 text-xs font-medium">{p.category}</td>
                    <td className="px-4 py-3"><span className={`inline-flex px-2.5 py-1 rounded-full border text-[11px] font-bold tracking-widest ${p.action==='BLOCK'?'bg-red-50 text-red-700 border-red-200 dark:bg-red-500/10 dark:text-red-300 dark:border-red-500/20': p.action==='REDACT'?'bg-sky-50 text-sky-700 border-sky-200 dark:bg-sky-500/10 dark:text-sky-300 dark:border-sky-500/20': p.action==='WARN'?'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-500/10 dark:text-amber-300 dark:border-amber-500/20':'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-300 dark:border-emerald-500/20'}`}>{p.action}</span></td>
                    <td className="px-4 py-3 text-xs">{p.severity}</td>
                    <td className="px-4 py-3"><span className={`inline-flex items-center gap-1.5 text-xs font-semibold ${p.enabled ? 'text-emerald-600' : 'text-slate-400'}`}><span className={`w-2 h-2 rounded-full ${p.enabled ? 'bg-emerald-500' : 'bg-slate-300'}`}/>{p.enabled ? 'Enabled' : 'Disabled'}</span></td>
                    <td className="px-4 py-3 text-xs text-slate-500">{new Date(p.updatedAt).toLocaleDateString()}</td>
                    <td className="px-4 py-3 text-right">
                      <div className="inline-flex gap-1.5">
                        <button onClick={()=>openEdit(p)} className="w-8 h-8 grid place-items-center rounded-xl border bg-white dark:bg-[#0b1218] border-slate-200 dark:border-[#1e2e42] hover:bg-slate-50"><Pencil className="w-3.5 h-3.5"/></button>
                        <button onClick={()=>remove(p.id)} className="w-8 h-8 grid place-items-center rounded-xl border bg-white dark:bg-[#0b1218] border-slate-200 dark:border-[#1e2e42] hover:bg-red-50 hover:text-red-600"><Trash2 className="w-3.5 h-3.5"/></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {drawerOpen && (
        <div className="fixed inset-0 z-50 flex">
          <div className="flex-1 bg-black/30 backdrop-blur-sm" onClick={()=>setDrawerOpen(false)}/>
          <div className="w-[440px] max-w-[92vw] bg-white dark:bg-[#0f1720] border-l border-slate-200 dark:border-[#1f2e42] shadow-2xl flex flex-col">
            <div className="h-[64px] flex items-center justify-between px-6 border-b border-slate-200 dark:border-[#1f2e42]">
              <div className="flex items-center gap-3"><div className="w-9 h-9 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 grid place-items-center"><ShieldCheck className="w-5 h-5"/></div><div className="text-sm font-bold text-slate-900 dark:text-white">{editing ? 'Edit Policy' : 'New Policy'}</div></div>
              <button onClick={()=>setDrawerOpen(false)} className="w-8 h-8 grid place-items-center rounded-xl hover:bg-slate-100 dark:hover:bg-[#0b1218]"><X className="w-5 h-5"/></button>
            </div>
            <div className="flex-1 overflow-auto p-6 space-y-4">
              <div>
                <label className="text-xs font-bold tracking-widest text-slate-500 uppercase">Policy Name</label>
                <input value={form.name} onChange={e=>setForm({...form, name:e.target.value})} placeholder="e.g. Block Critical Credentials" className="mt-1.5 w-full px-3 py-2.5 rounded-xl border bg-slate-50 dark:bg-[#0b1218] border-slate-200 dark:border-[#1e2e42] text-sm"/>
              </div>
              <div>
                <label className="text-xs font-bold tracking-widest text-slate-500 uppercase">Description</label>
                <textarea value={form.description} onChange={e=>setForm({...form, description:e.target.value})} rows={3} placeholder="What this policy does" className="mt-1.5 w-full px-3 py-2.5 rounded-xl border bg-slate-50 dark:bg-[#0b1218] border-slate-200 dark:border-[#1e2e42] text-sm"/>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold tracking-widest text-slate-500 uppercase">Category</label>
                  <select value={form.category} onChange={e=>setForm({...form, category:e.target.value})} className="mt-1.5 w-full px-3 py-2.5 rounded-xl border bg-white dark:bg-[#0b1218] border-slate-200 dark:border-[#1e2e42] text-sm">
                    {['PII','Credentials','API Keys','Passwords','JWT Tokens','Private Keys','Database Secrets','Prompt Injection','System Prompt Extraction','Suspicious Instructions','General'].map(c=> <option key={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold tracking-widest text-slate-500 uppercase">Severity Override</label>
                  <select value={form.severity} onChange={e=>setForm({...form, severity:e.target.value})} className="mt-1.5 w-full px-3 py-2.5 rounded-xl border bg-white dark:bg-[#0b1218] border-slate-200 dark:border-[#1e2e42] text-sm">
                    <option>Low</option><option>Medium</option><option>High</option><option>Critical</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="text-xs font-bold tracking-widest text-slate-500 uppercase">Action</label>
                <div className="mt-1.5 grid grid-cols-2 gap-2">
                  {['ALLOW','WARN','REDACT','BLOCK'].map(a=> (
                    <button key={a} onClick={()=>setForm({...form, action:a})} className={`px-3 py-2.5 rounded-xl border text-xs font-bold tracking-widest ${form.action===a ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 border-slate-900 dark:border-white' : 'bg-white dark:bg-[#0b1218] border-slate-200 dark:border-[#1e2e42] text-slate-700 dark:text-slate-300'}`}>{a}</button>
                  ))}
                </div>
              </div>
              <label className="flex items-center gap-2 text-sm font-medium text-slate-700 dark:text-slate-300"><input type="checkbox" checked={form.enabled} onChange={e=>setForm({...form, enabled:e.target.checked})} className="w-4 h-4 rounded border-slate-300"/> Enabled</label>
            </div>
            <div className="p-6 border-t border-slate-200 dark:border-[#1f2e42] flex gap-2">
              <button onClick={()=>setDrawerOpen(false)} className="flex-1 px-4 py-2.5 rounded-xl border bg-white dark:bg-[#0b1218] border-slate-200 dark:border-[#1e2e42] text-sm font-semibold">Cancel</button>
              <button onClick={save} disabled={saving} className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-sm font-bold disabled:opacity-50">{saving && <Loader2 className="w-4 h-4 animate-spin"/>}{editing?'Save Changes':'Create Policy'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
