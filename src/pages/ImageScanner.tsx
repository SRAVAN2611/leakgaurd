import { useState, useRef } from 'react'
import { PageHeader } from '../components/common/PageHeader'
import { UnifiedScanResult } from '../components/common/UnifiedScanResult'
import { scanImage } from '../services/scans'
import { Scan } from '../mocks/data'
import { useToast } from '../context/ToastContext'
import { Upload, Image as ImageIcon, Loader2, ShieldCheck, X } from 'lucide-react'

export default function ImageScanner(){
  const [file, setFile] = useState<File|null>(null)
  const [preview, setPreview] = useState<string|null>(null)
  const [result, setResult] = useState<Scan|null>(null)
  const [loading, setLoading] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const { push } = useToast()

  const onFile = (f: File)=>{
    if(!['image/png','image/jpeg','image/jpg'].includes(f.type)) return push({ title:'Unsupported format', desc:'Use PNG, JPG or JPEG', variant:'error' })
    setFile(f)
    const r = new FileReader()
    r.onload = ()=> setPreview(String(r.result))
    r.readAsDataURL(f)
    setResult(null)
  }
  const onDrop = (e: React.DragEvent)=>{ e.preventDefault(); if(e.dataTransfer.files[0]) onFile(e.dataTransfer.files[0]) }

  const analyze = async ()=>{
    if(!file || !preview) return push({ title:'Image required', variant:'error' })
    setLoading(true)
    try{
      const base64 = preview.split(',')[1] || ''
      const r = await scanImage({ fileName: file.name, base64 })
      r.imageUrl = preview
      if(!r.extractedText) r.extractedText = "OCR extracted text from " + file.name
      setResult(r)
      push({ title:`Scan ${r.decision}`, desc:`Risk ${r.riskScore}`, variant: r.decision==='BLOCK'?'error':'info' })
    }catch(e: unknown){
      const msg = e instanceof Error ? e.message : 'Scan failed'
      push({ title:'Scan failed', desc: msg, variant:'error' })
    }
    finally{ setLoading(false) }
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Image Scanner" subtitle="OCR-based text extraction and security analysis for screenshots, photos and documents"/>
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 items-start">
        <div className="space-y-4">
          <div onDragOver={e=>e.preventDefault()} onDrop={onDrop} className="rounded-2xl border-2 border-dashed bg-white dark:bg-[#0f1720] p-6 text-center hover:border-slate-300 dark:hover:border-[#2a3a52] transition" style={{ borderColor: preview ? '#0f172a' : undefined }}>
            {!preview ? (
              <>
                <div className="w-14 h-14 rounded-2xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 grid place-items-center mx-auto"><ImageIcon className="w-7 h-7"/></div>
                <div className="text-sm font-semibold text-slate-900 dark:text-white mt-3">Drag & drop an image here</div>
                <p className="text-xs text-slate-500 mt-1">PNG, JPG, JPEG up to 10MB. OCR will extract text and analyze for secrets.</p>
                <div className="mt-4 flex justify-center gap-2">
                  <button onClick={()=>inputRef.current?.click()} className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-sm font-semibold"><Upload className="w-4 h-4"/>Browse Files</button>
                </div>
              </>
            ) : (
              <div className="text-left">
                <div className="flex items-center justify-between mb-3">
                  <div className="text-sm font-semibold text-slate-900 dark:text-white">Image Preview</div>
                  <button onClick={()=>{ setFile(null); setPreview(null); setResult(null)}} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border bg-white dark:bg-[#0b1218] border-slate-200 dark:border-[#1e2e42] text-xs font-semibold"><X className="w-3.5 h-3.5"/>Remove</button>
                </div>
                <div className="rounded-xl overflow-hidden border border-slate-200 dark:border-[#1e2e42] bg-slate-50 dark:bg-[#0b1218]">
                  <img src={preview} alt="Preview" className="w-full max-h-[360px] object-contain mx-auto"/>
                </div>
                <div className="text-xs text-slate-500 mt-2">{file?.name} • {(file!.size/1024).toFixed(1)} KB</div>
                <button onClick={analyze} disabled={loading} className="mt-4 w-full inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-sm font-bold disabled:opacity-50">{loading ? <><Loader2 className="w-4 h-4 animate-spin"/>Analyzing image...</> : <><ShieldCheck className="w-4 h-4"/>Analyze Image</>}</button>
                <p className="text-[11px] text-slate-500 text-center mt-2">OCR + security analysis runs server-side.</p>
              </div>
            )}
            <input ref={inputRef} type="file" accept="image/png,image/jpeg,image/jpg" className="hidden" onChange={e=> e.target.files && onFile(e.target.files[0])}/>
          </div>
          {!preview && (
            <div className="rounded-2xl border bg-sky-50 dark:bg-sky-500/10 border-sky-200 dark:border-sky-500/20 p-4">
              <div className="text-xs font-bold text-sky-800 dark:text-sky-300">How it works</div>
              <p className="text-xs text-sky-700 dark:text-sky-300/80 mt-1 leading-relaxed">We run OCR to extract text from the image, then scan the extracted content for PII, credentials, API keys and prompt injection patterns. Detections include position data when available.</p>
            </div>
          )}
        </div>

        <div className="space-y-4">
          {!result && !loading && (
            <div className="rounded-2xl border border-dashed border-slate-200 dark:border-[#223041] bg-white/60 dark:bg-[#0f1720]/60 p-10 text-center">
              <div className="w-12 h-12 rounded-2xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 grid place-items-center mx-auto"><ShieldCheck className="w-6 h-6"/></div>
              <div className="text-sm font-semibold mt-3 text-slate-900 dark:text-white">Ready to Analyze Image</div>
              <p className="text-sm text-slate-500 mt-1">Upload an image to see OCR text, findings and risk summary here.</p>
            </div>
          )}
          {loading && <div className="rounded-2xl border bg-white dark:bg-[#0f1720] border-slate-200 dark:border-[#1f2e42] p-6 space-y-3"><div className="h-40 rounded-xl bg-slate-100 dark:bg-[#0b1218] animate-pulse"/><div className="h-20 rounded-xl bg-slate-100 dark:bg-[#0b1218] animate-pulse"/></div>}
          {result && !loading && (
            <UnifiedScanResult scan={result} />
          )}
        </div>
      </div>
    </div>
  )
}
