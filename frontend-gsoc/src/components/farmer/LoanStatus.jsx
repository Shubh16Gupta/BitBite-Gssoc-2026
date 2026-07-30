/** The farmer's loan applications and their status. */
import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { CheckCircle, Clock, XCircle, Building2, Sprout, FileText, IndianRupee } from 'lucide-react'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'
import { farmerService } from '../../services/farmerService'
import { getErrorMessage } from '../../services/api'

const statusStyles = {
  approved: { cls: 'bg-emerald-50 text-emerald-700 border-emerald-200', Icon: CheckCircle },
  pending: { cls: 'bg-amber-50 text-amber-700 border-amber-200', Icon: Clock },
  rejected: { cls: 'bg-red-50 text-red-700 border-red-200', Icon: XCircle },
}

export default function LoanStatus() {
  const [loans, setLoans] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true
    farmerService
      .getLoans()
      .then((l) => active && setLoans(l))
      .catch((e) => active && toast.error(getErrorMessage(e)))
      .finally(() => active && setLoading(false))
    return () => {
      active = false
    }
  }, [])

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-emerald-600" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Loan Status</h1>
        <p className="text-slate-600">Track your loan applications and their decisions.</p>
      </div>

      {loans.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
          <FileText className="h-12 w-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-lg font-semibold text-slate-900">No applications yet</h3>
          <p className="text-sm text-slate-500 mt-1">Apply to a bank to get started.</p>
          <Link
            to="/farmer/apply-loan"
            className="mt-4 inline-block px-4 py-2.5 rounded-xl bg-emerald-600 text-white font-medium hover:bg-emerald-700 transition"
          >
            Apply for a loan
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {loans.map((l, i) => {
            const st = statusStyles[l.status] || statusStyles.pending
            return (
              <motion.div
                key={l._id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="bg-white rounded-xl border border-slate-200 p-5"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="text-xl font-bold text-slate-900 flex items-center">
                      <IndianRupee className="h-5 w-5" />
                      {l.amount?.toLocaleString('en-IN')}
                    </p>
                    <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-500">
                      <span className="flex items-center gap-1">
                        <Building2 className="h-3 w-3" />
                        {l.bank?.institutionName}
                        {l.bank?.branchName ? ` · ${l.bank.branchName}` : ''}
                      </span>
                      <span className="flex items-center gap-1">
                        <Sprout className="h-3 w-3" />
                        {l.cropType}
                      </span>
                      {l.annScoreAtApply != null && <span>AnnScore {l.annScoreAtApply}</span>}
                      <span>{new Date(l.createdAt).toLocaleDateString()}</span>
                    </div>
                    {l.loanAccountNumber && (
                      <p className="mt-1 text-xs text-emerald-700 flex items-center gap-1">
                        <FileText className="h-3 w-3" /> Account {l.loanAccountNumber}
                      </p>
                    )}
                    {l.decisionNote && (
                      <p className="mt-1 text-xs text-slate-400">Note: {l.decisionNote}</p>
                    )}
                  </div>

                  <span
                    className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${st.cls}`}
                  >
                    <st.Icon className="h-3 w-3" />
                    {l.status}
                  </span>
                </div>
              </motion.div>
            )
          })}
        </div>
      )}
    </div>
  )
}
