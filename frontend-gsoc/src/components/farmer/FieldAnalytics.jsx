/**
 * Field analytics — everything the backend knows about one field:
 *   GET /farmer/dashboard/:fieldId  → current AnnScore, totals, latest weather
 *   GET /farmer/graph/:fieldId      → AnnScore timeline + trend + % change
 *   GET /farmer/history/:fieldId    → every week's score
 *   GET /farmer/crop-cycles         → this field's crop cycles
 *   GET /farmer/market-price        → live mandi price for the crop
 */
import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import {
  ArrowLeft, TrendingUp, TrendingDown, Minus, Cloud, Wind, Droplets,
  BarChart3, Sprout, IndianRupee, Calendar, MapPin
} from 'lucide-react'
import { motion } from 'framer-motion'
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart,
} from 'recharts'
import toast from 'react-hot-toast'
import { farmerService } from '../../services/farmerService'
import { getErrorMessage } from '../../services/api'

const scoreColor = (s) =>
  s == null ? 'text-slate-400' : s >= 85 ? 'text-emerald-600' : s >= 70 ? 'text-lime-600' : s >= 50 ? 'text-amber-600' : 'text-red-600'

export default function FieldAnalytics() {
  const { fieldId } = useParams()
  const [field, setField] = useState(null)
  const [dashboard, setDashboard] = useState(null)
  const [graph, setGraph] = useState(null)
  const [history, setHistory] = useState([])
  const [cycles, setCycles] = useState([])
  const [price, setPrice] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true
    ;(async () => {
      setLoading(true)
      try {
        const f = await farmerService.getField(fieldId)
        if (!active) return
        setField(f)

        // These can legitimately be empty (no analyses yet) — settle each.
        const [dash, gr, hist, cyc] = await Promise.allSettled([
          farmerService.getDashboard(fieldId),
          farmerService.getGraph(fieldId),
          farmerService.getHistory(fieldId),
          farmerService.getCropCycles(fieldId),
        ])
        if (!active) return
        if (dash.status === 'fulfilled') setDashboard(dash.value)
        if (gr.status === 'fulfilled') setGraph(gr.value)
        if (hist.status === 'fulfilled') setHistory(hist.value || [])
        if (cyc.status === 'fulfilled') setCycles(cyc.value || [])

        // Live mandi price for this field's crop.
        try {
          const p = await farmerService.getMarketPrice(String(f.cropType || '').toLowerCase())
          if (active) setPrice(p)
        } catch {
          /* crop may not be in the catalog */
        }
      } catch (e) {
        toast.error(getErrorMessage(e))
      } finally {
        if (active) setLoading(false)
      }
    })()
    return () => {
      active = false
    }
  }, [fieldId])

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600" />
      </div>
    )
  }

  if (!field) {
    return (
      <div className="text-center py-16">
        <p className="text-slate-500">Field not found.</p>
        <Link to="/farmer/fields" className="mt-3 inline-block text-emerald-600 font-medium">
          Back to my fields
        </Link>
      </div>
    )
  }

  const weather = dashboard?.latestWeather
  const trend = graph?.growthTrend
  const TrendIcon = trend === 'improving' ? TrendingUp : trend === 'declining' ? TrendingDown : Minus
  const trendCls =
    trend === 'improving'
      ? 'text-emerald-600 bg-emerald-50 border-emerald-200'
      : trend === 'declining'
        ? 'text-red-600 bg-red-50 border-red-200'
        : 'text-slate-600 bg-slate-50 border-slate-200'

  // Prefer the graph timeline; fall back to history.
  const chartData =
    graph?.timeline?.length
      ? graph.timeline.map((p) => ({ name: `W${p.week}`, annScore: p.annScore, change: p.percentageChange }))
      : history.map((h) => ({ name: `W${h.week}`, annScore: h.annScore }))

  // Crop-cycle phase scores (the 4-phase pipeline).
  const phaseData = cycles.flatMap((c) =>
    (c.phases || []).map((p) => ({
      name: `${c.cropLabel} P${p.phaseNumber}`,
      annScore: p.annScore,
      cropHealth: p.cropHealthScore,
      weather: p.weather,
    }))
  )

  // The weekly-analysis dashboard and the crop-cycle pipeline are separate
  // modules. When there are no weekly uploads, derive the headline numbers from
  // the crop-cycle phases so the page reflects the farmer's real activity.
  const phaseScores = phaseData.map((p) => p.annScore).filter((n) => typeof n === 'number')
  const round1 = (n) => (n == null ? null : Math.round(n * 10) / 10)
  const stats = dashboard?.totalUploads
    ? {
        current: dashboard.currentAnnScore,
        currentLabel: dashboard.currentWeek ? `Week ${dashboard.currentWeek}` : '',
        total: dashboard.totalUploads,
        totalLabel: 'weeks recorded',
        average: dashboard.averageAnnScore,
        low: dashboard.lowestAnnScore,
        high: dashboard.highestAnnScore,
      }
    : {
        current: phaseScores.length ? phaseScores[phaseScores.length - 1] : null,
        currentLabel: phaseScores.length ? 'latest phase' : 'no uploads',
        total: phaseData.length,
        totalLabel: 'phases analyzed',
        average: phaseScores.length ? round1(phaseScores.reduce((a, b) => a + b, 0) / phaseScores.length) : null,
        low: phaseScores.length ? Math.min(...phaseScores) : null,
        high: phaseScores.length ? Math.max(...phaseScores) : null,
      }

  // Latest weather: prefer the weekly module, else the newest phase's snapshot.
  const latestPhaseWeather = [...phaseData].reverse().find((p) => p.weather?.available)?.weather
  const shownWeather = weather?.available ? weather : latestPhaseWeather

  return (
    <div className="space-y-6">
      <Link to="/farmer/fields" className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-800">
        <ArrowLeft className="h-4 w-4" /> My fields
      </Link>

      {/* Field header */}
      <div className="bg-white rounded-xl border border-slate-200 p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">{field.fieldName}</h1>
            <div className="mt-1 flex flex-wrap gap-4 text-sm text-slate-500">
              <span className="flex items-center gap-1"><Sprout className="h-3.5 w-3.5" />{field.cropType}</span>
              <span>{field.area} {field.areaUnit}</span>
              <span className="flex items-center gap-1">
                <MapPin className="h-3.5 w-3.5" />
                {field.location.latitude.toFixed(4)}, {field.location.longitude.toFixed(4)}
              </span>
            </div>
          </div>
          {trend && (
            <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium border ${trendCls}`}>
              <TrendIcon className="h-4 w-4" />
              {trend === 'insufficient-data' ? 'Not enough data' : trend}
            </span>
          )}
        </div>
      </div>

      {/* Stat tiles */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Stat
          label="Current AnnScore"
          value={stats.current ?? '—'}
          sub={stats.currentLabel}
          valueClass={scoreColor(stats.current)}
          icon={BarChart3}
        />
        <Stat label="Total uploads" value={stats.total ?? 0} sub={stats.totalLabel} icon={Calendar} />
        <Stat label="Average" value={stats.average ?? graph?.averageAnnScore ?? '—'} sub="across analyses" icon={TrendingUp} />
        <Stat
          label="Range"
          value={`${stats.low ?? '—'}–${stats.high ?? '—'}`}
          sub="low → high"
          icon={Minus}
        />
      </div>

      {/* Weather + market price */}
      <div className="grid lg:grid-cols-2 gap-4">
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500 mb-3">
            Latest weather at this field
          </h3>
          {shownWeather?.available ? (
            <>
              <div className="flex items-end gap-2">
                <span className="text-4xl font-bold text-slate-900">{Math.round(shownWeather.temperatureC)}°C</span>
                <span className="mb-1 text-sm text-slate-500">{shownWeather.description}</span>
              </div>
              <div className="mt-3 grid grid-cols-2 gap-3">
                <MiniCell icon={Wind} label="Wind" value={`${shownWeather.windSpeedKph} km/h`} />
                <MiniCell icon={Cloud} label="Source" value={shownWeather.source} />
              </div>
            </>
          ) : (
            <p className="text-sm text-slate-500">
              No weather recorded yet — it's captured when you submit a crop phase.
            </p>
          )}
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500 mb-3">
            Live mandi price ({field.cropType})
          </h3>
          {price?.price ? (
            <>
              <div className="flex items-end gap-2">
                <span className="text-4xl font-bold text-slate-900 flex items-center">
                  <IndianRupee className="h-6 w-6" />
                  {price.price.modalPrice}
                </span>
                <span className="mb-1 text-sm text-slate-500">/ quintal</span>
              </div>
              <div className="mt-3 grid grid-cols-2 gap-3">
                <MiniCell icon={Droplets} label="Range" value={`₹${price.price.minPrice}–${price.price.maxPrice}`} />
                <MiniCell icon={MapPin} label="Source" value={price.price.market || price.price.source} />
              </div>
            </>
          ) : (
            <p className="text-sm text-slate-500">Market price unavailable for this crop.</p>
          )}
        </div>
      </div>

      {/* AnnScore timeline */}
      {chartData.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-xl border border-slate-200 p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-slate-900">AnnScore timeline</h3>
            {graph?.overallPercentageChange != null && (
              <span className="text-xs text-slate-500">
                overall {graph.overallPercentageChange > 0 ? '+' : ''}
                {graph.overallPercentageChange}%
              </span>
            )}
          </div>
          <div className="h-[260px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="annGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#10b981" stopOpacity={0.35} />
                    <stop offset="100%" stopColor="#10b981" stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} />
                <Tooltip />
                <Area type="monotone" dataKey="annScore" stroke="#10b981" strokeWidth={3} fill="url(#annGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      )}

      {/* Crop-cycle phase scores */}
      {phaseData.length > 0 && (
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <h3 className="font-semibold text-slate-900 mb-4">Crop-cycle phase scores</h3>
          <div className="h-[260px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={phaseData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} />
                <Tooltip />
                <Line type="monotone" dataKey="annScore" name="AnnScore" stroke="#10b981" strokeWidth={3} dot={{ r: 4 }} />
                <Line type="monotone" dataKey="cropHealth" name="Crop health" stroke="#3b82f6" strokeWidth={2} strokeDasharray="4 4" dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Week history table */}
      {history.length > 0 && (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <div className="p-5 border-b border-slate-200">
            <h3 className="font-semibold text-slate-900">Weekly history</h3>
          </div>
          <div className="divide-y divide-slate-100">
            {history.map((h) => (
              <div key={h.week} className="flex items-center gap-4 px-5 py-3">
                <div className="w-9 h-9 rounded-lg bg-slate-100 grid place-items-center text-sm font-bold text-slate-600">
                  {h.week}
                </div>
                <span className="flex-1 text-sm text-slate-700">Week {h.week}</span>
                <span className={`font-bold ${scoreColor(h.annScore)}`}>{h.annScore}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Empty state */}
      {!stats.total && (
        <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
          <BarChart3 className="h-12 w-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-lg font-semibold text-slate-900">No analysis yet</h3>
          <p className="text-sm text-slate-500 mt-1">
            Upload crop photos for this field to generate scores, graphs and reports.
          </p>
          <Link
            to="/farmer/upload-crop"
            className="mt-4 inline-block px-4 py-2.5 rounded-xl bg-emerald-600 text-white font-medium hover:bg-emerald-700 transition"
          >
            Upload crop photos
          </Link>
        </div>
      )}
    </div>
  )
}

function Stat({ label, value, sub, icon: Icon, valueClass = 'text-slate-900' }) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-4">
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</p>
        {Icon && <Icon className="h-4 w-4 text-slate-300" />}
      </div>
      <p className={`mt-1.5 text-2xl font-bold ${valueClass}`}>{value}</p>
      {sub && <p className="text-xs text-slate-400 mt-0.5">{sub}</p>}
    </div>
  )
}

function MiniCell({ icon: Icon, label, value }) {
  return (
    <div className="rounded-lg border border-slate-200 p-2.5">
      <div className="flex items-center gap-1 text-[11px] text-slate-500">
        <Icon className="h-3 w-3" /> {label}
      </div>
      <p className="mt-0.5 text-sm font-medium text-slate-800 truncate capitalize">{value}</p>
    </div>
  )
}
