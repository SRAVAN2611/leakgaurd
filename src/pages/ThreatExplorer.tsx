import { useEffect, useState } from 'react'
import { PageHeader } from '../components/common/PageHeader'
import { getScans } from '../services/scans'
import { Scan, Finding } from '../mocks/data'
import { KeyRound, Fingerprint, FileKey2, Braces, Lock, Database, MessageSquareWarning, EyeOff, Bug, ChevronDown } from 'lucide-react'

interface CategoryDef {
  id: string
  aliases: string[]
  icon: any
  what: string
  why: string
  how: string
  action: string
}

const categories: CategoryDef[] = [
  { 
    id:'PII', 
    aliases: ['PII'], 
    icon:Fingerprint, 
    what:'Personally Identifiable Information such as SSN, emails, phone numbers, addresses.', 
    why:'Can identify individuals and violates privacy regulations (GDPR, CCPA).', 
    how:'Regex + NER models detect structured PII patterns with confidence scoring.', 
    action:'Redact before forwarding; enforce PII policy.' 
  },
  { 
    id:'Credentials', 
    aliases: ['CREDENTIALS', 'SECRETS', 'SECRET'], 
    icon:KeyRound, 
    what:'Generic secrets, passwords and tokens embedded in text or code.', 
    why:'Leakage enables account takeover.', 
    how:'Entropy analysis + secret scanners.', 
    action:'Block or redact; rotate leaked credentials.' 
  },
  { 
    id:'API Keys', 
    aliases: ['API_KEYS', 'API_KEY', 'API KEYS'], 
    icon:Braces, 
    what:'Provider keys (AWS, Stripe, GitHub, OpenAI).', 
    why:'Direct access to paid APIs and cloud resources.', 
    how:'Prefix signatures (AKIA, sk_live, ghp_) + validation.', 
    action:'Block critical keys immediately.' 
  },
  { 
    id:'Passwords', 
    aliases: ['PASSWORDS', 'PASSWORD'], 
    icon:Lock, 
    what:'Plaintext passwords in prompts or code.', 
    why:'Credential stuffing risk.', 
    how:'Keyword proximity + entropy.', 
    action:'Redact and require vault usage.' 
  },
  { 
    id:'JWT Tokens', 
    aliases: ['JWT_TOKENS', 'JWT_TOKEN', 'TOKENS', 'TOKEN', 'JWT TOKENS'], 
    icon:FileKey2, 
    what:'JSON Web Tokens (eyJ...).', 
    why:'Bearer authentication bypass.', 
    how:'Base64 JWT structure detection.', 
    action:'Block and expire tokens.' 
  },
  { 
    id:'Private Keys', 
    aliases: ['PRIVATE_KEYS', 'PRIVATE_KEY', 'PRIVATE KEYS'], 
    icon:FileKey2, 
    what:'PEM private keys (BEGIN PRIVATE KEY).', 
    why:'Full cryptographic compromise.', 
    how:'PEM header/footer detection.', 
    action:'Block and revoke keys.' 
  },
  { 
    id:'Database Secrets', 
    aliases: ['DATABASE_SECRETS', 'DATABASE_SECRET', 'DATABASE SECRETS', 'DATABASE_CREDENTIALS'], 
    icon:Database, 
    what:'Connection strings and DB credentials.', 
    why:'Direct database access.', 
    how:'URI pattern matching (postgres://, mongodb://).', 
    action:'Redact and rotate.' 
  },
  { 
    id:'Prompt Injection', 
    aliases: ['PROMPT_INJECTION', 'JAILBREAK', 'PROMPT INJECTION'], 
    icon:MessageSquareWarning, 
    what:'Instruction override attempts.', 
    why:'Bypasses LLM safety controls.', 
    how:'Classifier trained on injection patterns.', 
    action:'Warn or block; log for review.' 
  },
  { 
    id:'System Prompt Extraction', 
    aliases: ['SYSTEM_PROMPT_EXTRACTION', 'SYSTEM PROMPT EXTRACTION'], 
    icon:EyeOff, 
    what:'Attempts to reveal system prompts.', 
    why:'Exposes proprietary instructions.', 
    how:'Heuristic + classifier for extraction phrases.', 
    action:'Block and alert.' 
  },
  { 
    id:'Suspicious Instructions', 
    aliases: ['SUSPICIOUS_INSTRUCTIONS', 'SUSPICIOUS INSTRUCTIONS'], 
    icon:Bug, 
    what:'Unusual or potentially malicious instructions.', 
    why:'May lead to undesired behavior.', 
    how:'Anomaly detection on instruction semantics.', 
    action:'Warn for human review.' 
  },
]

