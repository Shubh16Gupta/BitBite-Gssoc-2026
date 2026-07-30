import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { 
  Search, 
  Filter, 
  Eye, 
  CheckCircle, 
  XCircle, 
  Clock,
  Download,
  ChevronDown,
  Users,
  DollarSign,
  Calendar,
  FileText
} from 'lucide-react'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'
import { bankService } from '../../services/bankService'
import { getErrorMessage } from '../../services/api'

export default function LoanRequests() {
  const [requests, setRequests] = useState([])
  const [filter, setFilter] = useState('all')
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [selectedRequests, setSelectedRequests] = useState([])

  const load = async (status = filter) => {
    setLoading(true)
    try {
      const list = await bankService.loans(status === 'all' ? undefined : status)
      setRequests(
        (list || []).map((l) => ({
          id: l._id,
          farmerId: l.farmer?._id,
          farmer: l.farmer?.name || 'Farmer',
          phone: l.farmer?.phone,
          amount: l.amount,
          crop: l.cropType,
          score: l.annScoreAtApply,
          cropHealth: l.cropHealthAtApply,
          village: [l.farmer?.village, l.farmer?.district, l.farmer?.state].filter(Boolean).join(', '),
          landArea: l.landArea ?? l.farmer?.landArea,
          purpose: l.purpose,
          existingLoans: l.existingLoans,
          yieldEstimate: l.predictedYield || 0,
          accountNumber: l.loanAccountNumber,
          status: l.status,
          date: l.createdAt ? new Date(l.createdAt).toLocaleDateString() : '',
        }))
      )
    } catch (e) {
      toast.error(getErrorMessage(e))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load(filter)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter])

  const getStatusBadge = (status) => {
    const styles = {
      pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      approved: 'bg-green-100 text-green-800 border-green-200',
      rejected: 'bg-red-100 text-red-800 border-red-200'
    }
    const icons = {
      pending: Clock,
      approved: CheckCircle,
      rejected: XCircle
    }
    const Icon = icons[status] || Clock
    return (
      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${styles[status] || styles.pending}`}>
        <Icon className="h-3 w-3" />
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    )
  }

  const handleAction = async (id, action) => {
    try {
      if (action === 'approved') await bankService.approveLoan(id, 'Approved on crop-analysis data')
      else await bankService.rejectLoan(id, 'Does not meet lending criteria')
      toast.success(`Loan ${action} successfully!`)
      await load(filter)
    } catch (error) {
      toast.error(getErrorMessage(error))
    }
  }

  const handleBulkAction = async (action) => {
    if (selectedRequests.length === 0) {
      toast.error('Please select at least one loan')
      return
    }
    try {
      await Promise.all(
        selectedRequests.map((id) =>
          action === 'approved'
            ? bankService.approveLoan(id, 'Bulk approved')
            : bankService.rejectLoan(id, 'Bulk rejected')
        )
      )
      toast.success(`${selectedRequests.length} loan(s) ${action}!`)
      setSelectedRequests([])
      await load(filter)
    } catch (error) {
      toast.error(getErrorMessage(error))
    }
  }

  const toggleSelect = (id) => {
    setSelectedRequests(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    )
  }

  const toggleSelectAll = () => {
    if (selectedRequests.length === filteredRequests.length) {
      setSelectedRequests([])
    } else {
      setSelectedRequests(filteredRequests.map(req => req.id))
    }
  }

  const filteredRequests = requests.filter(req => {
    const matchesFilter = true
    const matchesSearch = req.farmer.toLowerCase().includes(search.toLowerCase()) ||
                         req.crop.toLowerCase().includes(search.toLowerCase()) ||
                         req.village.toLowerCase().includes(search.toLowerCase())
    return matchesFilter && matchesSearch
  })

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="flex flex-col items-center gap-3">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
          <p className="text-sm text-slate-500">Loading loan requests...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Loan Requests</h1>
          <p className="text-sm text-slate-500">Review and manage loan applications</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 transition-all text-sm">
            <Download className="h-4 w-4" />
            Export
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 bg-white rounded-xl p-4 border border-slate-200/50 shadow-sm">
        <div className="flex-1 relative">
          <Search className="absolute left-3.5 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search by farmer, crop, or village..."
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-transparent transition-all text-sm"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex gap-2 overflow-x-auto">
          {['all', 'pending', 'approved', 'rejected'].map((status) => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${
                filter === status
                  ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-500/30'
                  : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
              }`}
            >
              {status.charAt(0).toUpperCase() + status.slice(1)}
              <span className="ml-2 px-1.5 py-0.5 rounded-full text-xs bg-white/20">
                {requests.filter(r => status === 'all' || r.status === status).length}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Bulk Actions */}
      {selectedRequests.length > 0 && (
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-3 p-3 bg-emerald-50 rounded-xl border border-emerald-200"
        >
          <span className="text-sm font-medium text-emerald-700">
            {selectedRequests.length} selected
          </span>
          <div className="flex gap-2">
            <button 
              onClick={() => handleBulkAction('approved')}
              className="px-4 py-1.5 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-medium transition-colors"
            >
              Approve All
            </button>
            <button 
              onClick={() => handleBulkAction('rejected')}
              className="px-4 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium transition-colors"
            >
              Reject All
            </button>
          </div>
          <button 
            onClick={() => setSelectedRequests([])}
            className="text-sm text-slate-500 hover:text-slate-700 ml-auto"
          >
            Clear Selection
          </button>
        </motion.div>
      )}

      {/* Requests Table */}
      <div className="bg-white rounded-xl border border-slate-200/50 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-4 py-3 text-left">
                  <input
                    type="checkbox"
                    checked={selectedRequests.length === filteredRequests.length && filteredRequests.length > 0}
                    onChange={toggleSelectAll}
                    className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                  />
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Farmer</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Pred. Yield</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Crop</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">AnnScore</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Date</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Status</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200/50">
              {filteredRequests.length === 0 ? (
                <tr>
                  <td colSpan="8" className="px-4 py-12 text-center text-slate-500">
                    <div className="flex flex-col items-center gap-2">
                      <FileText className="h-12 w-12 text-slate-300" />
                      <p>No loan requests found</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredRequests.map((req) => (
                  <motion.tr 
                    key={req.id} 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="hover:bg-slate-50 transition-colors"
                  >
                    <td className="px-4 py-3">
                      <input
                        type="checkbox"
                        checked={selectedRequests.includes(req.id)}
                        onChange={() => toggleSelect(req.id)}
                        className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                      />
                    </td>
                    <td className="px-4 py-3">
                      <div>
                        <p className="font-medium text-slate-900 text-sm">{req.farmer}</p>
                        <p className="text-xs text-slate-400">{req.village}</p>
                      </div>
                    </td>
                    <td className="px-4 py-3 font-medium text-slate-900">{req.yieldEstimate} q</td>
                    <td className="px-4 py-3 text-slate-600">{req.crop}</td>
                    <td className="px-4 py-3">
                      <span className={`font-medium ${req.score >= 70 ? 'text-emerald-600' : req.score >= 50 ? 'text-yellow-600' : 'text-red-600'}`}>
                        {req.score}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-600 text-sm">{req.date}</td>
                    <td className="px-4 py-3">{getStatusBadge(req.status)}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <Link 
                          to={`/bank/loan/${req.id}`} 
                          className="p-1.5 text-emerald-600 hover:text-emerald-700 rounded-lg hover:bg-emerald-50 transition-colors"
                        >
                          <Eye className="h-4 w-4" />
                        </Link>
                        {req.status === 'pending' && (
                          <>
                            <button 
                              onClick={() => handleAction(req.id, 'approved')}
                              className="p-1.5 text-green-600 hover:text-green-700 rounded-lg hover:bg-green-50 transition-colors"
                            >
                              <CheckCircle className="h-4 w-4" />
                            </button>
                            <button 
                              onClick={() => handleAction(req.id, 'rejected')}
                              className="p-1.5 text-red-600 hover:text-red-700 rounded-lg hover:bg-red-50 transition-colors"
                            >
                              <XCircle className="h-4 w-4" />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </motion.tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}