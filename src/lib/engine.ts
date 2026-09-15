import { Finding, Scan } from '../mocks/data'
import { loadPoliciesSeed, loadSettings, AppSettings } from './persistence'
import { mockPolicies } from '../mocks/data'

// Centralized risk config

export const RISK_CONFIG = {
  levels: [
    { label: 'Low' as const, min: 0, max: 24 },
    { label: 'Medium' as const, min: 25, max: 49 },
    { label: 'High' as const, min: 50, max: 74 },
    { label: 'Critical' as const, min: 75, max: 100 },
  ],
  precedence: ['BLOCK','REDACT','WARN','ALLOW'] as const,
}

export function getSeverityFromScore(score: number): Scan['severity'] {
  if (score >= 75) return 'Critical'
  if (score >= 50) return 'High'
  if (score >= 25) return 'Medium'
  return 'Low'
}

type DetectContext = {
  settings: AppSettings
  language?: string
}

function maskValue(raw: string, visible = 4): string {
  if (raw.length <= visible) return '•'.repeat(raw.length)
  return raw.slice(0, visible) + '•'.repeat(Math.min(raw.length - visible, 12))
}

function makeFinding(partial: Omit<Finding,'id'> & { id?: string }): Finding {
  return { id: partial.id || ('f_'+Math.random().toString(36).slice(2,8)), ...partial }
}

