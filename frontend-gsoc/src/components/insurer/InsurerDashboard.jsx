/**
 * Insurer dashboard.
 *
 * Review queue of farmer insurance applications (priced from the platform's crop
 * analysis), approve/reject them, and — for approved farmers only — open the full
 * crop-analysis report that justifies the risk.
 */
import { useEffect, useState } from 'react'
import {
  ShieldCheck, IndianRupee, TrendingUp, CheckCircle, XCircle, Clock, FileText,
  RefreshCw, Sprout, MapPin,
} from 'lucide-react'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'
import { insuranceService } from '../../services/insuranceService'
import { getErrorMessage } from '../../services/api'
import FarmerCropReport from './FarmerCropReport'

const inr = (n) => (typeof n === 'number' ? `₹${n.toLocaleString('en-IN')}` : '—')

const TABS = [
  { key: 'pending', label: 'Pending', Icon: Clock },
  { key: 'approved', label: 'Approved', Icon: CheckCircle },
  { key: 'rejected', label: 'Rejected', Icon: XCircle },
]

const riskStyles = {
  low: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  moderate: 'bg-amber-50 text-amber-700 border-amber-200',
  high: 'bg-red-50 text-red-700 border-red-200',
  unrated: 'bg-slate-50 text-slate-600 border-slate-200',
}

const scoreColor = (s) =>
  s == null ? 'text-slate-400' : s >= 85 ? 'text-emerald-600' : s >= 70 ? 'text-lime-600' : s >= 50 ? 'text-amber-600' : 'text-red-600'

