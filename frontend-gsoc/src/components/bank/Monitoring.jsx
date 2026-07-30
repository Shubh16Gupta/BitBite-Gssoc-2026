import { useState, useEffect } from 'react'
import { 
  Eye, 
  TrendingUp, 
  TrendingDown, 
  AlertCircle,
  CheckCircle,
  Clock,
  Download,
  RefreshCw,
  Search,
  Filter,
  BarChart3,
  Activity,
  Sprout,
  Droplets,
  Sun,
  Wind
} from 'lucide-react'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'
import { bankService } from '../../services/bankService'
import { getErrorMessage } from '../../services/api'

export default function Monitoring() {
  const [crops, setCrops] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')
  const [search, setSearch] = useState('')

  const [threshold, setThreshold] = useState(50)
  const [saving, setSaving] = useState(false)

  const load = async (thr) => {
    setLoading(true)
    try {
      const data = await bankService.getEligibleFarmers(thr)
      setCrops(
        (data.farmers || []).map((f) => ({
          id: f.farmerId,
          farmer: f.name,
          crop: (f.crops || []).join(', ') || f.primaryCrop,
          health:
            f.cropHealth >= 85 ? 'Excellent' : f.cropHealth >= 70 ? 'Good' : f.cropHealth >= 50 ? 'Fair' : 'Poor',
          risk: f.annScore >= 70 ? 'Low' : f.annScore >= 50 ? 'Medium' : 'High',
          lastUpload: f.lastActivity ? new Date(f.lastActivity).toLocaleDateString() : '—',
          loanId: `AS-${String(f.annScore).padStart(3, '0')}`,
          growth: Math.round(f.cropHealth ?? 0),
          moisture: Math.round(f.annScore ?? 0),
          temperature: f.predictedYield || 0,
          alerts: f.annScore < 50 ? 2 : f.annScore < 70 ? 1 : 0,
        }))
      )
    } catch (e) {
      toast.error(getErrorMessage(e))
    } finally {
      setLoading(false)
    }
  }

  const applyThreshold = async () => {
    setSaving(true)
    try {
      await bankService.setCriteria(Number(threshold))
      await load(Number(threshold))
      toast.success(`Threshold set to ${threshold}`)
    } catch (e) {
      toast.error(getErrorMessage(e))
    } finally {
      setSaving(false)
    }
  }

  useEffect(() => {
    ;(async () => {
      let thr = 50
      try {
        const c = await bankService.getCriteria()
        if (c?.minAnnScore != null) thr = c.minAnnScore
      } catch { /* none saved */ }
      setThreshold(thr)
      await load(thr)
    })()
  }, [])

  const getHealthBadge = (health) => {
    const styles = {
      'Good': 'bg-green-100 text-green-800 border-green-200',
      'Fair': 'bg-yellow-100 text-yellow-800 border-yellow-200',
      'Poor': 'bg-red-100 text-red-800 border-red-200'
    }
    const icons = {
      'Good': CheckCircle,
      'Fair': AlertCircle,
      'Poor': AlertCircle
    }
    const Icon = icons[health] || CheckCircle
    return (
      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${styles[health] || styles.Good}`}>
        <Icon className="h-3 w-3" />
        {health}
      </span>
    )
  }

  const getRiskBadge = (risk) => {
    const styles = {
      'Low': 'bg-green-100 text-green-800 border-green-200',
      'Medium': 'bg-yellow-100 text-yellow-800 border-yellow-200',
      'High': 'bg-red-100 text-red-800 border-red-200'
    }
    return (
      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${styles[risk] || styles.Low}`}>
        {risk}
      </span>
    )
  }

  const filteredCrops = crops.filter(crop => {
    const matchesFilter = filter === 'all' || crop.risk.toLowerCase() === filter
    const matchesSearch = crop.farmer.toLowerCase().includes(search.toLowerCase()) ||
                         crop.crop.toLowerCase().includes(search.toLowerCase())
    return matchesFilter && matchesSearch
  })

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="flex flex-col items-center gap-3">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
          <p className="text-sm text-slate-500">Loading monitoring data...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Crop Monitoring</h1>
          <p className="text-sm text-slate-500">Track crop health and risk assessment</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => load(Number(threshold))}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white transition-all text-sm shadow-lg shadow-emerald-500/30"
          >
            <RefreshCw className="h-4 w-4" />
            Refresh
          </button>
        </div>
      </div>

      {/* Lending threshold control */}
      <div className="bg-white rounded-xl border border-slate-200 p-5">
        <label className="block text-sm font-medium text-slate-700 mb-2">
          Minimum AnnScore threshold
        </label>
        <div className="flex flex-wrap items-center gap-4">
          <input
            type="range"
            min="0"
            max="100"
            value={threshold}
            onChange={(e) => setThreshold(Number(e.target.value))}
            className="flex-1 min-w-[200px] accent-emerald-600"
          />
          <input
            type="number"
            min="0"
            max="100"
            value={threshold}
            onChange={(e) => setThreshold(Number(e.target.value))}
            className="w-20 px-3 py-2 text-center font-bold border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
          />
          <button
            onClick={applyThreshold}
            disabled={saving}
            className="px-4 py-2 rounded-xl bg-emerald-600 text-white font-medium hover:bg-emerald-700 transition disabled:opacity-60"
          >
            {saving ? 'Saving…' : 'Apply & save'}
          </button>
        </div>
        <p className="mt-2 text-xs text-slate-500">
          Only farmers scoring ≥ {threshold} are shown as eligible.
        </p>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-4 border border-slate-200/50 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-green-100 flex items-center justify-center">
              <Sprout className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-slate-500">Healthy Crops</p>
              <p className="text-xl font-bold text-green-600">
                {crops.filter(c => c.health === 'Good').length}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-4 border border-slate-200/50 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-yellow-100 flex items-center justify-center">
              <AlertCircle className="h-5 w-5 text-yellow-600" />
            </div>
            <div>
              <p className="text-sm text-slate-500">At Risk</p>
              <p className="text-xl font-bold text-yellow-600">
                {crops.filter(c => c.risk === 'Medium').length}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-4 border border-slate-200/50 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center">
              <AlertCircle className="h-5 w-5 text-red-600" />
            </div>
            <div>
              <p className="text-sm text-slate-500">Critical</p>
              <p className="text-xl font-bold text-red-600">
                {crops.filter(c => c.risk === 'High').length}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-4 border border-slate-200/50 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center">
              <BarChart3 className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-slate-500">Avg Growth</p>
              <p className="text-xl font-bold text-blue-600">
                {Math.round(crops.reduce((acc, c) => acc + c.growth, 0) / crops.length)}%
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 bg-white rounded-xl p-4 border border-slate-200/50 shadow-sm">
        <div className="flex-1 relative">
          <Search className="absolute left-3.5 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search by farmer or crop..."
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-transparent transition-all text-sm"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex gap-2">
          {['all', 'low', 'medium', 'high'].map((risk) => (
            <button
              key={risk}
              onClick={() => setFilter(risk)}
              className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${
                filter === risk
                  ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-500/30'
                  : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
              }`}
            >
              {risk.charAt(0).toUpperCase() + risk.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Monitoring Table */}
      <div className="bg-white rounded-xl border border-slate-200/50 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-5 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Farmer</th>
                <th className="px-5 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Crop</th>
                <th className="px-5 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Health</th>
                <th className="px-5 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Growth</th>
                <th className="px-5 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Last Upload</th>
                <th className="px-5 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Risk</th>
                <th className="px-5 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Alerts</th>
                <th className="px-5 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200/50">
              {filteredCrops.length === 0 ? (
                <tr>
                  <td colSpan="8" className="px-5 py-12 text-center text-slate-500">
                    <div className="flex flex-col items-center gap-2">
                      <Sprout className="h-12 w-12 text-slate-300" />
                      <p>No crops found</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredCrops.map((crop) => (
                  <motion.tr 
                    key={crop.id} 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="hover:bg-slate-50 transition-colors"
                  >
                    <td className="px-5 py-3.5">
                      <div>
                        <p className="font-medium text-slate-900 text-sm">{crop.farmer}</p>
                        <p className="text-xs text-slate-400">Loan: {crop.loanId}</p>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 text-slate-600">{crop.crop}</td>
                    <td className="px-5 py-3.5">{getHealthBadge(crop.health)}</td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-2">
                        <div className="w-16 h-1.5 bg-slate-200 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-gradient-to-r from-emerald-500 to-green-500 rounded-full"
                            style={{ width: `${crop.growth}%` }}
                          />
                        </div>
                        <span className="text-xs font-medium text-slate-600">{crop.growth}%</span>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 text-slate-600 text-sm">{crop.lastUpload}</td>
                    <td className="px-5 py-3.5">{getRiskBadge(crop.risk)}</td>
                    <td className="px-5 py-3.5">
                      {crop.alerts > 0 ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-red-100 text-red-700 rounded-lg text-xs font-medium">
                          <AlertCircle className="h-3 w-3" />
                          {crop.alerts}
                        </span>
                      ) : (
                        <span className="text-xs text-green-600">No alerts</span>
                      )}
                    </td>
                    <td className="px-5 py-3.5">
                      <button className="flex items-center gap-1.5 text-emerald-600 hover:text-emerald-700 text-sm font-medium">
                        <Eye className="h-4 w-4" />
                        Details
                      </button>
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