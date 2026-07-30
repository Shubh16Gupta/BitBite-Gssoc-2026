/**
 * Crop Insurance (farmer).
 *
 * Pick a crop cycle → see a live quote (cover = predicted yield × mandi price,
 * premium priced off the farmer's AnnScore) → apply. Existing applications and
 * their status/policy numbers are listed below.
 */
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  ShieldCheck, IndianRupee, TrendingUp, Sprout, CheckCircle, Clock, XCircle,
  FileText, AlertTriangle,
} from 'lucide-react'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'
import { farmerService } from '../../services/farmerService'
import { insuranceService } from '../../services/insuranceService'
import { getErrorMessage } from '../../services/api'

const inr = (n) => (typeof n === 'number' ? `₹${n.toLocaleString('en-IN')}` : '—')

const riskStyles = {
  low: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  moderate: 'bg-amber-50 text-amber-700 border-amber-200',
  high: 'bg-red-50 text-red-700 border-red-200',
  unrated: 'bg-slate-50 text-slate-600 border-slate-200',
}

const statusStyles = {
  approved: { cls: 'bg-emerald-50 text-emerald-700 border-emerald-200', Icon: CheckCircle },
  pending: { cls: 'bg-amber-50 text-amber-700 border-amber-200', Icon: Clock },
  rejected: { cls: 'bg-red-50 text-red-700 border-red-200', Icon: XCircle },
}

