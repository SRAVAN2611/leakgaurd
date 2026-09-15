import { useState, useEffect } from 'react'
import { PageHeader } from '../components/common/PageHeader'
import { useTheme } from '../context/ThemeContext'
import { useToast } from '../context/ToastContext'
import { Sun, Moon, Monitor, Shield, Eye, Plug, Save, Bell, Wifi, CheckCircle2, AlertTriangle } from 'lucide-react'
import { loadSettings, saveSettings, defaultSettings, getApiBaseOverride, setApiBaseOverride, AppSettings } from '../lib/persistence'
import { healthCheck } from '../services/scans'
import { getApiBase, isMockMode } from '../lib/api'

export default function Settings(){
  const { theme, setTheme, resolved } = useTheme()
  const { push } = useToast()
  const [apiBase, setApiBase] = useState<string>(()=> getApiBaseOverride() || (import.meta.env.VITE_API_BASE_URL as string) || '')
  const [settings, setSettings] = useState<AppSettings>(()=> loadSettings())
  const [health, setHealth] = useState<{status:string; latency?:number; error?:string} | null>(null)
  const [checking, setChecking] = useState(false)

  const update = (k: keyof AppSettings, v: any) => {
    const next = { ...settings, [k]: v }
    // privacy: retentionDays 1-30
    if (k==='retentionDays') v = Math.min(30, Math.max(1, Number(v)||7))
    setSettings(next)
    saveSettings(next)
    // notify for theme?
    if (k==='notifyScanComplete' || k==='notifyBlocked') push({ title: 'Settings saved', variant:'success' })
  }
  const saveApi = ()=>{
    setApiBaseOverride(apiBase.trim())
    // also need to update api client's base on next request (api.ts reads from localStorage)
    push({title:'API settings saved', desc: apiBase.trim() ? `Base URL set to ${apiBase.trim()}` : 'Cleared override — using VITE_API_BASE_URL / mock mode', variant:'success'})
    testConnection()
  }
  const testConnection = async ()=>{
    setChecking(true); setHealth(null)
    try{
      const h = await healthCheck()
      setHealth({ status: h.status, latency: h.latencyMs })
      push({ title: h.status==='ok' ? 'API Connected' : h.status==='mock' ? 'Mock Mode Active' : 'API Status: '+h.status, desc: h.latencyMs ? `${h.latencyMs}ms` : undefined, variant: h.status==='ok' ? 'success' : 'info' })
    }catch(e:any){
      setHealth({ status:'down', error: e.message })
      push({ title:'Connection failed', desc: e.message, variant:'error' })
    } finally { setChecking(false)}
  }
  useEffect(()=>{ testConnection() },[])

  const Card = ({ title, icon:Icon, children }: any)=> (
    <div className="rounded-2xl border bg-white dark:bg-[#0f1720] border-slate-200 dark:border-[#1f2e42] overflow-hidden">
      <div className="px-5 py-4 border-b border-slate-200 dark:border-[#1f2e42] flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 grid place-items-center"><Icon className="w-5 h-5"/></div>
        <div className="text-sm font-bold text-slate-900 dark:text-white">{title}</div>
      </div>
      <div className="p-5 space-y-4">{children}</div>
    </div>
  )

  const mockActive = isMockMode()

  return (
    <div className="space-y-6 max-w-[900px]">
      <PageHeader title="Settings" subtitle="Application, detection, privacy and API connection preferences"/>

      <Card title="Application" icon={Sun}>
        <div>
          <div className="text-xs font-bold tracking-widest text-slate-500 uppercase">Theme</div>
          <p className="text-xs text-slate-500 mt-1">Light / Dark / System — preference persists locally and applies instantly.</p>
          <div className="mt-3 flex gap-2">
            <button onClick={()=>setTheme('light')} aria-label="Light mode" title="Light mode" className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl border text-sm font-semibold ${theme==='light' ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 border-slate-900 dark:border-white' : 'bg-white dark:bg-[#0b1218] border-slate-200 dark:border-[#1e2e42] text-slate-700 dark:text-slate-300'}`}><Sun className="w-4 h-4"/>Light</button>
            <button onClick={()=>setTheme('dark')} aria-label="Dark mode" title="Dark mode" className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl border text-sm font-semibold ${theme==='dark' ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 border-slate-900 dark:border-white' : 'bg-white dark:bg-[#0b1218] border-slate-200 dark:border-[#1e2e42] text-slate-700 dark:text-slate-300'}`}><Moon className="w-4 h-4"/>Dark</button>
            <button onClick={()=>setTheme('system')} aria-label="System theme" title="System theme" className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl border text-sm font-semibold ${theme==='system' ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 border-slate-900 dark:border-white' : 'bg-white dark:bg-[#0b1218] border-slate-200 dark:border-[#1e2e42] text-slate-700 dark:text-slate-300'}`}><Monitor className="w-4 h-4"/>System</button>
          </div>
          <div className="text-xs text-slate-500 mt-2">Resolved: <span className="font-semibold text-slate-700 dark:text-slate-300">{resolved}</span> • Stored as <span className="font-mono">{theme}</span></div>
        </div>
        <div className="flex items-center justify-between py-3 border-t border-slate-100 dark:border-[#162435]">
          <div><div className="text-sm font-medium text-slate-900 dark:text-white">Compact density</div><div className="text-xs text-slate-500">Reduce paddings for dense screens</div></div>
          <label className="relative inline-flex items-center cursor-pointer"><input type="checkbox" checked={!!settings.compactDensity} onChange={e=>update('compactDensity', e.target.checked)} className="sr-only peer"/><div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-[#1e2e42] peer-checked:bg-slate-900 dark:peer-checked:bg-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white dark:after:bg-slate-900 after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-5"/></label>
        </div>
        <div className="space-y-3 border-t border-slate-100 dark:border-[#162435] pt-4">
          <div className="text-xs font-bold tracking-widest text-slate-500 uppercase flex items-center gap-2"><Bell className="w-3.5 h-3.5"/>Notifications</div>
          <label className="flex items-center justify-between p-3 rounded-xl border bg-slate-50 dark:bg-[#0b1218] border-slate-200 dark:border-[#1e2e42]">
            <span><span className="text-sm font-medium text-slate-900 dark:text-white">Scan completion</span><span className="block text-xs text-slate-500">Toast when a scan finishes</span></span>
            <input type="checkbox" checked={settings.notifyScanComplete} onChange={e=>update('notifyScanComplete', e.target.checked)} className="w-4 h-4"/>
          </label>
          <label className="flex items-center justify-between p-3 rounded-xl border bg-slate-50 dark:bg-[#0b1218] border-slate-200 dark:border-[#1e2e42]">
            <span><span className="text-sm font-medium text-slate-900 dark:text-white">Blocked inputs</span><span className="block text-xs text-slate-500">Alert when a critical input is blocked</span></span>
            <input type="checkbox" checked={settings.notifyBlocked} onChange={e=>update('notifyBlocked', e.target.checked)} className="w-4 h-4"/>
          </label>
        </div>
      </Card>

      <Card title="Detection" icon={Shield}>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <label className="flex items-center justify-between p-3 rounded-xl border bg-slate-50 dark:bg-[#0b1218] border-slate-200 dark:border-[#1e2e42]">
            <span className="text-sm font-medium text-slate-900 dark:text-white">PII Detection</span>
            <input type="checkbox" checked={settings.pii} onChange={e=>update('pii', e.target.checked)} className="w-4 h-4"/>
          </label>
          <label className="flex items-center justify-between p-3 rounded-xl border bg-slate-50 dark:bg-[#0b1218] border-slate-200 dark:border-[#1e2e42]">
            <span className="text-sm font-medium text-slate-900 dark:text-white">Secret Scanning</span>
            <input type="checkbox" checked={settings.secrets} onChange={e=>update('secrets', e.target.checked)} className="w-4 h-4"/>
          </label>
          <label className="flex items-center justify-between p-3 rounded-xl border bg-slate-50 dark:bg-[#0b1218] border-slate-200 dark:border-[#1e2e42]">
            <span className="text-sm font-medium text-slate-900 dark:text-white">Prompt Injection</span>
            <input type="checkbox" checked={settings.injection} onChange={e=>update('injection', e.target.checked)} className="w-4 h-4"/>
          </label>
          <label className="flex items-center justify-between p-3 rounded-xl border bg-slate-50 dark:bg-[#0b1218] border-slate-200 dark:border-[#1e2e42]">
            <span className="text-sm font-medium text-slate-900 dark:text-white">OCR for Images</span>
            <input type="checkbox" checked={settings.ocr} onChange={e=>update('ocr', e.target.checked)} className="w-4 h-4"/>
          </label>
        </div>
        <div>
          <div className="text-xs font-bold tracking-widest text-slate-500 uppercase">Sensitivity: {settings.sensitivity}</div>
          <input type="range" min={0} max={100} value={settings.sensitivity} onChange={e=>update('sensitivity', Number(e.target.value))} className="w-full mt-2 accent-slate-900 dark:accent-white"/>
          <div className="text-xs text-slate-500">Higher sensitivity increases recall and may increase false positives. Affects confidence thresholds and risk scoring.</div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <label className="flex items-center justify-between p-3 rounded-xl border bg-slate-50 dark:bg-[#0b1218] border-slate-200 dark:border-[#1e2e42]">
            <span><span className="text-sm font-medium text-slate-900 dark:text-white">Strict Mode</span><span className="block text-xs text-slate-500">+10 risk, stricter decisions</span></span>
            <input type="checkbox" checked={settings.strictMode} onChange={e=>update('strictMode', e.target.checked)} className="w-4 h-4"/>
          </label>
          <label className="flex items-center justify-between p-3 rounded-xl border bg-slate-50 dark:bg-[#0b1218] border-slate-200 dark:border-[#1e2e42]">
            <span><span className="text-sm font-medium text-slate-900 dark:text-white">Auto-Redact Low Severity</span><span className="block text-xs text-slate-500">Upgrade low findings to REDACT</span></span>
            <input type="checkbox" checked={settings.autoRedactLow} onChange={e=>update('autoRedactLow', e.target.checked)} className="w-4 h-4"/>
          </label>
        </div>
      </Card>

      <Card title="Privacy" icon={Eye}>
        <label className="flex items-start gap-3 p-3 rounded-xl border bg-slate-50 dark:bg-[#0b1218] border-slate-200 dark:border-[#1e2e42]">
          <input type="checkbox" checked={settings.alwaysMaskEvidence} onChange={e=>update('alwaysMaskEvidence', e.target.checked)} className="mt-1 w-4 h-4"/>
          <span><span className="text-sm font-medium text-slate-900 dark:text-white">Always Mask Evidence</span><span className="block text-xs text-slate-500">Show masked evidence only; never expose raw secrets in findings or original preview.</span></span>
        </label>
        <label className="flex items-start gap-3 p-3 rounded-xl border bg-slate-50 dark:bg-[#0b1218] border-slate-200 dark:border-[#1e2e42]">
          <input type="checkbox" checked={settings.retainOriginal} onChange={e=>update('retainOriginal', e.target.checked)} className="mt-1 w-4 h-4"/>
          <span><span className="text-sm font-medium text-slate-900 dark:text-white">Retain Original Inputs</span><span className="block text-xs text-slate-500">Persist original content for audit. Disable to store only sanitized output.</span></span>
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <label className="flex items-center justify-between p-3 rounded-xl border bg-slate-50 dark:bg-[#0b1218] border-slate-200 dark:border-[#1e2e42]">
            <span><span className="text-sm font-medium text-slate-900 dark:text-white">Extended Retention</span><span className="block text-xs text-slate-500">30 days vs {settings.retentionDays} days</span></span>
            <input type="checkbox" checked={settings.extendedRetention} onChange={e=>update('extendedRetention', e.target.checked)} className="w-4 h-4"/>
          </label>
          <div className="p-3 rounded-xl border bg-slate-50 dark:bg-[#0b1218] border-slate-200 dark:border-[#1e2e42]">
            <div className="text-xs font-bold tracking-widest text-slate-500 uppercase">Retention Days</div>
            <input type="number" min={1} max={30} value={settings.retentionDays} onChange={e=>update('retentionDays', Number(e.target.value))} className="mt-1.5 w-full px-3 py-2 rounded-xl border bg-white dark:bg-[#0f1720] border-slate-200 dark:border-[#1e2e42] text-sm"/>
            <div className="text-xs text-slate-500 mt-1">1–30 days. Applied on next scan.</div>
          </div>
        </div>
      </Card>

      <Card title="Backend / API" icon={Plug}>
        <div>
          <label className="text-xs font-bold tracking-widest text-slate-500 uppercase">API Base URL</label>
          <input value={apiBase} onChange={e=>setApiBase(e.target.value)} placeholder="https://api.leakguard.example.com" className="mt-1.5 w-full px-3 py-2.5 rounded-xl border bg-slate-50 dark:bg-[#0b1218] border-slate-200 dark:border-[#1e2e42] text-sm font-mono"/>
          <div className="text-xs text-slate-500 mt-1">Overrides VITE_API_BASE_URL. Stored as <span className="font-mono">lg-api-base</span>. Empty → uses env or mock mode.</div>
        </div>
        <div className="flex items-center justify-between p-3 rounded-xl border bg-slate-50 dark:bg-[#0b1218] border-slate-200 dark:border-[#1e2e42]">
          <div><div className="text-sm font-medium text-slate-900 dark:text-white">Mock / Demo Mode</div><div className="text-xs text-slate-500">Clearly labeled — does not silently replace a configured backend</div></div>
          <span className={`text-xs font-bold px-2.5 py-1 rounded-full border ${mockActive ? 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-500/10 dark:text-amber-300' : 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-300'}`}>{mockActive ? 'ON — isolated local engine' : 'OFF — live API'}</span>
        </div>
        <div className="flex flex-wrap gap-2">
          <button onClick={saveApi} className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-sm font-semibold"><Save className="w-4 h-4"/>Save & Apply</button>
          <button onClick={testConnection} disabled={checking} className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border bg-white dark:bg-[#0b1218] border-slate-200 dark:border-[#1e2e42] text-sm font-semibold disabled:opacity-50"><Wifi className={`w-4 h-4 ${checking ? 'animate-pulse':''}`}/>{checking ? 'Testing...' : 'Test Connection'}</button>
        </div>
        {health && (
          <div className={`flex items-center gap-2 p-3 rounded-xl border text-xs font-medium ${health.status==='ok' ? 'bg-emerald-50 border-emerald-200 text-emerald-800 dark:bg-emerald-500/10 dark:border-emerald-500/20 dark:text-emerald-300' : health.status==='mock' ? 'bg-amber-50 border-amber-200 text-amber-800 dark:bg-amber-500/10 dark:border-amber-500/20 dark:text-amber-300' : 'bg-red-50 border-red-200 text-red-700 dark:bg-red-500/10 dark:border-red-500/20 dark:text-red-300'}`}>
            {health.status==='ok' ? <CheckCircle2 className="w-4 h-4"/> : <AlertTriangle className="w-4 h-4"/>}
            <span>{health.status==='ok' ? `Connected • ${health.latency}ms` : health.status==='mock' ? `Mock mode active • ${health.latency}ms` : `Disconnected${health.error ? ' • '+health.error : ''}`}</span>
          </div>
        )}
        <div className="text-[11px] text-slate-500">Flow: USER INPUT → ANALYSIS → THREAT DETECTION → RISK EVALUATION → SECURITY DECISION → SANITIZED OUTPUT</div>
      </Card>
    </div>
  )
}
