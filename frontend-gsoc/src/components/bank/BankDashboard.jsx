import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { 
  Users, 
  DollarSign, 
  TrendingUp, 
  CheckCircle, 
  XCircle, 
  Clock,
  Eye,
  ArrowRight,
  BarChart3,
  PieChart,
  FileText,
  Download,
  RefreshCw,
  AlertCircle,
  Award,
  Calendar,
  Activity
} from 'lucide-react'
import { motion } from 'framer-motion'
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart as RePieChart, Pie, Cell } from 'recharts'
import { bankService } from '../../services/bankService'

export default function BankDashboard() {
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    eligibleCount: 0,
    totalScoredFarmers: 0,
    averageAnnScore: 0,
    threshold: 0,
  })

  const [recentRequests, setRecentRequests] = useState([])
  // Trend/category charts are illustrative (no backend series yet).
  const [loanTrends] = useState([
    { month: 'Jan', loans: 12 }, { month: 'Feb', loans: 18 }, { month: 'Mar', loans: 25 },
    { month: 'Apr', loans: 20 }, { month: 'May', loans: 30 }, { month: 'Jun', loans: 28 },
    { month: 'Jul', loans: 23 },
  ])
  const [categoryData] = useState([
    { name: 'Agriculture', value: 60, color: '#10b981' },
    { name: 'Horticulture', value: 25, color: '#3b82f6' },
    { name: 'Others', value: 15, color: '#f59e0b' },
  ])

  useEffect(() => {
    let active = true
    ;(async () => {
      try {
        let threshold = 50
        try {
          const c = await bankService.getCriteria()
          if (c?.minAnnScore != null) threshold = c.minAnnScore
        } catch { /* no saved threshold yet */ }

        const [summary, elig] = await Promise.all([
          bankService.getDashboard(threshold),
          bankService.getEligibleFarmers(threshold),
        ])
        if (!active) return

        setStats({
          eligibleCount: summary.eligibleCount || 0,
          totalScoredFarmers: summary.totalScoredFarmers || 0,
          averageAnnScore: summary.averageAnnScore ?? 0,
          threshold: summary.threshold,
        })
        setRecentRequests(
          (elig.farmers || []).map((f) => ({
            id: f.farmerId,
            farmer: f.name,
            village: [f.village, f.district, f.state].filter(Boolean).join(', '),
            crop: (f.crops || []).join(', ') || f.primaryCrop,
            score: f.annScore,
            yield: f.predictedYield || 0,
            status: 'eligible',
            date: f.lastActivity,
          }))
        )
      } catch {
        /* errors surfaced globally */
      } finally {
        if (active) setLoading(false)
      }
    })()
    return () => {
      active = false
    }
  }, [])

  const getStatusBadge = (status) => {
    const styles = {
      pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      approved: 'bg-green-100 text-green-800 border-green-200',
      rejected: 'bg-red-100 text-red-800 border-red-200',
      active: 'bg-blue-100 text-blue-800 border-blue-200',
      completed: 'bg-purple-100 text-purple-800 border-purple-200'
    }
    const icons = {
      pending: Clock,
      approved: CheckCircle,
      rejected: XCircle,
      active: Activity,
      completed: CheckCircle
    }
    const Icon = icons[status] || Clock
    return (
      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${styles[status] || styles.pending}`}>
        <Icon className="h-3 w-3" />
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    )
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="flex flex-col items-center gap-3">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
          <p className="text-sm text-slate-500">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
          <p className="text-sm text-slate-500">Overview of your loan portfolio and performance</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 transition-all text-sm">
            <Download className="h-4 w-4" />
            Export Report
          </button>
          <button className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white transition-all text-sm shadow-lg shadow-emerald-500/30">
            <RefreshCw className="h-4 w-4" />
            Refresh
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-xl p-4 border border-slate-200/50 shadow-sm hover:shadow-md transition-all"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center">
              <DollarSign className="h-5 w-5 text-emerald-600" />
            </div>
            <div>
              <p className="text-sm text-slate-500">Eligible Farmers</p>
              <p className="text-xl font-bold text-slate-900">{stats.eligibleCount}</p>
            </div>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-xl p-4 border border-slate-200/50 shadow-sm hover:shadow-md transition-all"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center">
              <Users className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-slate-500">Scored Farmers</p>
              <p className="text-xl font-bold text-slate-900">{stats.totalScoredFarmers}</p>
            </div>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-xl p-4 border border-slate-200/50 shadow-sm hover:shadow-md transition-all"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-yellow-100 flex items-center justify-center">
              <Clock className="h-5 w-5 text-yellow-600" />
            </div>
            <div>
              <p className="text-sm text-slate-500">Avg AnnScore</p>
              <p className="text-xl font-bold text-slate-900">{stats.averageAnnScore ?? '—'}</p>
            </div>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white rounded-xl p-4 border border-slate-200/50 shadow-sm hover:shadow-md transition-all"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center">
              <TrendingUp className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-slate-500">Threshold</p>
              <p className="text-xl font-bold text-slate-900">≥ {stats.threshold}</p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Charts Row */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Loan Trends Chart */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white rounded-xl p-5 border border-slate-200/50 shadow-sm"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-slate-900">Loan Trends</h3>
            <span className="text-xs text-slate-400">Last 7 months</span>
          </div>
          <div className="h-[200px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={loanTrends}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Line type="monotone" dataKey="loans" stroke="#10b981" strokeWidth={2} dot={{ fill: '#10b981' }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Category Distribution */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-white rounded-xl p-5 border border-slate-200/50 shadow-sm"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-slate-900">Loan Categories</h3>
            <span className="text-xs text-slate-400">Distribution</span>
          </div>
          <div className="h-[200px] flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <RePieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  innerRadius={40}
                  outerRadius={70}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </RePieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex flex-wrap justify-center gap-3 mt-2">
            {categoryData.map((cat) => (
              <div key={cat.name} className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: cat.color }} />
                <span className="text-xs text-slate-600">{cat.name}</span>
                <span className="text-xs text-slate-400">{cat.value}%</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Recent Requests */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
        className="bg-white rounded-xl border border-slate-200/50 shadow-sm overflow-hidden"
      >
        <div className="flex items-center justify-between p-5 border-b border-slate-200/50">
          <h3 className="font-semibold text-slate-900">Recent Loan Requests</h3>
          <Link to="/bank/requests" className="text-sm text-emerald-600 hover:text-emerald-700 flex items-center gap-1">
            View All <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-5 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Farmer</th>
                <th className="px-5 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Pred. Yield</th>
                <th className="px-5 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Crop</th>
                <th className="px-5 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">AnnScore</th>
                <th className="px-5 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Status</th>
                <th className="px-5 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200/50">
              {recentRequests.map((req) => (
                <tr key={req.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-5 py-3.5">
                    <div>
                      <p className="font-medium text-slate-900 text-sm">{req.farmer}</p>
                      <p className="text-xs text-slate-400">{req.village}</p>
                    </div>
                  </td>
                  <td className="px-5 py-3.5 font-medium text-slate-900">{req.yield} q</td>
                  <td className="px-5 py-3.5 text-slate-600">{req.crop}</td>
                  <td className="px-5 py-3.5">
                    <span className={`font-medium ${req.score >= 70 ? 'text-emerald-600' : req.score >= 50 ? 'text-yellow-600' : 'text-red-600'}`}>
                      {req.score}
                    </span>
                  </td>
                  <td className="px-5 py-3.5">{getStatusBadge(req.status)}</td>
                  <td className="px-5 py-3.5">
                    <Link to={`/bank/loan/${req.id}`} className="text-emerald-600 hover:text-emerald-700">
                      <Eye className="h-5 w-5" />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  )
}