export default function InsurerDashboard() {
  const [summary, setSummary] = useState(null)
  const [tab, setTab] = useState('pending')
  const [apps, setApps] = useState([])
  const [loading, setLoading] = useState(true)
  const [acting, setActing] = useState(null)
  const [openFarmer, setOpenFarmer] = useState(null)

  const load = async (status = tab) => {
    setLoading(true)
    try {
      const [s, list] = await Promise.all([
        insuranceService.dashboard(),
        insuranceService.applications(status),
      ])
      setSummary(s)
      setApps(list)
    } catch (e) {
      toast.error(getErrorMessage(e))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load(tab)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab])

  const decide = async (id, action) => {
    setActing(id)
    try {
      if (action === 'approve') {
        await insuranceService.approve(id, 'Approved based on crop analysis')
        toast.success('Approved — policy issued. Crop reports are now visible.')
      } else {
        await insuranceService.reject(id, 'Risk outside underwriting criteria')
        toast.success('Application rejected.')
      }
      await load(tab)
    } catch (e) {
      toast.error(getErrorMessage(e))
    } finally {
      setActing(null)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Underwriting Dashboard</h1>
          <p className="text-sm text-slate-500">
            Applications priced from live crop analysis. Approve one to unlock that farmer's report.
          </p>
        </div>
        <button
          onClick={() => load(tab)}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-teal-600 text-white text-sm font-medium hover:bg-teal-700 transition shadow-lg shadow-teal-500/25"
        >
          <RefreshCw className="h-4 w-4" /> Refresh
        </button>
      </div>

      {/* Summary */}
      {summary && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Stat label="Pending" value={summary.pendingApplications} Icon={Clock} accent="text-amber-600" />
          <Stat label="Active policies" value={summary.approvedPolicies} Icon={ShieldCheck} accent="text-emerald-600" />
          <Stat label="Total sum insured" value={inr(summary.totalSumInsured)} Icon={IndianRupee} />
          <Stat label="Premium collected" value={inr(summary.totalPremium)} Icon={TrendingUp} />
        </div>
      )}

      {/* Tabs */}
      <div className="flex flex-wrap gap-2">
        {TABS.map(({ key, label, Icon }) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium border transition ${
              tab === key
                ? 'bg-teal-600 text-white border-teal-600 shadow-lg shadow-teal-500/25'
                : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
            }`}
          >
            <Icon className="h-4 w-4" /> {label}
          </button>
        ))}
      </div>

      {/* Applications */}
      {loading ? (
        <div className="flex justify-center py-16">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-teal-600" />
        </div>
      ) : apps.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
          <ShieldCheck className="h-12 w-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-lg font-semibold text-slate-900">No {tab} applications</h3>
          <p className="text-sm text-slate-500 mt-1">
            {tab === 'pending'
              ? 'New farmer applications will appear here for review.'
              : `You have no ${tab} applications yet.`}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {apps.map((a, i) => (
            <motion.div
              key={a._id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
              className="bg-white rounded-xl border border-slate-200 p-5"
            >
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-semibold text-slate-900">{a.farmer?.name || 'Farmer'}</h3>
                    <span className={`px-2.5 py-1 rounded-full text-xs font-semibold border ${riskStyles[a.riskBand] || riskStyles.unrated}`}>
                      {a.riskBand} risk
                    </span>
                    {a.annScoreAtApply != null && (
                      <span className={`text-sm font-bold ${scoreColor(a.annScoreAtApply)}`}>
                        AnnScore {a.annScoreAtApply}
                      </span>
                    )}
                  </div>

                  <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-500">
                    <span className="flex items-center gap-1"><Sprout className="h-3 w-3" />{a.cropLabel}</span>
                    <span>{a.farmSize} {a.farmSizeUnit}</span>
                    {a.field?.fieldName && <span>{a.field.fieldName}</span>}
                    {a.farmer?.phone && <span>{a.farmer.phone}</span>}
                    {a.farmer && (
                      <span className="flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {[a.farmer.village, a.farmer.district, a.farmer.state].filter(Boolean).join(', ')}
                      </span>
                    )}
                  </div>

                  <div className="mt-3 grid grid-cols-2 sm:grid-cols-4 gap-2">
                    <MiniCell label="Sum insured" value={inr(a.sumInsured)} />
                    <MiniCell label="Premium" value={`${inr(a.premium)} (${a.premiumRatePct}%)`} />
                    <MiniCell label="Pred. yield" value={`${a.predictedYield ?? '—'} qtl`} />
                    <MiniCell label="Mandi price" value={`₹${a.marketPricePerQuintal ?? '—'}/qtl`} />
                  </div>

                  {a.policyNumber && (
                    <p className="mt-2 text-xs text-emerald-700 flex items-center gap-1">
                      <FileText className="h-3 w-3" /> Policy {a.policyNumber}
                    </p>
                  )}
                </div>

                {/* Actions */}
                <div className="flex flex-col gap-2 shrink-0">
                  {a.status === 'pending' ? (
                    <>
                      <button
                        onClick={() => decide(a._id, 'approve')}
                        disabled={acting === a._id}
                        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 text-white text-sm font-medium hover:bg-emerald-700 transition disabled:opacity-60"
                      >
                        <CheckCircle className="h-4 w-4" /> Approve
                      </button>
                      <button
                        onClick={() => decide(a._id, 'reject')}
                        disabled={acting === a._id}
                        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-red-200 text-red-600 text-sm font-medium hover:bg-red-50 transition disabled:opacity-60"
                      >
                        <XCircle className="h-4 w-4" /> Reject
                      </button>
                    </>
                  ) : a.status === 'approved' ? (
                    <button
                      onClick={() => setOpenFarmer(a.farmer?._id)}
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-teal-600 text-white text-sm font-medium hover:bg-teal-700 transition"
                    >
                      <FileText className="h-4 w-4" /> View crop report
                    </button>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border bg-red-50 text-red-700 border-red-200">
                      <XCircle className="h-3 w-3" /> rejected
                    </span>
                  )}
                </div>
              </div>

              {a.coverageNote && a.status === 'pending' && (
                <p className="mt-3 text-xs leading-relaxed text-slate-500 bg-slate-50 rounded-lg p-2.5">
                  {a.coverageNote}
                </p>
              )}
            </motion.div>
          ))}
        </div>
      )}

      {openFarmer && (
        <FarmerCropReport farmerId={openFarmer} onClose={() => setOpenFarmer(null)} />
      )}
    </div>
  )
}

function Stat({ label, value, Icon, accent = 'text-slate-900' }) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-4">
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</p>
        {Icon && <Icon className="h-4 w-4 text-slate-300" />}
      </div>
      <p className={`mt-1.5 text-2xl font-bold ${accent}`}>{value}</p>
    </div>
  )
}

function MiniCell({ label, value }) {
  return (
    <div className="rounded-lg border border-slate-200 p-2">
      <p className="text-[11px] text-slate-500">{label}</p>
      <p className="mt-0.5 text-sm font-semibold text-slate-800 truncate">{value}</p>
    </div>
  )
}
