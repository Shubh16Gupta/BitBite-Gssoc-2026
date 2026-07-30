import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  ArrowLeft, CheckCircle, Sprout, TrendingUp, Cloud, Droplets,
  MapPin, Phone, Award, ShieldCheck, AlertTriangle, IndianRupee, BarChart3
} from 'lucide-react'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts'
import { bankService } from '../../services/bankService'
import { getErrorMessage } from '../../services/api'

const scoreColor = (s) =>
  s == null ? 'text-slate-400' : s >= 85 ? 'text-emerald-600' : s >= 70 ? 'text-lime-600' : s >= 50 ? 'text-amber-600' : 'text-red-600'

const scoreBg = (s) =>
  s == null ? 'bg-slate-100 border-slate-200' : s >= 85 ? 'bg-emerald-50 border-emerald-200' : s >= 70 ? 'bg-lime-50 border-lime-200' : s >= 50 ? 'bg-amber-50 border-amber-200' : 'bg-red-50 border-red-200'

export default function LoanDetails() {
  const { id } = useParams() // farmerId
  const navigate = useNavigate()
  const [report, setReport] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true
    ;(async () => {
      try {
        const data = await bankService.getFarmerReport(id)
        if (active) setReport(data)
      } catch (e) {
        toast.error(getErrorMessage(e))
      } finally {
        if (active) setLoading(false)
      }
    })()
    return () => { active = false }
  }, [id])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600" />
      </div>
    )
  }

  if (!report) {
    return (
      <div className="text-center py-20">
        <p className="text-slate-500">Farmer report not found.</p>
        <button onClick={() => navigate('/bank/requests')} className="mt-3 text-emerald-600 font-medium">
          Back to eligible farmers
        </button>
      </div>
    )
  }

  const { farmer } = report
  // Flatten every phase across cycles (oldest → newest) for the timeline chart.
  const timeline = [...report.cycles].reverse().flatMap((c) =>
    c.phases.map((p) => ({
      name: `P${p.phaseNumber}`,
      annScore: p.annScore,
      cropHealth: p.cropHealthScore,
    }))
  )

  return (
    <div className="space-y-6">
      <button
        onClick={() => navigate(-1)}
        className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-800"
      >
        <ArrowLeft className="h-4 w-4" /> Back
      </button>

      {/* Header + score */}
      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <div className="flex flex-wrap items-center gap-5">
          <div className={`w-24 h-24 rounded-2xl border grid place-items-center ${scoreBg(report.annScore)}`}>
            <div className="text-center">
              <div className={`text-3xl font-bold ${scoreColor(report.annScore)}`}>
                {report.annScore ?? '—'}
              </div>
              <div className="text-[10px] font-semibold uppercase text-slate-500">AnnScore</div>
            </div>
          </div>
          <div className="min-w-0">
            <h1 className="text-2xl font-bold text-slate-900">{farmer.name}</h1>
            <div className="mt-1 flex flex-wrap gap-4 text-sm text-slate-500">
              <span className="flex items-center gap-1"><Phone className="h-3.5 w-3.5" />{farmer.phone}</span>
              <span className="flex items-center gap-1">
                <MapPin className="h-3.5 w-3.5" />
                {[farmer.village, farmer.district, farmer.state].filter(Boolean).join(', ')}
              </span>
              <span className="flex items-center gap-1">
                <Sprout className="h-3.5 w-3.5" />
                {farmer.landArea} {farmer.landUnit} · {farmer.primaryCrop}
              </span>
            </div>
            <div className="mt-2 flex flex-wrap gap-2">
              <Chip className="bg-emerald-50 border-emerald-200 text-emerald-700">
                <Award className="h-3 w-3" /> {report.scoreLabel}
              </Chip>
              <Chip>{report.scoredCyclesCount} cycle(s)</Chip>
              <Chip>{report.totalPhases} phase(s)</Chip>
              <Chip>Crop health {report.cropHealth ?? '—'}/100</Chip>
            </div>
          </div>
        </div>
      </div>

      {/* Why this score */}
      {report.explanation && (
        <div className="bg-emerald-50/60 border border-emerald-200 rounded-xl p-5">
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

      {/* AnnScore timeline */}
      {timeline.length > 0 && (
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <div className="flex items-center gap-2 mb-4">
            <BarChart3 className="h-4 w-4 text-emerald-600" />
            <h3 className="font-semibold text-slate-900">AnnScore timeline</h3>
          </div>
          <div className="h-[240px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={timeline}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} />
                <Tooltip />
                <Line type="monotone" dataKey="annScore" name="AnnScore" stroke="#10b981" strokeWidth={3} dot={{ fill: '#10b981', r: 4 }} />
                <Line type="monotone" dataKey="cropHealth" name="Crop health" stroke="#3b82f6" strokeWidth={2} strokeDasharray="4 4" dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Per-cycle breakdown */}
      {report.cycles.map((cycle) => (
        <div key={cycle.cycleId} className="bg-white rounded-xl border border-slate-200 p-5 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h3 className="font-semibold text-slate-900">
              {cycle.cropLabel}
              <span className="ml-2 text-sm font-normal text-slate-500">
                sown {cycle.sowingDate ? new Date(cycle.sowingDate).toLocaleDateString() : '—'}
              </span>
            </h3>
            <div className="flex items-center gap-2">
              <Chip className={scoreBg(cycle.cycleAnnScore)}>
                cycle score {cycle.cycleAnnScore ?? '—'}
              </Chip>
              <Chip
                className={
                  cycle.status === 'completed'
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
                    : 'bg-amber-50 border-amber-200 text-amber-700'
                }
              >
                {cycle.status}
              </Chip>
            </div>
          </div>

          {cycle.finalYield && (
            <div className="flex items-center justify-between rounded-xl bg-emerald-50 border border-emerald-200 px-4 py-3">
              <span className="text-sm font-medium text-emerald-700 flex items-center gap-2">
                <TrendingUp className="h-4 w-4" /> Final predicted yield
              </span>
              <span className="font-bold text-slate-900">
                {cycle.finalYield.estimatedYield} {cycle.finalYield.unit}
                <span className="ml-1 text-xs font-normal text-slate-500">
                  {cycle.finalYield.confidence}% confidence
                </span>
              </span>
            </div>
          )}

          {cycle.phases.length === 0 ? (
            <p className="text-sm text-slate-500">No phases analyzed yet.</p>
          ) : (
            <div className="space-y-3">
              {cycle.phases.map((p) => (
                <PhaseRow key={p.phaseNumber} phase={p} />
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  )
}

function PhaseRow({ phase }) {
  const r = phase.report || {}
  const w = phase.weather || {}
  const rain = phase.rainfall || {}
  const v = r.verification

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-xl border border-slate-200 p-4"
    >
      <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
        <div className="flex items-center gap-3">
          <div className={`w-11 h-11 rounded-xl border grid place-items-center ${scoreBg(phase.cropHealthScore)}`}>
            <span className={`text-sm font-bold ${scoreColor(phase.cropHealthScore)}`}>
              {phase.cropHealthScore ?? '—'}
            </span>
          </div>
          <div>
            <p className="font-semibold text-slate-900 text-sm">
              Phase {phase.phaseNumber} · {phase.stageName}
            </p>
            <p className="text-xs text-slate-500">
              AnnScore {phase.annScore ?? '—'} · trend {phase.healthTrend || 'n/a'}
            </p>
          </div>
        </div>
        <Chip
          className={
            phase.diseaseSeverity === 'high'
              ? 'bg-red-50 border-red-200 text-red-700'
              : phase.diseaseSeverity === 'medium'
                ? 'bg-amber-50 border-amber-200 text-amber-700'
                : 'bg-emerald-50 border-emerald-200 text-emerald-700'
          }
        >
          stress: {phase.diseaseSeverity || 'none'}
        </Chip>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
        <Cell icon={Cloud} label="Weather" value={w.available ? `${Math.round(w.temperatureC)}°C ${w.description}` : 'unavailable'} />
        <Cell icon={Droplets} label="Rainfall" value={rain.available ? `${rain.totalMm}mm/${rain.windowDays}d` : 'unavailable'} />
        <Cell icon={TrendingUp} label="Yield" value={`${phase.yield?.estimatedYield ?? '—'} ${phase.yield?.unit || ''}`} />
        <Cell icon={IndianRupee} label="Market value" value={r.estimatedRevenue != null ? `₹${r.estimatedRevenue.toLocaleString('en-IN')}` : '—'} />
      </div>

      {v && (
        <div className="mt-3 flex flex-wrap items-center gap-2 text-xs">
          <span className="font-semibold text-slate-500 flex items-center gap-1">
            <ShieldCheck className="h-3.5 w-3.5" /> confidence {v.confidence}/100 · {v.level}
          </span>
          <Chip className={v.locationVerified ? 'bg-emerald-50 border-emerald-200 text-emerald-700' : ''}>
            📍 {v.locationVerified ? 'location verified' : 'unverified'}
          </Chip>
          <Chip className={v.timeVerified ? 'bg-emerald-50 border-emerald-200 text-emerald-700' : ''}>
            🕐 {v.timeVerified ? 'time verified' : 'unverified'}
          </Chip>
          {v.flags?.length > 0 && (
            <span className="text-amber-600 flex items-center gap-1">
              <AlertTriangle className="h-3.5 w-3.5" /> {v.flags.length} flag(s)
            </span>
          )}
        </div>
      )}

      {phase.imageUrls?.length > 0 && (
        <div className="mt-3 grid grid-cols-5 gap-2">
          {phase.imageUrls.map((url, i) => (
            <a key={i} href={url} target="_blank" rel="noreferrer" className="aspect-square rounded-lg overflow-hidden border border-slate-200">
              <img src={url} alt={`Phase ${phase.phaseNumber} #${i + 1}`} loading="lazy" className="w-full h-full object-cover hover:scale-105 transition" />
            </a>
          ))}
        </div>
      )}

      {r.summary && (
        <p className="mt-3 text-xs leading-relaxed text-slate-500 bg-slate-50 rounded-lg p-2.5">{r.summary}</p>
      )}
    </motion.div>
  )
}

function Chip({ children, className = '' }) {
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium border border-slate-200 bg-slate-50 text-slate-600 ${className}`}>
      {children}
    </span>
  )
}

function Cell({ icon: Icon, label, value }) {
  return (
    <div className="rounded-lg border border-slate-200 p-2">
      <div className="flex items-center gap-1 text-[11px] text-slate-500">
        <Icon className="h-3 w-3" /> {label}
      </div>
      <p className="mt-0.5 font-medium text-slate-800 truncate">{value}</p>
    </div>
  )
}