export function detectThreats(content: string, ctx: DetectContext): Finding[] {
  const findings: Finding[] = []
  const s = ctx.settings
  // sensitivity affects confidence thresholds: higher sensitivity -> more findings at lower confidence
  // We keep detetor logic simple but tag confidence.
  const sens = s.sensitivity / 100 // 0..1

  // PII - emails, SSN, phone, credit card
  if (s.pii) {
    const emailRe = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b/g
    const emails = content.match(emailRe) || []
    emails.slice(0,3).forEach(m => {
      findings.push(makeFinding({
        category:'PII', severity:'High', confidence: 0.92 + sens*0.05,
        detector:'pii-detector-v2', maskedEvidence: maskValue(m, 2),
        explanation:'Email address detected — personally identifiable information.',
        location:'text'
      }))
    })
    const ssnRe = /\b\d{3}-\d{2}-\d{4}\b/g
    const ssns = content.match(ssnRe) || []
    ssns.slice(0,2).forEach(m=>{
      findings.push(makeFinding({
        category:'PII', severity:'Critical', confidence:0.97,
        detector:'pii-detector-v2', maskedEvidence: maskValue(m,3),
        explanation:'US Social Security Number detected. Highly sensitive PII.',
        location:'text'
      }))
    })
    const phoneRe = /\b(?:\+?1[ .-]?)?\(?\d{3}\)?[ .-]?\d{3}[ .-]?\d{4}\b/g
    const phones = content.match(phoneRe) || []
    // avoid double counting SSN as phone: filtered length 10 without dashes
    phones.slice(0,2).forEach(m=>{
      if (!ssnRe.test(m)) findings.push(makeFinding({
        category:'PII', severity:'Medium', confidence:0.78 + sens*0.1,
        detector:'pii-detector-v2', maskedEvidence: maskValue(m,3),
        explanation:'Phone number detected — PII.',
        location:'text'
      }))
    })
    const ccRe = /\b(?:\d[ -]*?){13,16}\b/g
    // heuristic: skip too broad, only if contains 16 digits
    const ccCandidates = (content.match(/\b\d{4}[ -]?\d{4}[ -]?\d{4}[ -]?\d{4}\b/g)||[])
    ccCandidates.slice(0,1).forEach(m=>{
      findings.push(makeFinding({
        category:'PII', severity:'Critical', confidence:0.88,
        detector:'pii-detector-v2', maskedEvidence: maskValue(m,4),
        explanation:'Potential credit card number detected.',
        location:'text'
      }))
    })
  }

  // Secrets / API Keys
  if (s.secrets) {
    const patterns: Array<{ re: RegExp, category: string, severity: Finding['severity'], detector: string, expl: string, maskLen?: number }> = [
      { re: /AKIA[0-9A-Z]{16}/g, category:'API Keys', severity:'Critical', detector:'secret-scanner', expl:'AWS Access Key ID detected.' },
      { re: /stripe_sec_key_sample_[A-Za-z0-9]{10,}/g, category:'API Keys', severity:'Critical', detector:'code-secret', expl:'Stripe live secret key detected.' },
      { re: /stripe_sec_key_sample_[A-Za-z0-9]{10,}/g, category:'API Keys', severity:'High', detector:'code-secret', expl:'Stripe test secret key detected.' },
      { re: /ghp_[A-Za-z0-9]{20,}/g, category:'API Keys', severity:'Critical', detector:'secret-scanner', expl:'GitHub Personal Access Token detected.' },
      { re: /xox[bpras]-[A-Za-z0-9-]{10,}/g, category:'API Keys', severity:'High', detector:'secret-scanner', expl:'Slack token detected.' },
      { re: /-----BEGIN (RSA )?PRIVATE KEY-----/g, category:'Private Keys', severity:'Critical', detector:'crypto-scanner', expl:'PEM private key header detected.' },
      { re: /eyJ[A-Za-z0-9_-]{10,}\.eyJ[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]+/g, category:'JWT Tokens', severity:'Critical', detector:'jwt-detector', expl:'JWT / access token detected.' },
      { re: /postgres:\/\/[^\s"'`,;]+/gi, category:'Database Secrets', severity:'Critical', detector:'conn-string', expl:'PostgreSQL connection string with credentials.' },
      { re: /mongodb:\/\/[^\s"'`,;]+/gi, category:'Database Secrets', severity:'Critical', detector:'conn-string', expl:'MongoDB connection URI with credentials.' },
      { re: /mysql:\/\/[^\s"'`,;]+/gi, category:'Database Secrets', severity:'Critical', detector:'conn-string', expl:'MySQL connection string with credentials.' },
      { re: /\bpassword\s*[:=]\s*["']?[^"'\s\n]{4,}/gi, category:'Passwords', severity:'High', detector:'entropy-check', expl:'Hardcoded password assignment detected.' },
      { re: /\bapi[_-]?key\s*[:=]\s*["']?[A-Za-z0-9_\-]{12,}["']?/gi, category:'API Keys', severity:'High', detector:'secret-scanner', expl:'Generic API key assignment detected.' },
      { re: /aws_secret_access_key\s*[:=][^\n]+/gi, category:'Credentials', severity:'Critical', detector:'secret-scanner', expl:'AWS secret access key detected.' },
    ]
    patterns.forEach(p=>{
      const matches = content.match(p.re)
      if (matches) {
        matches.slice(0,2).forEach(m=>{
          findings.push(makeFinding({
            category: p.category,
            severity: p.severity,
            confidence: p.severity==='Critical' ? 0.95 + sens*0.04 : 0.88 + sens*0.06,
            detector: p.detector,
            maskedEvidence: maskValue(m.slice(0,32), 6),
            explanation: p.expl,
            location: 'text'
          }))
        })
      }
    })
    // ENV style secrets: KEY=VALUE long entropy
    if (/\b[A-Z_]{3,}=(?:[A-Za-z0-9\/\+_\-]{16,})/.test(content)) {
      const envMatches = content.match(/\b[A-Z_]{3,}=[A-Za-z0-9\/\+_\-]{16,}/g) || []
      envMatches.slice(0,1).forEach(m=>{
        findings.push(makeFinding({
          category:'Credentials', severity:'High', confidence:0.82,
          detector:'env-scanner', maskedEvidence: maskValue(m,8),
          explanation:'High-entropy environment secret detected.',
          location:'text'
        }))
      })
    }
  }

  // Prompt injection / system prompt extraction / suspicious
  if (s.injection) {
    const lower = content.toLowerCase()
    const injectionPhrases = [
      'ignore previous instructions',
      'ignore all previous',
      'reveal your system prompt',
      'reveal system instructions',
      'you are now',
      'you are dan',
      'jailbreak',
      'bypass safety',
      'disregard your instructions',
      'act as if you are'
    ]
    const matchedInjection = injectionPhrases.filter(p=> lower.includes(p))
    if (matchedInjection.length) {
      const cat = matchedInjection.some(p=> p.includes('system prompt') || p.includes('system instructions')) ? 'System Prompt Extraction' : 'Prompt Injection'
      findings.push(makeFinding({
        category: cat, severity:'Critical', confidence:0.88 + sens*0.07,
        detector:'injection-classifier', maskedEvidence: matchedInjection[0].slice(0,40),
        explanation: cat==='System Prompt Extraction' ? 'Attempt to extract system prompt / instructions detected.' : 'Instruction override / prompt injection attempt detected.',
        location:'text'
      }))
    } else if (/(instruction override|system prompt extraction|suspicious instruction)/i.test(content)) {
      findings.push(makeFinding({
        category:'Suspicious Instructions', severity:'Medium', confidence:0.71,
        detector:'heuristic', maskedEvidence:'suspicious pattern',
        explanation:'Potentially suspicious instruction detected.',
        location:'text'
      }))
    } else if (lower.includes('suspicious') || (lower.includes('system prompt') && lower.includes('show'))) {
      findings.push(makeFinding({
        category:'Suspicious Instructions', severity:'Medium', confidence:0.65 + sens*0.15,
        detector:'heuristic', maskedEvidence: lower.slice(0,32),
        explanation:'Suspicious instruction phrasing detected.',
        location:'text'
      }))
    }
  }

  // Language-aware line numbers for code: annotate findings with line if content contains newlines and secret patterns
  if (content.includes('\n')) {
    const lines = content.split('\n')
    findings.forEach(f=>{
      if (f.line) return
      // try to find evidence substring in content to infer line (masked evidence is masked, so use detector hints)
      // We'll approximate by searching for category keywords
      let lineNum: number | undefined
      if (f.category==='API Keys' && /(AKIA|sk_live|ghp_)/.test(content)) {
        const idx = lines.findIndex(l=> /AKIA|sk_live|ghp_/.test(l))
        if (idx>=0) lineNum = idx+1
      }
      if (f.category==='Database Secrets' && /postgres:\/\/|mongodb:\/\//i.test(content)) {
        const idx = lines.findIndex(l=> /postgres:\/\/|mongodb:\/\//i.test(l))
        if (idx>=0) lineNum = idx+1
      }
      if (f.category==='Private Keys' && /PRIVATE KEY/.test(content)) {
        const idx = lines.findIndex(l=> /PRIVATE KEY/.test(l))
        if (idx>=0) lineNum = idx+1
      }
      if (lineNum) f.line = lineNum
      if (!f.location && f.line) f.location = `line ${f.line}`
    })
  }

  // Deduplicate by category+maskedEvidence
  const dedup = new Map<string, Finding>()
  findings.forEach(f=> {
    const key = f.category+':'+f.maskedEvidence
    if (!dedup.has(key)) dedup.set(key,f)
  })
  let unique = Array.from(dedup.values())
  // Sensitivity filtering: at low sensitivity, drop low-confidence Medium findings
  if (sens < 0.45) {
    unique = unique.filter(f=> !(f.severity==='Medium' && f.confidence < 0.75))
  }
  // Limit to 6 findings max for UX
  return unique.slice(0,6)
}

export function calculateRisk(findings: Finding[], settings: AppSettings): number {
  if (findings.length===0) {
    // baseline low risk 4-12 randomized but deterministic enough
    return Math.floor(6 + Math.random()*6)
  }
  const sevScore: Record<string, number> = { Low: 5, Medium: 13, High: 22, Critical: 32 }
  let score = 8
  findings.forEach(f=>{
    let base = sevScore[f.severity] ?? 10
    // confidence scales contribution
    base = base * (0.7 + f.confidence * 0.3)
    // category weighting
    const catWeight: Record<string, number> = {
      'Private Keys': 1.2,
      'JWT Tokens': 1.15,
      'API Keys': 1.15,
      'Database Secrets': 1.15,
      'Prompt Injection': 1.1,
      'System Prompt Extraction': 1.1,
      'PII': 1.0,
      'Credentials': 1.05,
      'Passwords': 1.05,
    }
    base = base * (catWeight[f.category] ?? 1.0)
    score += base
  })
  // count penalty
  score += Math.min(findings.length * 2.5, 10)
  // strict mode bumps risk
  if (settings.strictMode) score += 10
  // sensitivity nudges risk up slightly
  score += (settings.sensitivity - 70) * 0.08

  score = Math.round(Math.min(99, Math.max(4, score)))
  return score
}

export function evaluatePolicies(findings: Finding[], riskScore: number, severity: Scan['severity']): { decision: Scan['decision'], matchedPolicyIds: string[], reason: string } {
  // Load active policies from persistence (fallback to seed)
  let policies: any[] = []
  try { policies = loadPoliciesSeed(mockPolicies as any) } catch { policies = mockPolicies as any }
  const enabled = policies.filter(p=> p.enabled)
  // Find matching policies: category matches finding category OR General matches any
  const matched: any[] = []
  findings.forEach(f=>{
    enabled.forEach(p=>{
      const catMatch = p.category === f.category || p.category === 'General' || (p.category==='Credentials and Secrets' && ['Credentials','API Keys','Passwords'].includes(f.category))
      const sevMatch = (()=>{
        const order: Record<string, number> = { Low:1, Medium:2, High:3, Critical:4 }
        const pSev = order[p.severity] ?? 1
        const fSev = order[f.severity] ?? 1
        return fSev >= pSev
      })()
      if (catMatch && sevMatch) {
        if (!matched.find(m=> m.id===p.id)) matched.push(p)
      }
    })
  })
  // If no findings but low risk, check Allow Low Risk general policy
  if (findings.length===0) {
    const allowLow = enabled.find(p=> p.category==='General' && p.action==='ALLOW')
    if (allowLow && !matched.find(m=>m.id===allowLow.id)) matched.push(allowLow)
  }

  // Precedence: BLOCK > REDACT > WARN > ALLOW (safer wins)
  const order: Record<string, number> = { BLOCK:4, REDACT:3, WARN:2, ALLOW:1 }
  let decision: Scan['decision'] = findings.length===0 ? 'ALLOW' : (severity==='Critical' ? 'BLOCK' : severity==='High' ? 'REDACT' : severity==='Medium' ? 'WARN' : 'ALLOW')
  // If any matched policy exists, override with highest precedence matched action
  if (matched.length) {
    matched.sort((a,b)=> (order[b.action]??0) - (order[a.action]??0))
    decision = matched[0].action as Scan['decision']
  }
  // Auto-redact low severity setting: upgrade ALLOW/WARN on low findings to REDACT
  try {
    const s = loadSettings()
    if (s.autoRedactLow && findings.length>0 && (decision==='ALLOW' || decision==='WARN')) {
      // if any low/medium findings and auto-redact on, upgrade to REDACT
      decision = 'REDACT'
    }
  } catch {}

  const reason = matched.length
    ? `Matched ${matched.length} policy(ies): ${matched.map(m=> `${m.name} (${m.action})`).join(', ')}. Risk ${riskScore} (${severity}).`
    : `No policy matched; decision derived from risk score ${riskScore} (${severity}) and ${findings.length} finding(s).`

  return { decision, matchedPolicyIds: matched.map(m=> m.id), reason }
}

export function sanitizeContent(original: string, findings: Finding[], decision: Scan['decision']): string {
  if (decision==='BLOCK') return '[BLOCKED: Content withheld per security policy]'
  if (!findings.length) return original
  let out = original
  // Apply redactions for sensitive categories
  const redactedCategories = ['PII','API Keys','Credentials','Passwords','JWT Tokens','Private Keys','Database Secrets','Credentials and Secrets']
  const toRedact = findings.filter(f=> redactedCategories.includes(f.category))
  // Simple pattern redactions — replace actual secrets not maskedEvidence
  const patterns: Array<{ re: RegExp, label: string }> = [
    { re: /AKIA[0-9A-Z]{16}/g, label: '[REDACTED API KEY]' },
    { re: /stripe_sec_key_sample_[A-Za-z0-9]+/g, label: '[REDACTED_API_KEY]' },
    { re: /stripe_sec_key_sample_[A-Za-z0-9]+/g, label: '[REDACTED_API_KEY]' },
    { re: /ghp_[A-Za-z0-9]{20,}/g, label: '[REDACTED GITHUB TOKEN]' },
    { re: /xox[bpras]-[A-Za-z0-9-]{10,}/g, label: '[REDACTED SLACK TOKEN]' },
    { re: /-----BEGIN (?:RSA )?PRIVATE KEY-----[\s\S]*?-----END (?:RSA )?PRIVATE KEY-----/g, label: '[REDACTED PRIVATE KEY]' },
    { re: /eyJ[A-Za-z0-9_-]+\.eyJ[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+/g, label: '[REDACTED JWT]' },
    { re: /postgres:\/\/[^\s"'`,;]+/gi, label: '[REDACTED CONNECTION STRING]' },
    { re: /mongodb:\/\/[^\s"'`,;]+/gi, label: '[REDACTED CONNECTION STRING]' },
    { re: /mysql:\/\/[^\s"'`,;]+/gi, label: '[REDACTED CONNECTION STRING]' },
    { re: /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b/g, label: '[REDACTED EMAIL]' },
    { re: /\b\d{3}-\d{2}-\d{4}\b/g, label: '[REDACTED SSN]' },
    { re: /\b\d{4}[ -]?\d{4}[ -]?\d{4}[ -]?\d{4}\b/g, label: '[REDACTED CARD]' },
    { re: /\bpassword\s*[:=]\s*["']?[^"'\s\n]+["']?/gi, label: 'password=[REDACTED]' },
  ]
  patterns.forEach(p=>{ out = out.replace(p.re, p.label) })
  // If still no change but redactions expected, fallback
  if (toRedact.length && out===original) {
    // generic redact long tokens
    out = out.replace(/[A-Za-z0-9_\-]{20,}/g, m=> m.length>24 ? '[REDACTED]' : m)
  }
  return out
}

// Unified scan pipeline

export function runScanPipeline(input: string, type: Scan['inputType'], source: Scan['source'], extractedText?: string): Scan {
  const settings = loadSettings()
  // respect detection toggles: if ocr disabled and image, skip? but still run with warning
  const contentForAnalysis = type==='Image' && extractedText ? extractedText : input
  const ctx: DetectContext = { settings, language: undefined }
  const findings = detectThreats(contentForAnalysis, ctx)
  // Adjust findings for image location
  if (type==='Image') {
    findings.forEach(f=> { if (!f.location) f.location = 'image OCR region' })
  }
  const riskScore = calculateRisk(findings, settings)
  const severity = getSeverityFromScore(riskScore)
  const { decision, matchedPolicyIds, reason } = evaluatePolicies(findings, riskScore, severity)
  const sanitized = sanitizeContent(contentForAnalysis, findings, decision)
  const id = 'sc_' + Math.random().toString(36).slice(2,10)
  const scan: Scan = {
    id,
    timestamp: new Date().toISOString(),
    inputType: type,
    source,
    threatCount: findings.length,
    riskScore,
    severity,
    decision,
    processingTimeMs: Math.floor(180 + Math.random()*220 + (type==='Image'?600:0) + (type==='Code'?80:0)),
    findings,
    original: type==='Image' ? (extractedText || input) : input,
    sanitized: type==='Image' ? sanitized : sanitized,
    extractedText: type==='Image' ? (extractedText || contentForAnalysis) : undefined,
    imageUrl: undefined,
    // extended fields for reasoning/policy
    decisionReason: reason,
    matchedPolicies: matchedPolicyIds,
  } as Scan & { decisionReason: string; matchedPolicies: string[] }
  return scan
}
