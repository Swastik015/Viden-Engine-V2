import { useState } from 'react'
import { ChevronRight, Download, Bell, CheckCircle, AlertCircle, Shield, Eye, ArrowLeft,
         Upload, FileText, ExternalLink, Send, Database, ArrowLeftRight, Layers,
         ArrowRight, Clock, Check } from 'lucide-react'
import { useApp } from '../../context/AppContext.jsx'
import KpiCard from '../ui/KpiCard.jsx'
import AiPip  from '../ui/AiPip.jsx'
import Tag    from '../ui/Tag.jsx'

const QUEUE_VARIANTS = [
  { id: 'GS-DSP-019', channel: 'Display 300x250', segment: 'High-Rx PCP', status: 'flagged',    severity: 'High',   issues: 2 },
  { id: 'GS-EML-023', channel: 'Email T+2',       segment: 'High-Rx PCP', status: 'flagged',    severity: 'High',   issues: 1 },
  { id: 'GS-IVA-001', channel: 'Veeva CLM',       segment: 'T1 KOL',      status: 'cleared',    severity: null,     issues: 0 },
  { id: 'GS-WEB-014', channel: 'HCP Portal',      segment: 'T2 Neuro',    status: 'cleared',    severity: null,     issues: 0 },
  { id: 'GS-EML-021', channel: 'Email T+1',       segment: 'High-Rx PCPs',status: 'cleared',    severity: null,     issues: 0 },
  { id: 'GS-CNG-007', channel: 'Congress Booth',  segment: 'T1 KOL',      status: 'cleared',    severity: null,     issues: 0 },
  { id: 'GS-P2P-024', channel: 'P2P Webinar',     segment: 'T1 + T2',     status: 'cleared',    severity: null,     issues: 0 },
  { id: 'GS-DSP-018', channel: 'Display 160x600', segment: 'Gen. Neuro',  status: 'in-review',  severity: 'Medium', issues: 1 },
]