export default function ThreatExplorer(){
  const [scans, setScans] = useState<Scan[]>([])
  const [open, setOpen] = useState<string>('API Keys')
  useEffect(()=>{ getScans({ pageSize: 200 }).then(setScans) },[])

  const isCategoryMatch = (fCategory: string | undefined, cat: CategoryDef) => {
    if (!fCategory) return false
    const norm = (s: string) => s.toUpperCase().replace(/[\s_-]+/g, '')
    const target = norm(fCategory)
    return cat.aliases.some(a => norm(a) === target) || norm(cat.id) === target
  }

  const stats = (cat: CategoryDef) => {
    const allFindings = scans.flatMap(s => (s.findings || []) as Finding[])
    const matching = allFindings.filter(f => isCategoryMatch(f.category, cat))
    return { 
      count: matching.length, 
      examples: matching.slice(0, 3) 
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Threat Explorer" subtitle="Understand each threat category, why it matters and how LeakGuard detects it"/>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 space-y-2">
          {categories.map(c=>{
            const { count } = stats(c)
            const Icon=c.icon
            const isOpen=open===c.id
            return (
              <button key={c.id} onClick={()=>setOpen(c.id)} className={`w-full text-left flex items-center gap-3 px-4 py-3 rounded-2xl border transition ${isOpen ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 border-slate-900 dark:border-white shadow' : 'bg-white dark:bg-[#0f1720] border-slate-200 dark:border-[#1f2e42] hover:bg-slate-50 dark:hover:bg-[#0b1218] text-slate-700 dark:text-slate-300'}`}>
                <span className={`w-8 h-8 rounded-xl grid place-items-center shrink-0 ${isOpen ? 'bg-white/15 dark:bg-slate-900/10' : 'bg-slate-100 dark:bg-[#0b1218]'}`}><Icon className="w-4 h-4"/></span>
                <span className="flex-1 text-sm font-semibold">{c.id}</span>
                <span className={`text-xs font-bold px-2 py-1 rounded-full ${isOpen ? 'bg-white/20 dark:bg-slate-900/10' : 'bg-slate-100 dark:bg-[#0b1218]'}`}>{count}</span>
                <ChevronDown className={`w-4 h-4 transition ${isOpen ? 'rotate-180' : ''}`}/>
              </button>
            )
          })}
        </div>
        <div className="lg:col-span-2">
          {categories.filter(c=>c.id===open).map(c=>{
            const { count, examples } = stats(c)
            const Icon=c.icon
            return (
              <div key={c.id} className="rounded-2xl border bg-white dark:bg-[#0f1720] border-slate-200 dark:border-[#1f2e42] overflow-hidden">
                <div className="p-6 border-b border-slate-200 dark:border-[#1f2e42]">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 grid place-items-center shrink-0"><Icon className="w-6 h-6"/></div>
                    <div>
                      <div className="text-lg font-bold text-slate-900 dark:text-white">{c.id}</div>
                      <div className="text-sm text-slate-600 dark:text-slate-400 mt-1 leading-relaxed">{c.what}</div>
                    </div>
                  </div>
                  <div className="mt-4 inline-flex items-center gap-2 text-xs font-bold px-3 py-1.5 rounded-full bg-slate-100 dark:bg-[#0b1218] border border-slate-200 dark:border-[#1e2e42] text-slate-700 dark:text-slate-300">{count} detections in history</div>
                </div>
                <div className="p-6 space-y-5">
                  <div>
                    <div className="text-xs font-bold tracking-widest text-slate-500 uppercase">Why dangerous</div>
                    <p className="text-sm text-slate-700 dark:text-slate-300 mt-1.5 leading-relaxed">{c.why}</p>
                  </div>
                  <div>
                    <div className="text-xs font-bold tracking-widest text-slate-500 uppercase">How LeakGuard detects it</div>
                    <p className="text-sm text-slate-700 dark:text-slate-300 mt-1.5 leading-relaxed">{c.how}</p>
                  </div>
                  <div>
                    <div className="text-xs font-bold tracking-widest text-slate-500 uppercase">Recommended action</div>
                    <p className="text-sm text-slate-700 dark:text-slate-300 mt-1.5 leading-relaxed">{c.action}</p>
                  </div>
                  {examples.length > 0 && (
                    <div className="space-y-3">
                      <div className="text-xs font-bold tracking-widest text-slate-500 uppercase">Real examples from history ({examples.length})</div>
                      {examples.map((ex, idx) => (
                        <div key={idx} className="rounded-xl border bg-slate-50 dark:bg-[#0b1218] border-slate-200 dark:border-[#1e2e42] p-4">
                          <div className="font-mono text-xs px-3 py-2 rounded-xl bg-white dark:bg-[#0f1720] border border-slate-200 dark:border-[#1e2e42] text-slate-800 dark:text-slate-200 font-semibold">{ex.maskedEvidence}</div>
                          <div className="text-xs text-slate-600 dark:text-slate-400 mt-2">{ex.explanation} • Confidence {Math.round(ex.confidence*100)}% • Detector {ex.detector}</div>
                        </div>
                      ))}
                    </div>
                  )}
                  {examples.length === 0 && <div className="text-sm text-slate-500 italic">No examples in current history for this category.</div>}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
