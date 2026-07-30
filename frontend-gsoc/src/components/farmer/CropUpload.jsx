import { useState, useEffect, useRef, useMemo } from 'react'
import {
  Camera, Upload, X, MapPin, CheckCircle, Sprout, Cloud, Droplets,
  TrendingUp, IndianRupee, ShieldCheck, AlertTriangle, Plus
} from 'lucide-react'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'
import { farmerService } from '../../services/farmerService'
import { getErrorMessage } from '../../services/api'

const MIN_IMAGES = 3
const MAX_IMAGES = 5

export default function CropUpload() {
  // Reference data
  const [fields, setFields] = useState([])
  const [catalog, setCatalog] = useState([])
  const [cycles, setCycles] = useState([])

  // Selection
  const [fieldId, setFieldId] = useState('')
  const [cycleId, setCycleId] = useState('')
  const [cycle, setCycle] = useState(null)

  // New-cycle form
  const [showNewCycle, setShowNewCycle] = useState(false)
  const [cropType, setCropType] = useState('')
  const [sowingDate, setSowingDate] = useState('')

  // Upload
  const [files, setFiles] = useState([])
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(true)
  const fileInputRef = useRef(null)

  const previews = useMemo(
    () => files.map((f) => ({ name: f.name, url: URL.createObjectURL(f) })),
    [files]
  )
  useEffect(() => () => previews.forEach((p) => URL.revokeObjectURL(p.url)), [previews])

  // Load fields + crop catalog once.
  useEffect(() => {
    ;(async () => {
      try {
        const [f, c] = await Promise.all([
          farmerService.getFields(),
          farmerService.getCropCatalog(),
        ])
        setFields(f)
        setCatalog(c)
        if (f.length) setFieldId(f[0]._id)
      } catch (e) {
        toast.error(getErrorMessage(e))
      } finally {
        setLoading(false)
      }
    })()
  }, [])

  // Load cycles whenever the field changes.
  useEffect(() => {
    if (!fieldId) return
    ;(async () => {
      try {
        const list = await farmerService.getCropCycles(fieldId)
        setCycles(list)
        const active = list.find((c) => c.status === 'active') || list[0]
        setCycleId(active?._id || '')
        setCycle(active || null)
        setShowNewCycle(!active)
      } catch (e) {
        toast.error(getErrorMessage(e))
      }
    })()
  }, [fieldId])

  const refreshCycle = async (id) => {
    const fresh = await farmerService.getCropCycle(id)
    setCycle(fresh)
    setCycles((prev) => prev.map((c) => (c._id === id ? fresh : c)))
  }

  const startCycle = async (e) => {
    e.preventDefault()
    try {
      const created = await farmerService.startCropCycle({ fieldId, cropType, sowingDate })
      setCycles((prev) => [created, ...prev])
      setCycleId(created._id)
      setCycle(created)
      setShowNewCycle(false)
      toast.success(`${created.cropLabel} cycle started — ${created.totalPhases} phases`)
    } catch (err) {
      toast.error(getErrorMessage(err))
    }
  }

  // Accumulate images (deduped, capped) instead of replacing.
  const addFiles = (e) => {
    const incoming = Array.from(e.target.files || [])
    setFiles((prev) => {
      const out = [...prev]
      for (const f of incoming) {
        if (out.length >= MAX_IMAGES) break
        if (!f.type.startsWith('image/')) continue
        if (f.size > 5 * 1024 * 1024) {
          toast.error(`${f.name} is larger than 5MB`)
          continue
        }
        if (!out.some((x) => x.name === f.name && x.size === f.size)) out.push(f)
      }
      return out
    })
    e.target.value = ''
    setResult(null)
  }

  const removeAt = (i) => setFiles((prev) => prev.filter((_, idx) => idx !== i))

  // Next unsubmitted phase.
  const submittedPhases = new Set((cycle?.phases || []).map((p) => p.phaseNumber))
  const nextPhase = [1, 2, 3, 4].find(
    (n) => n <= (cycle?.totalPhases || 4) && !submittedPhases.has(n)
  )
  const nextStage = cycle?.phaseSchedule?.find((s) => s.phaseNumber === nextPhase)?.stageName
  const countOk = files.length >= MIN_IMAGES && files.length <= MAX_IMAGES

  const handleUpload = async () => {
    if (!cycleId) return toast.error('Start a crop cycle first')
    if (!countOk) return toast.error(`Please add ${MIN_IMAGES}–${MAX_IMAGES} photos`)

    const fd = new FormData()
    fd.append('phaseNumber', String(nextPhase))
    files.forEach((f) => fd.append('images', f))

    setUploading(true)
    setProgress(0)
    try {
      const res = await farmerService.submitPhase(cycleId, fd, (evt) => {
        if (evt.total) setProgress(Math.round((evt.loaded / evt.total) * 100))
      })
      setResult(res)
      setFiles([])
      await refreshCycle(cycleId)
      toast.success(
        res.report?.isFinalPhase
          ? 'Final phase analyzed — cycle complete!'
          : `Phase ${nextPhase} analyzed successfully`
      )
    } catch (err) {
      toast.error(getErrorMessage(err))
    } finally {
      setUploading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600" />
      </div>
    )
  }

  if (!fields.length) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 p-10 text-center">
        <Sprout className="h-12 w-12 text-emerald-500 mx-auto mb-3" />
        <h3 className="text-lg font-semibold text-slate-900">No fields yet</h3>
        <p className="text-sm text-slate-500 mt-1">
          Add a field (with its GPS location) from your profile before uploading crop photos.
        </p>
      </div>
    )
  }

  const report = result?.report

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Crop Analysis</h1>
        <p className="text-slate-500">
          Upload {MIN_IMAGES}–{MAX_IMAGES} photos each phase — we score crop health, fetch weather &amp;
          rainfall for your field, and predict yield.
        </p>
      </div>

      {/* Field + cycle selection */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-4">
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Field</label>
            <select
              value={fieldId}
              onChange={(e) => setFieldId(e.target.value)}
              className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
            >
              {fields.map((f) => (
                <option key={f._id} value={f._id}>
                  {f.fieldName} — {f.area} {f.areaUnit} ({f.cropType})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Crop cycle</label>
            <div className="flex gap-2">
              <select
                value={cycleId}
                onChange={async (e) => {
                  setCycleId(e.target.value)
                  if (e.target.value) await refreshCycle(e.target.value)
                }}
                className="flex-1 px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
              >
                <option value="">Select a cycle…</option>
                {cycles.map((c) => (
                  <option key={c._id} value={c._id}>
                    {c.cropLabel} · {c.phases?.length || 0}/{c.totalPhases} phases · {c.status}
                  </option>
                ))}
              </select>
              <button
                type="button"
                onClick={() => setShowNewCycle((s) => !s)}
                className="px-3 py-2.5 rounded-xl bg-emerald-600 text-white hover:bg-emerald-700 transition"
                title="Start a new cycle"
              >
                <Plus className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>

        {showNewCycle && (
          <form onSubmit={startCycle} className="grid md:grid-cols-3 gap-3 pt-3 border-t border-slate-100">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Crop type</label>
              <select
                value={cropType}
                onChange={(e) => setCropType(e.target.value)}
                required
                className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
              >
                <option value="">Select crop…</option>
                {catalog.map((c) => (
                  <option key={c.key} value={c.key}>
                    {c.label} ({c.minDays}–{c.maxDays} days)
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Sowing date</label>
              <input
                type="date"
                value={sowingDate}
                max={new Date().toISOString().slice(0, 10)}
                onChange={(e) => setSowingDate(e.target.value)}
                required
                className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
              />
            </div>
            <div className="flex items-end">
              <button className="w-full px-4 py-2.5 rounded-xl bg-emerald-600 text-white font-medium hover:bg-emerald-700 transition">
                Start cycle
              </button>
            </div>
          </form>
        )}

        {/* Phase progress */}
        {cycle && (
          <div className="pt-3 border-t border-slate-100">
            <div className="flex items-center justify-between text-sm mb-2">
              <span className="font-medium text-slate-700">
                {cycle.cropLabel} · {cycle.farmSize} {cycle.farmSizeUnit}
              </span>
              <span className="text-slate-500">
                {cycle.phases?.length || 0}/{cycle.totalPhases} phases
              </span>
            </div>
            <div className="flex gap-2">
              {(cycle.phaseSchedule || []).map((s) => {
                const done = submittedPhases.has(s.phaseNumber)
                const isNext = s.phaseNumber === nextPhase
                return (
                  <div
                    key={s.phaseNumber}
                    className={`flex-1 rounded-lg px-3 py-2 text-xs border ${
                      done
                        ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
                        : isNext
                          ? 'bg-amber-50 border-amber-200 text-amber-700'
                          : 'bg-slate-50 border-slate-200 text-slate-500'
                    }`}
                  >
                    <div className="font-semibold">
                      {done ? '✓' : s.phaseNumber}. {s.stageName}
                    </div>
                    {isNext && <div className="mt-0.5">next</div>}
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </div>

      {/* Final yield banner */}
      {cycle?.status === 'completed' && cycle.finalYield && (
        <motion.div
          initial={{ opacity: 0, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-gradient-to-br from-emerald-50 to-cyan-50 border border-emerald-200 rounded-xl p-6"
        >
          <p className="text-xs font-semibold uppercase tracking-wider text-emerald-700">
            Final predicted yield
          </p>
          <p className="mt-1 text-4xl font-bold text-slate-900">
            {cycle.finalYield.estimatedYield}{' '}
            <span className="text-lg font-semibold text-slate-500">{cycle.finalYield.unit}</span>
          </p>
          <p className="mt-1 text-sm text-slate-600">
            {cycle.finalYield.confidence}% confidence
          </p>
        </motion.div>
      )}

      {/* Upload panel */}
      {cycle && cycle.status === 'active' && nextPhase && (
        <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white grid place-items-center font-bold">
              {nextPhase}
            </div>
            <div>
              <h3 className="font-semibold text-slate-900">Submit Phase {nextPhase}</h3>
              <p className="text-xs text-slate-500">{nextStage}</p>
            </div>
          </div>

          <div
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-slate-300 rounded-xl p-8 text-center cursor-pointer hover:border-emerald-500 hover:bg-emerald-50/30 transition"
          >
            <Camera className="h-12 w-12 text-slate-400 mx-auto" />
            <p className="mt-2 font-medium text-slate-700">
              Take crop photos ({MIN_IMAGES}–{MAX_IMAGES})
            </p>
            <p className="text-xs text-slate-500">
              Opens the camera on mobile · photos are verified for location, time &amp; originality
            </p>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              multiple
              onChange={addFiles}
              className="hidden"
            />
          </div>

          {files.length > 0 && (
            <div>
              <div className="flex items-center justify-between text-xs mb-2">
                <span className={countOk ? 'text-emerald-600' : 'text-amber-600'}>
                  {files.length}/{MAX_IMAGES} selected {countOk ? '' : `(need at least ${MIN_IMAGES})`}
                </span>
                <button onClick={() => setFiles([])} className="text-slate-400 hover:text-red-500">
                  Clear all
                </button>
              </div>
              <div className="grid grid-cols-5 gap-2">
                {previews.map((p, i) => (
                  <div key={i} className="relative aspect-square rounded-lg overflow-hidden border border-slate-200 group">
                    <img src={p.url} alt={p.name} className="w-full h-full object-cover" />
                    <button
                      onClick={() => removeAt(i)}
                      className="absolute top-1 right-1 p-0.5 bg-black/60 text-white rounded-full opacity-0 group-hover:opacity-100 transition"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {uploading && (
            <div>
              <div className="flex justify-between text-xs text-slate-500 mb-1">
                <span>Uploading &amp; analyzing…</span>
                <span>{progress}%</span>
              </div>
              <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-emerald-600 transition-all" style={{ width: `${progress}%` }} />
              </div>
            </div>
          )}

          <button
            onClick={handleUpload}
            disabled={uploading || !countOk}
            className="w-full py-3 rounded-xl bg-emerald-600 text-white font-semibold hover:bg-emerald-700 transition disabled:opacity-60 flex items-center justify-center gap-2"
          >
            <Upload className="h-4 w-4" />
            {uploading ? 'Analyzing…' : `Analyze Phase ${nextPhase}`}
          </button>
        </div>
      )}

      {/* Latest phase report */}
      {report && (
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl border border-slate-200 p-5 space-y-4"
        >
          <div className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-emerald-600" />
            <h3 className="font-semibold text-slate-900">
              Phase {report.phase?.number} report — {report.phase?.stage}
            </h3>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <Metric
              icon={Sprout}
              label="Crop health"
              value={`${report.cropHealth?.score ?? '—'}/100`}
              sub={report.cropHealth?.label}
            />
            <Metric
              icon={Cloud}
              label="Weather"
              value={report.weather?.category || '—'}
              sub={report.weather?.summary}
            />
            <Metric icon={Droplets} label="Rainfall" value={report.rainfall?.summary || '—'} />
            <Metric
              icon={TrendingUp}
              label="Yield estimate"
              value={`${report.yield?.estimatedYield ?? '—'} ${report.yield?.unit || ''}`}
              sub={`${report.yield?.confidence ?? '—'}% confidence`}
            />
          </div>

          {report.estimatedRevenue != null && (
            <div className="flex items-center justify-between rounded-xl bg-emerald-50 border border-emerald-200 px-4 py-3">
              <span className="text-sm font-medium text-emerald-700 flex items-center gap-2">
                <IndianRupee className="h-4 w-4" /> Estimated market value
              </span>
              <span className="font-bold text-slate-900">
                ₹{report.estimatedRevenue.toLocaleString('en-IN')}
                {report.market && (
                  <span className="ml-1 text-xs font-normal text-slate-500">
                    @ ₹{report.market.modalPrice}/qtl · {report.market.source}
                  </span>
                )}
              </span>
            </div>
          )}

          {report.verification && (
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
              <div className="flex flex-wrap items-center gap-2 text-xs">
                <span className="font-semibold text-slate-600 flex items-center gap-1">
                  <ShieldCheck className="h-4 w-4" /> Data confidence
                </span>
                <Pill ok={report.verification.level === 'high'}>
                  {report.verification.confidence}/100 · {report.verification.level}
                </Pill>
                <Pill ok={report.verification.locationVerified}>
                  📍 {report.verification.locationVerified ? 'location verified' : 'location unverified'}
                </Pill>
                <Pill ok={report.verification.timeVerified}>
                  🕐 {report.verification.timeVerified ? 'time verified' : 'time unverified'}
                </Pill>
              </div>
              {report.verification.flags?.length > 0 && (
                <ul className="mt-2 space-y-1">
                  {report.verification.flags.map((f, i) => (
                    <li key={i} className="text-xs text-amber-600 flex items-start gap-1">
                      <AlertTriangle className="h-3.5 w-3.5 mt-0.5 flex-shrink-0" /> {f}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}

          {report.recommendations?.length > 0 && (
            <div>
              <p className="text-sm font-semibold text-slate-700 mb-1">Recommendations</p>
              <ul className="space-y-1">
                {report.recommendations.map((r, i) => (
                  <li key={i} className="text-sm text-slate-600 flex gap-2">
                    <span className="text-emerald-500">•</span>
                    {r}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {report.summary && (
            <p className="text-xs leading-relaxed text-slate-500 bg-slate-50 rounded-lg p-3">
              {report.summary}
            </p>
          )}
        </motion.div>
      )}
    </div>
  )
}

function Metric({ icon: Icon, label, value, sub }) {
  return (
    <div className="rounded-xl border border-slate-200 p-3">
      <div className="flex items-center gap-1.5 text-xs text-slate-500">
        <Icon className="h-3.5 w-3.5" />
        {label}
      </div>
      <p className="mt-1 font-semibold text-slate-900 text-sm capitalize">{value}</p>
      {sub && <p className="text-xs text-slate-400 truncate">{sub}</p>}
    </div>
  )
}

function Pill({ ok, children }) {
  return (
    <span
      className={`px-2 py-0.5 rounded-full border ${
        ok ? 'bg-emerald-50 border-emerald-200 text-emerald-700' : 'bg-slate-100 border-slate-200 text-slate-500'
      }`}
    >
      {children}
    </span>
  )
}