export default function S08_MLRCompliance() {
  const { data, advance } = useApp()
  const d = data.screens.mlrCompliance

  const [view,         setView]         = useState('queue')
  const [activeTab,    setActiveTab]    = useState('flagged')
  const [acceptedIds,  setAcceptedIds]  = useState(new Set())
  const [uploadedPdfs, setUploadedPdfs] = useState([])

  const PDF_SAMPLES = [
    'Vyepti_DSP_300x250_v3.pdf',
    'Vyepti_EML_T2_v2.pdf',
    'Vyepti_IVA_CLM_v4.pdf',
  ]

  function handleAccept(id) {
    setAcceptedIds(prev => new Set([...prev, id]))
  }

  function handlePdfUpload() {
    setUploadedPdfs(prev =>
      prev.length < PDF_SAMPLES.length ? [...prev, PDF_SAMPLES[prev.length]] : prev
    )
  }

  const flaggedVariants = d.flaggedVariants.filter(
    v => !acceptedIds.has(v.id)
  )

  return (
    <div>
      {/* ── Screen header ── */}
      <div className="screen-head">
        <div>
          <div className="screen-eyebrow">
            <span className="actor-tag-user">Your action</span>
            <span className="actor-tag-ke">MLR</span>
            <span>Step 08 · Create</span>
          </div>
          <h1 className="screen-title">MLR compliance review</h1>
          <p className="screen-subtitle">
            Veeva AI has pre-checked all 30 variants against the approved
            claims library, ISI rules and fair-balance requirements.{' '}
            <strong>{d.kpis[1].value} variants</strong> flagged for your
            attention.
          </p>
        </div>
        <div className="screen-actions">
          <button className="btn-ghost btn btn-sm" onClick={handlePdfUpload}>
            <Upload size={13} />
            Upload PDF to Veeva
          </button>
          <button className="btn-ghost btn btn-sm">
            <Download size={13} />
            Export audit trail
          </button>
          <button className="btn-ghost btn btn-sm">
            <Bell size={13} />
            Notify S. Kowalski
          </button>
          {view === 'case' && (
            <button className="btn-primary btn" onClick={advance}>
              MLR approved · proceed to launch
              <ChevronRight size={14} />
            </button>
          )}
        </div>
      </div>

      {/* ── KPI band ── */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        {d.kpis.map(kpi => (
          <KpiCard
            key={kpi.label}
            label={kpi.label}
            value={kpi.value}
            delta={kpi.sub}
            type={kpi.type}
          />
        ))}
      </div>

      {/* ── OPDP Surveillance ── */}
      <div
        className="card card-pad mb-6 flex items-start gap-4"
        style={{ background: '#FFF7ED', borderColor: '#FED7AA' }}
      >
        <div className="w-9 h-9 rounded-lg bg-warn-100 flex items-center
                        justify-center flex-shrink-0">
          <Shield size={18} className="text-warn-700" />
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold uppercase tracking-widest
                             text-warn-700">
              OPDP Real-time Surveillance
            </span>
            <div className="flex items-center gap-1">
              <div className="w-1.5 h-1.5 rounded-full bg-warn-500
                              animate-pulse" />
              <span className="text-[10px] font-semibold text-warn-600">
                Live
              </span>
            </div>
          </div>
          <p className="text-sm text-warn-800 leading-relaxed mb-2">
            Veeva AI is monitoring FDA OPDP signals in real-time. No new
            enforcement letters detected for eptinezumab or CGRP class
            since last check.
          </p>
          <div className="flex gap-4">
            {[
              { label: 'Last checked',     value: '2 min ago'           },
              { label: 'OPDP letters YTD', value: '0 for eptinezumab'   },
              { label: 'Class risk',       value: 'Low · 1 Qulipta flag'},
            ].map(item => (
              <div key={item.label} className="flex items-center gap-1.5">
                <span className="text-[10px] text-warn-600">{item.label}:</span>
                <span className="text-[10px] font-semibold text-warn-800">
                  {item.value}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── VIEW: Queue ── */}
      {view === 'queue' && (
        <div>
          {/* ── PDF intake (Phase 1) + AEM source of truth ── */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            <PdfDropZone uploaded={uploadedPdfs} onUpload={handlePdfUpload} />
            <AemSourcePanel />
          </div>

          <div className="sec-head mb-3">
            <span className="sec-head-title">MLR queue · 30 variants</span>
            <AiPip>Veeva AI · auto-reviewed</AiPip>
          </div>

          <div className="card overflow-hidden">
            {/* Queue header */}
            <div className="px-5 py-3 border-b border-ink-100 bg-ink-50
                            grid grid-cols-12 gap-4">
              {['Variant ID', 'Channel', 'Segment', 'Status', 'Severity', ''].map((h, i) => (
                <div
                  key={i}
                  className={`text-[10px] font-bold uppercase tracking-wider
                              text-ink-500 ${
                    i === 0 ? 'col-span-2' :
                    i === 1 ? 'col-span-3' :
                    i === 2 ? 'col-span-2' :
                    i === 3 ? 'col-span-2' :
                    i === 4 ? 'col-span-2' : 'col-span-1'
                  }`}
                >
                  {h}
                </div>
              ))}
            </div>

            <div className="divide-y divide-ink-100">
              {QUEUE_VARIANTS.map(v => (
                <div
                  key={v.id}
                  className="px-5 py-3 grid grid-cols-12 gap-4 items-center
                             hover:bg-ink-50 transition-colors"
                >
                  {/* ID */}
                  <div className="col-span-2">
                    <span className="font-mono text-xs font-bold text-ink-700">
                      {v.id}
                    </span>
                  </div>

                  {/* Channel */}
                  <div className="col-span-3">
                    <span className="text-xs text-ink-700">{v.channel}</span>
                  </div>

                  {/* Segment */}
                  <div className="col-span-2">
                    <span className="text-xs text-ink-500">{v.segment}</span>
                  </div>

                  {/* Status */}
                  <div className="col-span-2">
                    <span className={`
                      inline-flex items-center gap-1 text-[10px] font-bold
                      px-2 py-0.5 rounded-full uppercase tracking-wide
                      ${v.status === 'flagged'
                        ? 'bg-risk-50 text-risk-700'
                        : v.status === 'in-review'
                          ? 'bg-warn-50 text-warn-700'
                          : 'bg-ok-50 text-ok-700'
                      }
                    `}>
                      <div className={`w-1 h-1 rounded-full ${
                        v.status === 'flagged'   ? 'bg-risk-600' :
                        v.status === 'in-review' ? 'bg-warn-600' : 'bg-ok-600'
                      }`} />
                      {v.status === 'in-review' ? 'In review' :
                       v.status === 'flagged'   ? 'Flagged'   : 'Cleared'}
                    </span>
                  </div>

                  {/* Severity */}
                  <div className="col-span-2">
                    {v.severity ? (
                      <span className={`text-xs font-semibold ${
                        v.severity === 'High'   ? 'text-risk-700' :
                        v.severity === 'Medium' ? 'text-warn-700' : 'text-ink-500'
                      }`}>
                        {v.severity}
                      </span>
                    ) : (
                      <span className="text-xs text-ink-300">—</span>
                    )}
                  </div>

                  {/* Action */}
                  <div className="col-span-1 flex justify-end">
                    {v.status !== 'cleared' ? (
                      <button
                        onClick={() => setView('case')}
                        className="flex items-center gap-1 px-2 py-1 rounded
                                   bg-brand-50 text-brand-700 text-[10px]
                                   font-bold hover:bg-brand-100 transition-colors"
                      >
                        <Eye size={11} />
                        Open
                      </button>
                    ) : (
                      <CheckCircle size={14} className="text-ok-500" />
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Queue footer */}
            <div className="px-5 py-3 border-t border-ink-100 bg-ink-50
                            flex items-center justify-between">
              <span className="text-xs text-ink-500">
                Showing 8 of 30 variants · 2 require action
              </span>
              <button
                onClick={() => setView('case')}
                className="btn-primary btn btn-sm"
              >
                Open flagged cases
                <ChevronRight size={13} />
              </button>
            </div>
          </div>

          {/* ── Future phase: MLR Annotation Sync ── */}
          <AnnotationSyncPlaceholder />
        </div>
      )}

      {/* ── VIEW: Case detail ── */}
      {view === 'case' && (
        <div>
          {/* Back to queue */}
          <button
            onClick={() => setView('queue')}
            className="flex items-center gap-2 text-xs text-ink-500
                       hover:text-ink-900 transition-colors mb-4"
          >
            <ArrowLeft size={13} />
            Back to queue
          </button>

          {/* Tabs */}
          <div className="flex items-center gap-1 mb-5 p-1 bg-ink-100
                          rounded-lg w-fit">
            {[
              { id: 'flagged',  label: 'Flagged',      count: flaggedVariants.length },
              { id: 'cleared',  label: 'Cleared',      count: 27                     },
              { id: 'all',      label: 'All variants', count: 30                     },
              { id: 'audit',    label: 'Audit trail',  count: null                   },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`
                  flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs
                  font-semibold transition-all duration-150
                  ${activeTab === tab.id
                    ? 'bg-white text-ink-900 shadow-xs'
                    : 'text-ink-500 hover:text-ink-700'
                  }
                `}
              >
                {tab.label}
                {tab.count !== null && (
                  <span className={`
                    font-mono text-[10px] px-1.5 py-0.5 rounded-full
                    ${tab.id === 'flagged' && flaggedVariants.length > 0
                      ? 'bg-risk-100 text-risk-700'
                      : 'bg-ink-200 text-ink-600'
                    }
                  `}>
                    {tab.count}
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* Flagged variants */}
          {activeTab === 'flagged' && (
            <div className="space-y-5">
              {flaggedVariants.length === 0 ? (
                <div className="card card-pad text-center py-10">
                  <CheckCircle size={32} className="text-ok-500 mx-auto mb-2" />
                  <div className="text-sm font-semibold text-ok-700">
                    All flagged variants resolved
                  </div>
                  <div className="text-xs text-ink-400 mt-1">
                    Ready to proceed to launch
                  </div>
                  <button
                    onClick={advance}
                    className="btn-primary btn mt-4 mx-auto"
                  >
                    MLR approved · proceed to launch
                    <ChevronRight size={14} />
                  </button>
                </div>
              ) : (
                flaggedVariants.map(variant => (
                  <FlaggedCard
                    key={variant.id}
                    variant={variant}
                    onAccept={() => handleAccept(variant.id)}
                  />
                ))
              )}
            </div>
          )}

          {/* Cleared variants */}
          {activeTab === 'cleared' && (
            <div className="card overflow-hidden">
              <div className="divide-y divide-ink-100">
                {['GS-IVA-001','GS-WEB-014','GS-EML-021','GS-CNG-007',
                  'GS-P2P-024','GS-DSP-018','GS-EML-022','GS-WEB-015'].map(id => (
                  <div key={id}
                    className="px-5 py-3 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <CheckCircle size={14} className="text-ok-500" />
                      <span className="font-mono text-xs font-bold text-ink-700">
                        {id}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <AiPip>Veeva AI · Cleared</AiPip>
                      <span className="text-[10px] text-ink-400">
                        All claims sourced · No issues
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Audit trail */}
          {activeTab === 'audit' && (
            <div className="card overflow-hidden">
              <div className="px-5 py-3 border-b border-ink-100 bg-ink-50">
                <div className="text-xs font-bold text-ink-700">
                  Veeva AI Audit Trail · Vyepti Q3 2026
                </div>
              </div>
              <div className="divide-y divide-ink-100">
                {[
                  { time: '23 Aug 14:58', event: 'MLR review completed',         actor: 'Veeva AI', status: 'ok'   },
                  { time: '23 Aug 14:45', event: 'GS-EML-023 flagged',           actor: 'Veeva AI', status: 'risk' },
                  { time: '23 Aug 14:32', event: 'GS-DSP-019 flagged',           actor: 'Veeva AI', status: 'risk' },
                  { time: '23 Aug 14:20', event: '27 variants auto-cleared',     actor: 'Veeva AI', status: 'ok'   },
                  { time: '23 Aug 14:15', event: 'MLR queue submitted',          actor: 'System',   status: 'info' },
                  { time: '23 Aug 14:10', event: '30 variants received from GS', actor: 'System',   status: 'info' },
                ].map((entry, i) => (
                  <div key={i}
                    className="px-5 py-3 flex items-center gap-4">
                    <span className="font-mono text-[10px] text-ink-400 w-28
                                     flex-shrink-0">
                      {entry.time}
                    </span>
                    <div className={`w-2 h-2 rounded-full flex-shrink-0 ${
                      entry.status === 'ok'   ? 'bg-ok-500'   :
                      entry.status === 'risk' ? 'bg-risk-500' : 'bg-ink-300'
                    }`} />
                    <span className="text-xs text-ink-700 flex-1">
                      {entry.event}
                    </span>
                    <span className="text-[10px] text-ink-400">{entry.actor}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Proceed button */}
          {activeTab !== 'flagged' && (
            <div className="mt-5 flex justify-end">
              <button className="btn-primary btn" onClick={advance}>
                MLR approved · proceed to launch
                <ChevronRight size={14} />
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

/* ── Flagged variant card ── */
function FlaggedCard({ variant, onAccept }) {
  const [accepted, setAccepted] = useState(false)
  const [selected, setSelected] = useState(new Set())
  const [sentToGS, setSentToGS] = useState(false)

  function handleAccept() {
    setAccepted(true)
    onAccept()
  }

  function toggleIssue(i) {
    setSelected(prev => {
      const next = new Set(prev)
      next.has(i) ? next.delete(i) : next.add(i)
      return next
    })
  }

  return (
    <div className="card overflow-hidden">
      {/* Card header */}
      <div className="px-5 py-3 border-b border-ink-100 bg-risk-50
                      flex items-center justify-between">
        <div className="flex items-center gap-2">
          <AiPip type="ke">{variant.id}</AiPip>
          <Tag type="default" dot={false} size="xs">{variant.channel}</Tag>
          <Tag type="warn" dot={false} size="xs">{variant.segment}</Tag>
          <Tag type="risk" dot={false} size="xs">
            {variant.severity} severity
          </Tag>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-1.5 h-1.5 rounded-full bg-risk-500" />
          <span className="text-[10px] font-semibold text-risk-700">
            Flagged · Veeva AI auto-detected
          </span>
        </div>
      </div>

      <div className="flex gap-5 p-5">

        {/* Issues */}
        <div className="flex-1">
          <div className="flex items-center justify-between mb-3">
            <div className="text-[10px] font-bold uppercase tracking-wider
                            text-ink-500">
              Issues detected by Veeva AI
            </div>
            <span className="text-[10px] text-ink-400">
              Select feedback to send to GenStudio
            </span>
          </div>
          <div className="space-y-3">
            {variant.issues.map((issue, i) => {
              const isSel = selected.has(i)
              return (
                <button
                  key={i}
                  type="button"
                  onClick={() => toggleIssue(i)}
                  disabled={sentToGS}
                  className={`w-full text-left flex gap-2.5 p-3 rounded-lg border-l-4
                    transition-all ${
                    issue.type === 'risk'
                      ? 'bg-risk-50 border-risk-500'
                      : 'bg-warn-50 border-warn-500'
                  } ${isSel ? 'ring-2 ring-brand-400 ring-offset-1' : 'hover:ring-1 hover:ring-ink-200'}`}
                >
                  <span className={`mt-0.5 w-4 h-4 rounded flex-shrink-0 border
                    flex items-center justify-center ${
                    isSel ? 'bg-brand-600 border-brand-600' : 'bg-white border-ink-300'
                  }`}>
                    {isSel && <Check size={11} className="text-white" />}
                  </span>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <AlertCircle
                        size={13}
                        className={issue.type === 'risk'
                          ? 'text-risk-600'
                          : 'text-warn-600'
                        }
                      />
                      <span className={`text-xs font-bold ${
                        issue.type === 'risk'
                          ? 'text-risk-800'
                          : 'text-warn-800'
                      }`}>
                        {issue.title}
                      </span>
                    </div>
                    <p className="text-xs text-ink-700 leading-relaxed">
                      {issue.detail}
                    </p>
                    {issue.rule && (
                      <p className="font-mono text-[10px] text-ink-400 mt-1.5">
                        {issue.rule}
                      </p>
                    )}
                  </div>
                </button>
              )
            })}
          </div>
        </div>

        {/* Preview placeholder */}
        <div
          className="w-48 flex-shrink-0 rounded-lg flex items-center
                     justify-center border border-ink-200 bg-ink-50"
        >
          <span className="font-mono text-xs text-ink-300">{variant.id}</span>
        </div>
      </div>

      {/* Veeva AI suggested fix */}
      <div
        className="mx-5 mb-5 p-4 rounded-lg"
        style={{ background: '#F0FDF4', border: '1px solid #BBF7D0' }}
      >
        <div className="flex items-center gap-2 mb-2">
          <AiPip>Veeva AI · Suggested revision</AiPip>
        </div>
        <p className="text-sm text-ink-800 leading-relaxed mb-3">
          {variant.suggestedFix}
        </p>
        <div className="flex items-center gap-3">
          {accepted ? (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg
                            bg-ok-50 border border-ok-200">
              <CheckCircle size={13} className="text-ok-600" />
              <span className="text-xs font-semibold text-ok-700">
                Revision accepted
              </span>
            </div>
          ) : (
            <>
              <button
                onClick={handleAccept}
                className="btn-teal btn btn-sm"
              >
                <CheckCircle size={13} />
                Accept revision
              </button>
              <button className="btn-ghost btn btn-sm">
                Edit manually
              </button>
              <button className="text-xs text-risk-600 hover:text-risk-800
                                 font-semibold transition-colors">
                Reject and remove variant
              </button>
            </>
          )}
        </div>
      </div>

      {/* GenStudio handoff — source-asset edits + feedback transfer */}
      <div
        className="mx-5 mb-5 p-4 rounded-lg"
        style={{ background: '#F0FDF4', border: '1px solid #BBF7D0' }}
      >
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="actor-tag-gs">GenStudio</span>
            <span className="text-xs text-ink-700">
              {selected.size > 0
                ? `${selected.size} reviewer note${selected.size > 1 ? 's' : ''} ready to send as suggested edits`
                : 'Some changes — like ISI updates — must be made on the source asset in GenStudio'}
            </span>
          </div>
          {sentToGS ? (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg
                            bg-ok-50 border border-ok-200 flex-shrink-0">
              <CheckCircle size={13} className="text-ok-600" />
              <span className="text-xs font-semibold text-ok-700">
                Opened in GenStudio · feedback attached
              </span>
            </div>
          ) : (
            <button
              onClick={() => setSentToGS(true)}
              className="btn-primary btn btn-sm flex-shrink-0"
            >
              <ExternalLink size={13} />
              Open in GenStudio
              {selected.size > 0
                ? ` · ${selected.size} suggestion${selected.size > 1 ? 's' : ''}`
                : ''}
            </button>
          )}
        </div>

        {selected.size > 0 && !sentToGS && (
          <div className="mt-3 pt-3 border-t border-ok-200 space-y-1.5">
            <div className="text-[10px] font-bold uppercase tracking-wider text-ink-500">
              Suggested edits carried into GenStudio
            </div>
            {[...selected].map(i => (
              <div key={i} className="flex items-center gap-2 text-xs text-ink-700">
                <Send size={11} className="text-brand-500 flex-shrink-0" />
                {variant.issues[i].title}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

/* ── PDF intake drop zone (Phase 1 — upload to Veeva for MLR review) ── */
function PdfDropZone({ uploaded, onUpload }) {
  return (
    <div className="col-span-2 card card-pad">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-bold uppercase tracking-wider text-ink-500">
            Upload asset for MLR review
          </span>
          <AiPip>Veeva · Phase 1 intake</AiPip>
        </div>
        <span className="text-[10px] text-ink-400">PDF · max 25 MB</span>
      </div>

      <button
        type="button"
        onClick={onUpload}
        className="w-full rounded-lg border-2 border-dashed border-ink-200
                   py-6 px-4 flex flex-col items-center justify-center gap-2
                   hover:border-brand-300 hover:bg-brand-50/40 transition-colors"
      >
        <div className="w-10 h-10 rounded-lg bg-brand-50 flex items-center
                        justify-center">
          <Upload size={18} className="text-brand-600" />
        </div>
        <span className="text-sm font-semibold text-ink-700">
          Drop a PDF here or click to upload
        </span>
        <span className="text-xs text-ink-400 text-center max-w-sm">
          Upload a PDF copy of the asset into Veeva so the MLR team can review
          it — even before the final MLR workflow is defined.
        </span>
      </button>

      {uploaded.length > 0 && (
        <div className="mt-3 space-y-1.5">
          {uploaded.map(file => (
            <div
              key={file}
              className="flex items-center justify-between px-3 py-2 rounded-lg
                         bg-ok-50 border border-ok-200"
            >
              <div className="flex items-center gap-2">
                <FileText size={13} className="text-ok-600" />
                <span className="text-xs font-semibold text-ink-700">{file}</span>
              </div>
              <span className="inline-flex items-center gap-1 text-[10px]
                               font-bold text-ok-700">
                <CheckCircle size={11} />
                Uploaded to Veeva · queued for review
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

/* ── AEM source of truth (final asset files; GenStudio syncs from AEM) ── */
function AemSourcePanel() {
  return (
    <div
      className="card card-pad"
      style={{ background: '#F5F3FF', borderColor: '#DDD6FE' }}
    >
      <div className="flex items-center gap-2 mb-2">
        <Database size={15} className="text-purple-600" />
        <span className="text-[10px] font-bold uppercase tracking-wider text-purple-700">
          AEM · Source of truth
        </span>
      </div>
      <p className="text-xs text-ink-700 leading-relaxed mb-3">
        Approved, final asset files are housed in Adobe Experience Manager.
        GenStudio pulls and syncs source assets from AEM.
      </p>

      <div className="flex items-center justify-center gap-2 mb-2">
        <span className="actor-tag-gs">GenStudio</span>
        <ArrowLeftRight size={13} className="text-ink-400" />
        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold
                         bg-purple-100 text-purple-700">
          AEM
        </span>
      </div>

      <div className="flex items-center gap-1.5 justify-center">
        <div className="w-1.5 h-1.5 rounded-full bg-ok-500 animate-pulse" />
        <span className="text-[10px] text-ink-500">
          Synced 4 min ago · 27 approved files
        </span>
      </div>
    </div>
  )
}

/* ── Future phase: MLR Annotation Sync (downstream reuse, e.g. TransStudio) ── */
function AnnotationSyncPlaceholder() {
  return (
    <div
      className="card card-pad mt-6 border-dashed"
      style={{ borderColor: '#C7D2FE', background: '#FAFAFF' }}
    >
      <div className="flex items-start gap-4">
        <div className="w-9 h-9 rounded-lg bg-brand-50 flex items-center
                        justify-center flex-shrink-0">
          <Layers size={18} className="text-brand-600" />
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold uppercase tracking-widest text-brand-700">
              MLR Annotation Sync
            </span>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full
                             bg-ink-200 text-ink-600 uppercase tracking-wide">
              Future phase
            </span>
          </div>
          <p className="text-sm text-ink-600 leading-relaxed mb-3">
            Capture MLR annotations directly in the workflow as structured data.
            Annotations are designed for reuse — informing downstream tools such
            as TransStudio about required messaging updates.
          </p>

          <div className="flex items-center gap-2 flex-wrap text-[10px] mb-3">
            <span className="px-1.5 py-0.5 rounded bg-purple-100 text-purple-700 font-bold">
              MLR annotations
            </span>
            <ArrowRight size={12} className="text-ink-400" />
            <span className="px-1.5 py-0.5 rounded bg-ink-100 text-ink-600 font-semibold">
              TransStudio
            </span>
            <ArrowRight size={12} className="text-ink-400" />
            <span className="px-1.5 py-0.5 rounded bg-ink-100 text-ink-600 font-semibold">
              Downstream messaging updates
            </span>
          </div>

          <button
            type="button"
            disabled
            className="btn-ghost btn btn-sm opacity-60 cursor-not-allowed"
          >
            <Clock size={13} />
            Coming in a future phase
          </button>
        </div>
      </div>
    </div>
  )
}