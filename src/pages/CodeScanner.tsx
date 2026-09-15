import { useState, useRef, useEffect } from 'react'
import { PageHeader } from '../components/common/PageHeader'
import { UnifiedScanResult } from '../components/common/UnifiedScanResult'
import { scanCode } from '../services/scans'
import { Scan } from '../mocks/data'
import { useToast } from '../context/ToastContext'
import { Upload, Trash2, Copy, Loader2, ShieldCheck } from 'lucide-react'

const languages = ['Auto Detect','Python','JavaScript','Java','JSON','YAML','ENV','Other'] as const

export default function CodeScanner(){
  const [language, setLanguage] = useState<string>('Auto Detect')
  const [code, setCode] = useState("// Try pasting code with secrets\nconst apiKey = 'stripe_sec_key_sample_51H8xXxAbCdEfGhIj';\nconst db = 'postgres://admin:password123@prod-db:5432/app';\n")
  const [result, setResult] = useState<Scan|null>(null)
  const [loading, setLoading] = useState(false)
  const [activeLine, setActiveLine] = useState<number|null>(null)
  const preRef = useRef<HTMLPreElement>(null)
  const { push } = useToast()

  const analyze = async ()=>{
    if(!code.trim()) return push({ title:'Code required', variant:'error' })
    setLoading(true)
    try{
      const r = await scanCode({ content: code, language })
      setResult(r)
      push({ title:`Scan ${r.decision}`, desc:`Risk ${r.riskScore}`, variant: r.decision==='BLOCK'?'error':'info' })
    }catch(e: unknown){
      const msg = e instanceof Error ? e.message : 'Scan failed'
      push({ title:'Scan failed', desc: msg, variant:'error' })
    }
    finally{ setLoading(false) }
  }

  useEffect(()=>{
    if(activeLine!=null && preRef.current){
      const el = preRef.current.querySelector(`[data-line="${activeLine}"]`)
      el?.scrollIntoView({ behavior:'smooth', block:'center' })
    }
  },[activeLine])

  const lines = code.split('\n')
  const threatLines = new Set(result?.findings.map(f=>f.line).filter(Boolean) as number[])

  const onFile = (f: File)=>{
    const reader = new FileReader()
    reader.onload = ()=> setCode(String(reader.result||''))
    reader.readAsText(f)
    push({title:'File loaded', desc:f.name, variant:'success'})
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Code Scanner" subtitle="Detect secrets, credentials and sensitive patterns in source code before sharing with AI assistants"/>
      <div className="rounded-2xl border bg-white dark:bg-[#0f1720] border-slate-200 dark:border-[#1f2e42] p-3 flex flex-wrap items-center gap-2">
        <div className="flex flex-wrap gap-1.5">
          {languages.map(l=> (
            <button key={l} onClick={()=>setLanguage(l)} className={`px-3 py-1.5 rounded-full text-xs font-semibold border ${language===l ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 border-slate-900 dark:border-white' : 'bg-white dark:bg-[#0b1218] border-slate-200 dark:border-[#1e2e42] text-slate-700 dark:text-slate-300'}`}>{l}</button>
          ))}
        </div>
        <div className="flex-1"/>
        <label className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl border bg-white dark:bg-[#0b1218] border-slate-200 dark:border-[#1e2e42] text-xs font-semibold cursor-pointer hover:bg-slate-50">
          <Upload className="w-3.5 h-3.5"/> Upload file<input type="file" className="hidden" accept=".py,.js,.ts,.java,.json,.yaml,.yml,.env,.txt,.sh" onChange={e=> e.target.files && onFile(e.target.files[0])}/>
        </label>
        <button onClick={()=>setCode('')} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border bg-white dark:bg-[#0b1218] border-slate-200 dark:border-[#1e2e42] text-xs font-semibold"><Trash2 className="w-3.5 h-3.5"/>Clear</button>
        <button onClick={analyze} disabled={loading} className="inline-flex items-center gap-2 px-5 py-2 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-xs font-bold disabled:opacity-50">{loading ? <><Loader2 className="w-4 h-4 animate-spin"/>Scanning...</> : <><ShieldCheck className="w-4 h-4"/>Scan Code</>}</button>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-[1.4fr_0.9fr] gap-6 items-start">
        <div className="rounded-2xl border bg-white dark:bg-[#0f1720] border-slate-200 dark:border-[#1f2e42] overflow-hidden flex flex-col">
          <div className="h-9 flex items-center justify-between px-4 border-b border-slate-200 dark:border-[#1f2e42] bg-slate-50 dark:bg-[#0b1218]">
            <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400"><span className="w-2.5 h-2.5 rounded-full bg-red-400"/><span className="w-2.5 h-2.5 rounded-full bg-amber-400"/><span className="w-2.5 h-2.5 rounded-full bg-emerald-400"/><span className="ml-2 font-mono text-[11px]">{language} • {lines.length} lines</span></div>
            <button onClick={()=>{ navigator.clipboard.writeText(code); push({title:'Copied', variant:'success'})}} className="text-xs font-semibold inline-flex items-center gap-1.5 hover:underline"><Copy className="w-3.5 h-3.5"/>Copy</button>
          </div>
          <div className="grid grid-cols-[52px_1fr] min-h-[420px] max-h-[560px] overflow-auto">
            <div className="bg-slate-50 dark:bg-[#0b1218] border-r border-slate-200 dark:border-[#1e2e42] py-3 text-right pr-3 select-none">
              {lines.map((_,i)=> (
                <div key={i} className={`font-mono text-xs leading-6 ${threatLines.has(i+1) ? 'text-red-600 dark:text-red-400 font-bold bg-red-50 dark:bg-red-500/10' : 'text-slate-400'}`}>{i+1}</div>
              ))}
            </div>
            <div className="relative">
              <textarea value={code} onChange={e=>setCode(e.target.value)} spellCheck={false} className="absolute inset-0 w-full h-full p-3 font-mono text-[13px] leading-6 bg-transparent text-slate-900 dark:text-slate-100 focus:outline-none resize-none" style={{ whiteSpace:'pre', overflowWrap:'normal', overflow:'auto' }}/>
              {/* highlight overlay for threat lines */}
              <pre ref={preRef} aria-hidden className="p-3 font-mono text-[13px] leading-6 pointer-events-none whitespace-pre-wrap break-words text-transparent">
                {lines.map((line,i)=> (
                  <div key={i} data-line={i+1} className={`${threatLines.has(i+1) ? 'bg-red-50 dark:bg-red-500/10 border-l-2 border-red-500 -ml-3 pl-3' : ''} ${activeLine===i+1 ? 'bg-amber-50 dark:bg-amber-500/10' : ''}`}>{line||' '}</div>
                ))}
              </pre>
            </div>
          </div>
          {result && threatLines.size>0 && <div className="px-4 py-3 border-t border-slate-200 dark:border-[#1f2e42] text-xs text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-500/10">{threatLines.size} line(s) flagged. Click a finding to highlight.</div>}
        </div>

        <div className="space-y-4">
          {!result && !loading && (
            <div className="rounded-2xl border border-dashed border-slate-200 dark:border-[#223041] bg-white/60 dark:bg-[#0f1720]/60 p-8 text-center">
              <div className="w-12 h-12 rounded-2xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 grid place-items-center mx-auto"><ShieldCheck className="w-6 h-6"/></div>
              <div className="text-sm font-semibold mt-3 text-slate-900 dark:text-white">Ready to Scan Code</div>
              <p className="text-sm text-slate-500 mt-1">Paste code or upload a file. Threats will be highlighted by line number after scanning.</p>
            </div>
          )}
          {loading && <div className="rounded-2xl border bg-white dark:bg-[#0f1720] border-slate-200 dark:border-[#1f2e42] p-6 space-y-3"><div className="h-24 rounded-xl bg-slate-100 dark:bg-[#0b1218] animate-pulse"/><div className="h-32 rounded-xl bg-slate-100 dark:bg-[#0b1218] animate-pulse"/></div>}
          {result && !loading && (
            <UnifiedScanResult
              scan={result}
              onFindingClick={(_id: string, line?: number) => line && setActiveLine(line)}
            />
          )}
        </div>
      </div>
    </div>
  )
}
