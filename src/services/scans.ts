import { api, isMockMode } from '../lib/api'
import { Scan } from '../mocks/data'
import { runScanPipeline } from '../lib/engine'
import { loadScansSeed, saveScans, addScanToStore } from '../lib/persistence'
import { getMockScans as getSeedScans } from '../mocks/data'

// Ensure store is seeded from initial mock data if empty
function getStore(): Scan[] {
  const seed = getSeedScans()
  return loadScansSeed(seed)
}

export async function scanText(payload: { content: string; source: string }): Promise<Scan> {
  if (isMockMode()) {
    // small delay for realism but not artificial
    await new Promise(r=>setTimeout(r, 520))
    const scan = runScanPipeline(payload.content, 'Text', payload.source as Scan['source'])
    addScanToStore(scan)
    return scan
  }
  const { data } = await api.post('/scans/text', payload)
  // also mirror to local store for immediate UI reflection if backend doesn't push back
  try { addScanToStore(data as Scan) } catch (e) { void e }
  return data
}

export async function scanCode(payload: { content: string; language: string; source?: string }): Promise<Scan> {
  if (isMockMode()) {
    await new Promise(r=>setTimeout(r, 620))
    const scan = runScanPipeline(payload.content, 'Code', 'FILE_UPLOAD')
    scan.language = payload.language
    addScanToStore(scan)
    return scan
  }
  const { data } = await api.post('/scans/code', payload)
  try { addScanToStore(data as Scan) } catch (e) { void e }
  return data
}

export async function scanImage(payload: { fileName: string; base64?: string; extractedText?: string }): Promise<Scan> {
  if (isMockMode()) {
    await new Promise(r=>setTimeout(r, 820))
    let extracted = payload.extractedText
    if (!extracted && payload.base64) {
      const fn = payload.fileName.toLowerCase()
      if (fn.includes('secret') || fn.includes('key') || fn.includes('whiteboard')) extracted = `Whiteboard photo: prod api key = ghp_xxx1234567890abcdef and meeting notes (${payload.fileName})`
      else if (fn.includes('code') || fn.includes('screen')) extracted = `Screenshot text: const apiKey = 'stripe_sec_key_sample_51H8xXxAbCdEfGhIj' // from ${payload.fileName}`
      else extracted = `OCR extracted text from ${payload.fileName}: no sensitive content detected`
    }
    extracted = extracted || `OCR extracted text from ${payload.fileName}`
    const scan = runScanPipeline(extracted, 'Image', 'IMAGE_OCR', extracted)
    if (payload.base64) {
      try {
        const mime = payload.fileName.endsWith('.png') ? 'image/png' : 'image/jpeg'
        scan.imageUrl = `data:${mime};base64,${payload.base64}`
      } catch (e) { void e }
    }
    addScanToStore(scan)
    return scan
  }
  const { data } = await api.post('/scans/image', payload)
  try { addScanToStore(data as Scan) } catch (e) { void e }
  return data
}

export async function getScans(params?: Record<string, unknown>): Promise<Scan[]> {
  if (isMockMode()) {
    let list = getStore()
    if (params?.search) {
      const q = String(params.search).toLowerCase()
      list = list.filter(s=> s.id.toLowerCase().includes(q) || (s.original||'').toLowerCase().includes(q) || (s.sanitized||'').toLowerCase().includes(q) || (s.extractedText||'').toLowerCase().includes(q))
    }
    if (params?.inputType && params.inputType!=='All') list = list.filter(s=> s.inputType===params.inputType)
    if (params?.decision && params.decision!=='All') list = list.filter(s=> s.decision===params.decision)
    if (params?.severity && params.severity!=='All') list = list.filter(s=> s.severity===params.severity)
    if (params?.source && params.source!=='All') list = list.filter(s=> s.source===params.source)
    if (params?.dateFrom) {
      const from = new Date(params.dateFrom as string).getTime()
      list = list.filter(s=> new Date(s.timestamp).getTime() >= from)
    }
    if (params?.dateTo) {
      const to = new Date(params.dateTo as string).getTime()
      list = list.filter(s=> new Date(s.timestamp).getTime() <= to)
    }
    if (params?.range && params.range!=='All') {
      const now = Date.now()
      let cutoff = 0
      if (params.range==='24H') cutoff = now - 24*3600*1000
      else if (params.range==='7D') cutoff = now - 7*86400000
      else if (params.range==='30D') cutoff = now - 30*86400000
      else if (params.range==='90D') cutoff = now - 90*86400000
      if (cutoff) list = list.filter(s=> new Date(s.timestamp).getTime() >= cutoff)
    }
    return list.sort((a,b)=> +new Date(b.timestamp)- +new Date(a.timestamp))
  }
  const { data } = await api.get('/scans', { params })
  return Array.isArray(data) ? data : (data.items || [])
}

export async function getScanById(id: string): Promise<Scan | null> {
  if (isMockMode()) {
    const list = getStore()
    return list.find(s=>s.id===id) || null
  }
  const { data } = await api.get(`/scans/${id}`)
  return data
}

export async function healthCheck(): Promise<{ status: string; latencyMs: number }>{
  if (isMockMode()) {
    const base = (()=>{ try{ return localStorage.getItem('lg-api-base')}catch{return null}})()
    if (base && base.trim()) return { status: 'mock', latencyMs: 18 }
    return { status: 'ok', latencyMs: 22 }
  }
  const start = Date.now()
  try {
    const { data } = await api.get('/health')
    return { status: data.status || 'ok', latencyMs: Date.now()-start }
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'Health check failed'
    throw new Error(msg)
  }
}

// utility for clearing old scans via retention
// eslint-disable-next-line @typescript-eslint/no-unused-vars
function _unusedSaveScans(s: Scan[]){ saveScans(s) }
