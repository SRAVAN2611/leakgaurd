import { useState } from 'react'
import { Scan } from '../../mocks/data'
import { RiskScore } from './RiskScore'
import { SecurityDecision } from './SecurityDecision'
import { ThreatCard } from './ThreatCard'
import { Copy, ShieldAlert, CheckCircle2, Info } from 'lucide-react'
import { useToast } from '../../context/ToastContext'

interface UnifiedScanResultProps {
  scan: Scan
  activeFindingId?: string | null
  onFindingClick?: (findingId: string, line?: number) => void
}

export function UnifiedScanResult({ scan, activeFindingId, onFindingClick }: UnifiedScanResultProps) {
  const [tab, setTab] = useState<'sanitized' | 'original' | 'ocr'>('sanitized')
  const { push } = useToast()

  const originalText = scan.original || scan.extractedText || ''
  const sanitizedText = scan.sanitized || ''

  return (
    <div className="space-y-4">
      {/* Risk score overview */}
      <RiskScore score={scan.riskScore} decision={scan.decision} variant="large" />

      {/* Security decision banner */}
      <SecurityDecision decision={scan.decision} />

      {/* Decision reasoning & matched policies callout */}
      {scan.decisionReason && (
        <div className="rounded-2xl border bg-slate-50 dark:bg-[#0b1218] border-slate-200 dark:border-[#1f2e42] p-4 text-xs">
          <div className="flex items-center gap-2 font-bold text-slate-700 dark:text-slate-300 mb-1">
            <Info className="w-4 h-4 text-sky-500 shrink-0" />
            Decision Rationale & Policy Evaluation
          </div>
          <p className="text-slate-600 dark:text-slate-400 leading-relaxed">{scan.decisionReason}</p>
        </div>
      )}

      {/* Security Findings Section */}
      <div className="rounded-2xl border bg-white dark:bg-[#0f1720] border-slate-200 dark:border-[#1f2e42] overflow-hidden">
        <div className="px-4 py-3 border-b border-slate-200 dark:border-[#1f2e42] flex items-center justify-between">
          <div className="text-sm font-semibold text-slate-900 dark:text-white flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-slate-500" />
            Security Findings
          </div>
          <span className="text-xs font-bold px-2 py-1 rounded-full bg-slate-900 dark:bg-white text-white dark:text-slate-900">
            {scan.findings.length}
          </span>
        </div>

        {scan.findings.length === 0 ? (
          <div className="p-8 text-center text-sm text-slate-500 flex flex-col items-center gap-2">
            <CheckCircle2 className="w-8 h-8 text-emerald-500" />
            <span>No security threats detected. Input is safe per current policies.</span>
          </div>
        ) : (
          <div className="p-3 space-y-3 max-h-[440px] overflow-auto">
            {scan.findings.map(f => (
              <ThreatCard
                key={f.id}
                finding={f}
                active={activeFindingId === f.id}
                onClick={() => onFindingClick?.(f.id, f.line)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Content Viewer Tabs (Original vs Sanitized) */}
      <div className="rounded-2xl border bg-white dark:bg-[#0f1720] border-slate-200 dark:border-[#1f2e42] overflow-hidden">
        <div className="flex flex-wrap items-center justify-between p-2 gap-2 border-b border-slate-200 dark:border-[#1f2e42]">
          <div className="flex p-1 rounded-full bg-slate-100 dark:bg-[#0b1218] border border-slate-200 dark:border-[#1e2e42]">
            <button
              onClick={() => setTab('sanitized')}
              className={`px-4 py-1.5 rounded-full text-xs font-bold transition ${
                tab === 'sanitized'
                  ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Sanitized Output
            </button>
            <button
              onClick={() => setTab('original')}
              className={`px-4 py-1.5 rounded-full text-xs font-bold transition ${
                tab === 'original'
                  ? 'bg-white dark:bg-[#1e2e42] text-slate-900 dark:text-white shadow'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Original Input
            </button>
            {scan.extractedText && scan.inputType === 'Image' && (
              <button
                onClick={() => setTab('ocr')}
                className={`px-4 py-1.5 rounded-full text-xs font-bold transition ${
                  tab === 'ocr'
                    ? 'bg-sky-600 text-white shadow'
                    : 'text-slate-600 dark:text-slate-400'
                }`}
              >
                OCR Extracted
              </button>
            )}
          </div>
          <button
            onClick={() => {
              const textToCopy = tab === 'sanitized' ? sanitizedText : tab === 'ocr' ? scan.extractedText || '' : originalText
              navigator.clipboard.writeText(textToCopy)
              push({ title: 'Copied to clipboard', variant: 'success' })
            }}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border bg-white dark:bg-[#0b1218] border-slate-200 dark:border-[#1e2e42] text-xs font-semibold hover:bg-slate-50 dark:hover:bg-[#12202f]"
          >
            <Copy className="w-3.5 h-3.5" /> Copy
          </button>
        </div>

        <div className="p-4">
          <div className="relative rounded-xl border bg-slate-50 dark:bg-[#0b1218] border-slate-200 dark:border-[#1e2e42] p-4">
            <pre className="text-sm leading-relaxed whitespace-pre-wrap break-words font-mono text-slate-800 dark:text-slate-200">
              {tab === 'sanitized' ? sanitizedText : tab === 'ocr' ? scan.extractedText : originalText}
            </pre>
          </div>
          {scan.decision === 'REDACT' && (
            <p className="text-[11px] text-sky-700 dark:text-sky-300 mt-2 font-medium">
              Sensitive elements have been redacted. Use the Sanitized Output for safe submission to external LLMs.
            </p>
          )}
          {scan.decision === 'BLOCK' && (
            <p className="text-[11px] text-red-600 dark:text-red-300 mt-2 font-medium">
              This input violates high-severity security policies and MUST NOT be forwarded to external LLMs.
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
