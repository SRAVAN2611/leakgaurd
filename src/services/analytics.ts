import { api, isMockMode } from '../lib/api'
import { Scan } from '../mocks/data'
import { loadScansSeed } from '../lib/persistence'
import { getMockScans } from '../mocks/data'

function computeAnalytics(scans: Scan[], range: string, custom?: { from?: string; to?: string }){
  let filtered = [...scans]
  const now = Date.now()
  if (range==='24H') filtered = filtered.filter(s=> now - new Date(s.timestamp).getTime() <= 24*3600*1000)
  else if (range==='7D') filtered = filtered.filter(s=> now - new Date(s.timestamp).getTime() <= 7*86400000)
  else if (range==='30D') filtered = filtered.filter(s=> now - new Date(s.timestamp).getTime() <= 30*86400000)
  else if (range==='90D') filtered = filtered.filter(s=> now - new Date(s.timestamp).getTime() <= 90*86400000)
  else if (range==='Custom' && custom) {
    if (custom.from) filtered = filtered.filter(s=> new Date(s.timestamp).getTime() >= new Date(custom.from!).getTime())
    if (custom.to) filtered = filtered.filter(s=> new Date(s.timestamp).getTime() <= new Date(custom.to!).getTime())
  }

  // trend buckets
  const bucketCount = range==='24H' ? 24 : range==='7D' ? 7 : range==='30D' ? 30 : range==='90D' ? 30 : Math.min(30, Math.max(7, filtered.length || 7))
  const is24H = range==='24H'
  const trendMap = new Map<string, { scans: number; blocked: number; highRisk: number }>()
  const trendKeys: string[] = []
  if (is24H) {
    for (let i=23;i>=0;i--) {
      const d = new Date(now - i*3600*1000)
      const key = d.toLocaleTimeString('en-US',{hour:'2-digit'}) // e.g. 02 PM
      trendKeys.push(key)
      trendMap.set(key, { scans:0, blocked:0, highRisk:0 })
    }
    filtered.forEach(s=>{
      const diffH = Math.floor((now - new Date(s.timestamp).getTime())/3600000)
      if (diffH>=0 && diffH <24) {
        const idx = 23 - diffH
        const key = trendKeys[idx]
        const v = trendMap.get(key)!
        v.scans++
        if (s.decision==='BLOCK') v.blocked++
        if (s.severity==='High' || s.severity==='Critical') v.highRisk++
      }
    })
  } else {
    for (let i=bucketCount-1;i>=0;i--) {
      const d = new Date(now - i*86400000)
      const key = d.toLocaleDateString('en-US',{month:'short', day:'numeric'})
      trendKeys.push(key)
      trendMap.set(key, { scans:0, blocked:0, highRisk:0 })
    }
    filtered.forEach(s=>{
      const dayDiff = Math.floor((now - new Date(s.timestamp).getTime())/86400000)
      if (dayDiff>=0 && dayDiff < bucketCount) {
        const idx = bucketCount-1 - dayDiff
        const key = trendKeys[idx]
        const v = trendMap.get(key)!
        v.scans++
        if (s.decision==='BLOCK') v.blocked++
        if (s.severity==='High' || s.severity==='Critical') v.highRisk++
      }
    })
  }
  const trend = trendKeys.map(k=> ({ date: k, scans: trendMap.get(k)!.scans, blocked: trendMap.get(k)!.blocked, highRisk: trendMap.get(k)!.highRisk }))

  // categories ranked by detection count
  const catCount: Record<string, number> = {}
  filtered.forEach(s=> s.findings.forEach(f=> { catCount[f.category] = (catCount[f.category]||0)+1 }))
  const threatCategories = Object.entries(catCount).map(([name,value])=>({ name, value })).sort((a,b)=> b.value-a.value)
  // ensure at least top categories show even if zero?
  if (threatCategories.length===0) {
    // show zeroed categories for empty state handling (charts handle empty)
  } else {
    // fill missing categories with zero? not needed
  }

  // severity distribution as percent
  const sevCounts: Record<string, number> = { Low:0, Medium:0, High:0, Critical:0 }
  filtered.forEach(s=> { sevCounts[s.severity] = (sevCounts[s.severity]||0)+1 })
  const totalSev = filtered.length || 1
  const severityDist = (['Low','Medium','High','Critical'] as const).map(k=> ({ name:k, value: filtered.length ? Math.round((sevCounts[k]/totalSev)*100) : 0, count: sevCounts[k] }))

  // input type distribution percent
  const typeCounts: Record<string, number> = { Text:0, Code:0, Image:0 }
  filtered.forEach(s=> { typeCounts[s.inputType] = (typeCounts[s.inputType]||0)+1 })
  const totalType = filtered.length || 1
  const inputTypeDist = (['Text','Code','Image'] as const).map(k=> ({ name:k, value: filtered.length ? Math.round((typeCounts[k]/totalType)*100) : 0, count: typeCounts[k] }))

  // decisions percent
  const decCounts: Record<string, number> = { ALLOW:0, WARN:0, REDACT:0, BLOCK:0 }
  filtered.forEach(s=> { decCounts[s.decision] = (decCounts[s.decision]||0)+1 })
  const decisions = (['ALLOW','WARN','REDACT','BLOCK'] as const).map(k=> ({ name:k, value: filtered.length ? Math.round((decCounts[k]/totalType)*100) : 0, count: decCounts[k] }))

  // avg processing time by input type
  const procSum: Record<string, { sum:number; cnt:number }> = { Text:{sum:0,cnt:0}, Code:{sum:0,cnt:0}, Image:{sum:0,cnt:0} }
  filtered.forEach(s=> { if(procSum[s.inputType]){ procSum[s.inputType].sum+=s.processingTimeMs; procSum[s.inputType].cnt++ } })
  const avgProcessing = (['Text','Code','Image'] as const).map(k=> ({ type:k, ms: procSum[k].cnt ? Math.round(procSum[k].sum/procSum[k].cnt) : 0 }))

  return { trend, threatCategories, severityDist, inputTypeDist, decisions, avgProcessing, total: filtered.length, filteredScans: filtered }
}

export async function getAnalytics(range: string, custom?: { from?: string; to?: string }){
  if (isMockMode()) {
    const seed = (()=>{
      try {
        const stored = loadScansSeed(getMockScans())
        return stored
      } catch { return getMockScans() }
    })()
    return computeAnalytics(seed, range, custom)
  }
  try {
    const { data: resp } = await api.get('/scans')
    const items = Array.isArray(resp) ? resp : (resp.items || [])
    return computeAnalytics(items, range, custom)
  } catch (err) {
    void err
    const seed = getMockScans()
    return computeAnalytics(seed, range, custom)
  }
}

export function computeAnalyticsLocal(range: string, scans: Scan[]){
  return computeAnalytics(scans, range)
}
