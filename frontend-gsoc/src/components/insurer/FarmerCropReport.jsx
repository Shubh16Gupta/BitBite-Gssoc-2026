/**
 * Crop-analysis report shown to an insurer — accessible only for farmers whose
 * insurance application this insurer has APPROVED (enforced server-side).
 */
import { useEffect, useState } from 'react'
import {
  X, Sprout, Cloud, Droplets, TrendingUp, IndianRupee, ShieldCheck, AlertTriangle,
  MapPin, Phone, FileText, BarChart3,
} from 'lucide-react'
import { motion } from 'framer-motion'
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts'
import toast from 'react-hot-toast'
import { insuranceService } from '../../services/insuranceService'
import { getErrorMessage } from '../../services/api'

const inr = (n) => (typeof n === 'number' ? `₹${n.toLocaleString('en-IN')}` : '—')

const scoreColor = (s) =>
  s == null ? 'text-slate-400' : s >= 85 ? 'text-emerald-600' : s >= 70 ? 'text-lime-600' : s >= 50 ? 'text-amber-600' : 'text-red-600'
const scoreBg = (s) =>
  s == null ? 'bg-slate-100 border-slate-200' : s >= 85 ? 'bg-emerald-50 border-emerald-200' : s >= 70 ? 'bg-lime-50 border-lime-200' : s >= 50 ? 'bg-amber-50 border-amber-200' : 'bg-red-50 border-red-200'