export default function Insurance() {
  const [cycles, setCycles] = useState([])
  const [applications, setApplications] = useState([])
  const [cycleId, setCycleId] = useState('')
  const [quote, setQuote] = useState(null)
  const [loading, setLoading] = useState(true)
  const [quoting, setQuoting] = useState(false)
  const [applying, setApplying] = useState(false)

  const load = async () => {
    try {
      const [cyc, apps] = await Promise.all([
        farmerService.getCropCycles(),
        insuranceService.myApplications(),
      ])
      setCycles(cyc)
      setApplications(apps)
      if (!cycleId && cyc.length) setCycleId(cyc[0]._id)
    } catch (e) {
      toast.error(getErrorMessage(e))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Fetch a quote whenever the selected cycle changes.
  useEffect(() => {
    if (!cycleId) return setQuote(null)
    let active = true
    setQuoting(true)
    insuranceService
      .getQuote(cycleId)
      .then((q) => active && setQuote(q))
      .catch((e) => {
        if (active) {
          setQuote(null)
          toast.error(getErrorMessage(e))
        }
      })
      .finally(() => active && setQuoting(false))
    return () => {
      active = false
    }
  }, [cycleId])

  const alreadyApplied = applications.find((a) => (a.cropCycle?._id || a.cropCycle) === cycleId)

  const submit = async () => {
    setApplying(true)
    try {
      await insuranceService.apply(cycleId)
      toast.success('Insurance application submitted!')
      await load()
    } catch (e) {
      toast.error(getErrorMessage(e))
    } finally {
      setApplying(false)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
          <ShieldCheck className="h-6 w-6 text-emerald-600" />
          Crop Insurance
        </h1>
        <p className="text-sm text-slate-500">
          Your cover is priced from your crop's predicted value and your AnnScore — healthier,
          well-monitored crops get a lower premium.
        </p>
      </div>

      {cycles.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
          <Sprout className="h-12 w-12 text-emerald-400 mx-auto mb-3" />
          <h3 className="text-lg font-semibold text-slate-900">No crop cycles yet</h3>
          <p className="text-sm text-slate-500 mt-1">
            Start a crop cycle and upload photos — insurance is priced from that analysis.
          </p>
          <Link
            to="/farmer/upload-crop"
            className="mt-4 inline-block px-4 py-2.5 rounded-xl bg-emerald-600 text-white font-medium hover:bg-emerald-700 transition"
          >
            Go to Crop Analysis
          </Link>
        </div>
      ) : (
        <>
          {/* Quote + apply */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Select a crop cycle to insure
              </label>
              <select
                value={cycleId}
                onChange={(e) => setCycleId(e.target.value)}
                className="input-base"
              >
                {cycles.map((c) => (
                  <option key={c._id} value={c._id}>
                    {c.cropLabel} · {c.phases?.length || 0}/{c.totalPhases} phases · {c.status}
                  </option>
                ))}
              </select>
            </div>

            {quoting && <p className="text-sm text-slate-500">Calculating your quote…</p>}

            {quote && !quoting && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-xl border border-emerald-200 bg-emerald-50/50 p-5"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-emerald-700">
                      Your quote
                    </p>
                    <p className="mt-1 text-3xl font-bold text-slate-900 flex items-center">
                      <IndianRupee className="h-6 w-6" />
                      {quote.premium?.toLocaleString('en-IN')}
                      <span className="ml-2 text-sm font-normal text-slate-500">
                        premium ({quote.premiumRatePct}%)
                      </span>
                    </p>
                  </div>
                  <span
                    className={`px-3 py-1.5 rounded-full text-xs font-semibold border ${riskStyles[quote.riskBand] || riskStyles.unrated}`}
                  >
                    {quote.riskBand} risk
                  </span>
                </div>

                <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-3">
                  <Cell icon={ShieldCheck} label="Sum insured" value={inr(quote.sumInsured)} />
                  <Cell icon={TrendingUp} label="AnnScore" value={quote.annScoreAtApply ?? 'not scored'} />
                  <Cell icon={Sprout} label="Predicted yield" value={`${quote.predictedYield ?? '—'} qtl`} />
                  <Cell icon={IndianRupee} label="Mandi price" value={`₹${quote.marketPricePerQuintal ?? '—'}/qtl`} />
                </div>

                {quote.coverageNote && (
                  <p className="mt-3 text-xs leading-relaxed text-slate-600">{quote.coverageNote}</p>
                )}

                {quote.annScoreAtApply == null && (
                  <p className="mt-3 text-xs text-amber-700 flex items-start gap-1.5">
                    <AlertTriangle className="h-3.5 w-3.5 mt-0.5 flex-shrink-0" />
                    This crop has no analysis yet, so you're quoted the default (highest) rate.
                    Upload phase photos to lower your premium.
                  </p>
                )}

                <div className="mt-4">
                  {alreadyApplied ? (
                    <p className="text-sm font-medium text-slate-600">
                      You already have a{' '}
                      <span className="font-bold">{alreadyApplied.status}</span> application for this
                      cycle.
                    </p>
                  ) : (
                    <button
                      onClick={submit}
                      disabled={applying || !quote.sumInsured}
                      className="px-5 py-2.5 rounded-xl bg-emerald-600 text-white font-medium hover:bg-emerald-700 transition disabled:opacity-60"
                    >
                      {applying ? 'Submitting…' : 'Apply for insurance'}
                    </button>
                  )}
                </div>
              </motion.div>
            )}
          </div>

          {/* My applications */}
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500 mb-3">
              My applications
            </h3>
            {applications.length === 0 ? (
              <p className="bg-white rounded-xl border border-slate-200 p-5 text-sm text-slate-500">
                No applications yet — get a quote above and apply.
              </p>
            ) : (
              <div className="space-y-3">
                {applications.map((a) => {
                  const st = statusStyles[a.status] || statusStyles.pending
                  return (
                    <div key={a._id} className="bg-white rounded-xl border border-slate-200 p-4">
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <div>
                          <p className="font-semibold text-slate-900">
                            {a.cropLabel}
                            {a.field?.fieldName && (
                              <span className="ml-2 text-sm font-normal text-slate-500">
                                · {a.field.fieldName}
                              </span>
                            )}
                          </p>
                          <p className="text-xs text-slate-500 mt-0.5">
                            Cover {inr(a.sumInsured)} · Premium {inr(a.premium)} ({a.premiumRatePct}%)
                            {a.annScoreAtApply != null && ` · AnnScore ${a.annScoreAtApply}`}
                          </p>
                          {a.policyNumber && (
                            <p className="text-xs text-emerald-700 mt-1 flex items-center gap-1">
                              <FileText className="h-3 w-3" /> Policy {a.policyNumber}
                              {a.insurer?.companyName && ` · ${a.insurer.companyName}`}
                            </p>
                          )}
                          {a.decisionNote && (
                            <p className="text-xs text-slate-400 mt-1">Note: {a.decisionNote}</p>
                          )}
                        </div>
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${st.cls}`}
                        >
                          <st.Icon className="h-3 w-3" />
                          {a.status}
                        </span>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  )
}

function Cell({ icon: Icon, label, value }) {
  return (
    <div className="rounded-lg border border-white bg-white/70 p-3">
      <div className="flex items-center gap-1 text-[11px] text-slate-500">
        <Icon className="h-3 w-3" /> {label}
      </div>
      <p className="mt-0.5 text-sm font-semibold text-slate-900 capitalize">{value}</p>
    </div>
  )
}