export default function FarmerCropReport({ farmerId, onClose }) {
  const [report, setReport] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true
    insuranceService
      .farmerReport(farmerId)
      .then((d) => active && setReport(d))
      .catch((e) => {
        if (active) toast.error(getErrorMessage(e))
      })
      .finally(() => active && setLoading(false))
    return () => {
      active = false
    }
  }, [farmerId])

  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  const timeline = report
    ? [...report.cycles].reverse().flatMap((c) =>
        c.phases.map((p) => ({
          name: `P${p.phaseNumber}`,
          annScore: p.annScore,
          cropHealth: p.cropHealthScore,
        }))
      )
    : []

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      <motion.div
        initial={{ opacity: 0, scale: 0.97 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative z-10 max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-2xl bg-white shadow-2xl p-6"
      >
        <button
          onClick={onClose}
          className="absolute right-4 top-4 grid h-9 w-9 place-items-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition"
          aria-label="Close"
        >
          <X className="h-5 w-5" />
        </button>

        {loading && (
          <div className="flex justify-center py-20">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-teal-600" />
          </div>
        )}

        {!loading && !report && (
          <p className="py-20 text-center text-sm text-slate-500">Report unavailable.</p>
        )}

        {!loading && report && (
          <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-wrap items-center gap-4">
              <div className={`w-24 h-24 shrink-0 rounded-2xl border grid place-items-center ${scoreBg(report.annScore)}`}>
                <div className="text-center">
                  <div className={`text-3xl font-bold ${scoreColor(report.annScore)}`}>
                    {report.annScore ?? '—'}
                  </div>
                  <div className="text-[10px] font-semibold uppercase text-slate-500">AnnScore</div>
                </div>
              </div>
              <div className="min-w-0">
                <h2 className="text-2xl font-bold text-slate-900">{report.farmer.name}</h2>
                <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-sm text-slate-500">
                  <span className="flex items-center gap-1"><Phone className="h-3.5 w-3.5" />{report.farmer.phone}</span>
                  <span className="flex items-center gap-1">
                    <MapPin className="h-3.5 w-3.5" />
                    {[report.farmer.village, report.farmer.district, report.farmer.state].filter(Boolean).join(', ')}
                  </span>
                  <span className="flex items-center gap-1">
                    <Sprout className="h-3.5 w-3.5" />
                    {report.farmer.landArea} {report.farmer.landUnit}
                  </span>
                </div>
              </div>
            </div>

            {/* Policy */}
            {report.policy && (
              <div className="rounded-xl border border-teal-200 bg-teal-50/60 p-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <p className="text-sm font-semibold text-teal-800 flex items-center gap-2">
                    <FileText className="h-4 w-4" /> Policy {report.policy.policyNumber}
                  </p>
                  <div className="flex flex-wrap gap-4 text-sm">
                    <span className="text-slate-600">
                      Cover <strong className="text-slate-900">{inr(report.policy.sumInsured)}</strong>
                    </span>
                    <span className="text-slate-600">
                      Premium <strong className="text-slate-900">{inr(report.policy.premium)}</strong>
                    </span>
                    <span className="text-slate-600">
                      Risk <strong className="text-slate-900 capitalize">{report.policy.riskBand}</strong>
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Why this score */}
            {report.explanation && (
              <div className="rounded-xl border border-emerald-200 bg-emerald-50/60 p-5">
                <h3 className="text-sm font-semibold uppercase tracking-wide text-emerald-700 mb-2">
                  Why this score
                </h3>
                <p className="text-sm leading-relaxed text-slate-700">{report.explanation.text}</p>
                <ul className="mt-3 space-y-1.5">
                  {report.explanation.factors?.map((f, i) => (
                    <li key={i} className="text-sm text-slate-700">
                      <span className="font-semibold text-slate-900">{f.label}:</span> {f.detail}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Timeline */}
            {timeline.length > 0 && (
              <div className="rounded-xl border border-slate-200 p-4">
                <h3 className="font-semibold text-slate-900 mb-3 flex items-center gap-2">
                  <BarChart3 className="h-4 w-4 text-teal-600" /> AnnScore timeline
                </h3>
                <div className="h-[220px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={timeline}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                      <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                      <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} />
                      <Tooltip />
                      <Line type="monotone" dataKey="annScore" name="AnnScore" stroke="#0d9488" strokeWidth={3} dot={{ r: 4 }} />
                      <Line type="monotone" dataKey="cropHealth" name="Crop health" stroke="#3b82f6" strokeWidth={2} strokeDasharray="4 4" dot={{ r: 3 }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}

            {/* Cycles + phases */}
            {report.cycles.map((cycle) => (
              <div key={cycle.cycleId} className="rounded-xl border border-slate-200 p-4 space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <h3 className="font-semibold text-slate-900">
                    {cycle.cropLabel}
                    <span className="ml-2 text-sm font-normal text-slate-500">
                      sown {cycle.sowingDate ? new Date(cycle.sowingDate).toLocaleDateString() : '—'}
                    </span>
                  </h3>
                  <span className={`px-2.5 py-1 rounded-full text-xs font-medium border ${scoreBg(cycle.cycleAnnScore)}`}>
                    cycle score {cycle.cycleAnnScore ?? '—'}
                  </span>
                </div>

                {cycle.phases.length === 0 ? (
                  <p className="text-sm text-slate-500">No phases analyzed yet.</p>
                ) : (
                  cycle.phases.map((p) => <PhaseRow key={p.phaseNumber} phase={p} />)
                )}
              </div>
            ))}
          </div>
        )}
      </motion.div>
    </div>
  )
}

function PhaseRow({ phase }) {
  const r = phase.report || {}
  const w = phase.weather || {}
  const rain = phase.rainfall || {}
  const v = r.verification

  return (
    <div className="rounded-lg border border-slate-200 p-3">
      <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
        <div className="flex items-center gap-2.5">
          <div className={`w-10 h-10 rounded-lg border grid place-items-center ${scoreBg(phase.cropHealthScore)}`}>
            <span className={`text-sm font-bold ${scoreColor(phase.cropHealthScore)}`}>
              {phase.cropHealthScore ?? '—'}
            </span>
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-900">
              Phase {phase.phaseNumber} · {phase.stageName}
            </p>
            <p className="text-xs text-slate-500">
              AnnScore {phase.annScore ?? '—'} · trend {phase.healthTrend || 'n/a'} · stress{' '}
              {phase.diseaseSeverity || 'none'}
            </p>
          </div>
        </div>
        {v && (
          <span className="text-xs text-slate-500 flex items-center gap-1">
            <ShieldCheck className="h-3.5 w-3.5" /> confidence {v.confidence}/100
            {v.flags?.length > 0 && (
              <AlertTriangle className="h-3.5 w-3.5 text-amber-500 ml-1" title={v.flags.join(' | ')} />
            )}
          </span>
        )}
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
        <Cell icon={Cloud} label="Weather" value={w.available ? `${Math.round(w.temperatureC)}°C ${w.description}` : 'n/a'} />
        <Cell icon={Droplets} label="Rainfall" value={rain.available ? `${rain.totalMm}mm/${rain.windowDays}d` : 'n/a'} />
        <Cell icon={TrendingUp} label="Yield" value={`${phase.yield?.estimatedYield ?? '—'} ${phase.yield?.unit || ''}`} />
        <Cell icon={IndianRupee} label="Value" value={r.estimatedRevenue != null ? inr(r.estimatedRevenue) : '—'} />
      </div>

      {phase.imageUrls?.length > 0 && (
        <div className="mt-2 grid grid-cols-5 gap-2">
          {phase.imageUrls.map((url, i) => (
            <a key={i} href={url} target="_blank" rel="noreferrer" className="aspect-square rounded-lg overflow-hidden border border-slate-200">
              <img src={url} alt={`Phase ${phase.phaseNumber} #${i + 1}`} loading="lazy" className="w-full h-full object-cover hover:scale-105 transition" />
            </a>
          ))}
        </div>
      )}
    </div>
  )
}

function Cell({ icon: Icon, label, value }) {
  return (
    <div className="rounded border border-slate-200 p-2">
      <div className="flex items-center gap-1 text-[11px] text-slate-500">
        <Icon className="h-3 w-3" /> {label}
      </div>
      <p className="mt-0.5 font-medium text-slate-800 truncate">{value}</p>
    </div>
  )
}
