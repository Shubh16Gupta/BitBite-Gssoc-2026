import { useState, useEffect } from 'react'
import { 
  Users,
  Building,
  CheckCircle,
  XCircle,
  Clock,
  Eye,
  RefreshCw,
  Search,
  Filter,
  Download,
  Plus,
  Edit,
  Trash2,
  Shield,
  Mail,
  Phone,
  MapPin,
  Calendar,
  BarChart3,
  TrendingUp,
  UserCheck,
  UserX,
  Award,
  Settings,
  Bell,
  AlertCircle,
  ChevronRight,
  MoreVertical
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import toast from 'react-hot-toast'

export default function Admin() {
  const [loading, setLoading] = useState(true)
  const [registrations, setRegistrations] = useState([])
  const [filter, setFilter] = useState('all')
  const [search, setSearch] = useState('')
  const [selectedBank, setSelectedBank] = useState(null)
  const [showDetails, setShowDetails] = useState(false)
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    approved: 0,
    rejected: 0
  })

  useEffect(() => {
    fetchRegistrations()
  }, [])

  const fetchRegistrations = async () => {
    setLoading(true)
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      const mockData = [
        {
          id: 1,
          institution: 'HDFC Bank',
          branch: 'Kothrud',
          ifsc: 'HDFC0004567',
          email: 'kothrud@hdfc.com',
          phone: '9876543210',
          address: 'Kothrud, Pune, Maharashtra',
          status: 'pending',
          type: 'Private Bank',
          date: '2026-07-20',
          manager: 'Rajesh Sharma',
          documents: ['Registration Certificate', 'RBI License', 'Bank Details'],
          description: 'Leading private sector bank with strong rural presence'
        },
        {
          id: 2,
          institution: 'State Bank of India',
          branch: 'Pune Main',
          ifsc: 'SBIN0001234',
          email: 'pune@sbi.co.in',
          phone: '9876543211',
          address: 'Pune Main Branch, Maharashtra',
          status: 'approved',
          type: 'Public Bank',
          date: '2026-07-18',
          manager: 'Priya Patel',
          documents: ['Registration Certificate', 'RBI License', 'Bank Details'],
          description: 'India\'s largest public sector bank'
        },
        {
          id: 3,
          institution: 'ICICI Bank',
          branch: 'Hinjewadi',
          ifsc: 'ICIC0007890',
          email: 'hinjewadi@icici.com',
          phone: '9876543212',
          address: 'Hinjewadi, Pune, Maharashtra',
          status: 'pending',
          type: 'Private Bank',
          date: '2026-07-19',
          manager: 'Amit Singh',
          documents: ['Registration Certificate', 'RBI License', 'Bank Details'],
          description: 'Major private sector bank with innovative digital solutions'
        },
        {
          id: 4,
          institution: 'Bank of Baroda',
          branch: 'FC Road',
          ifsc: 'BARB0005678',
          email: 'fcroad@bankofbaroda.com',
          phone: '9876543213',
          address: 'FC Road, Pune, Maharashtra',
          status: 'rejected',
          type: 'Public Bank',
          date: '2026-07-17',
          manager: 'Sunil Kumar',
          documents: ['Registration Certificate', 'RBI License', 'Bank Details'],
          description: 'Leading public sector bank with extensive rural network'
        },
        {
          id: 5,
          institution: 'Axis Bank',
          branch: 'SB Road',
          ifsc: 'UTIB0009012',
          email: 'sbroad@axisbank.com',
          phone: '9876543214',
          address: 'SB Road, Pune, Maharashtra',
          status: 'pending',
          type: 'Private Bank',
          date: '2026-07-16',
          manager: 'Deepak Gupta',
          documents: ['Registration Certificate', 'RBI License', 'Bank Details'],
          description: 'Leading private sector bank with strong digital capabilities'
        }
      ]
      
      setRegistrations(mockData)
      
      // Calculate stats
      const total = mockData.length
      const pending = mockData.filter(r => r.status === 'pending').length
      const approved = mockData.filter(r => r.status === 'approved').length
      const rejected = mockData.filter(r => r.status === 'rejected').length
      
      setStats({ total, pending, approved, rejected })
    } catch (error) {
      toast.error('Failed to fetch registrations')
    } finally {
      setLoading(false)
    }
  }

  const handleAction = async (id, action) => {
    try {
      await new Promise(resolve => setTimeout(resolve, 800))
      toast.success(`Bank ${action}d successfully!`)
      
      setRegistrations(prev => 
        prev.map(reg => 
          reg.id === id ? { ...reg, status: action } : reg
        )
      )
      
      // Update stats
      setStats(prev => {
        const newStats = { ...prev }
        const oldStatus = registrations.find(r => r.id === id)?.status
        if (oldStatus === 'pending') newStats.pending--
        if (oldStatus === 'approved') newStats.approved--
        if (oldStatus === 'rejected') newStats.rejected--
        if (action === 'pending') newStats.pending++
        if (action === 'approved') newStats.approved++
        if (action === 'rejected') newStats.rejected++
        return newStats
      })
    } catch (error) {
      toast.error(`Failed to ${action} bank`)
    }
  }

  const handleViewDetails = (bank) => {
    setSelectedBank(bank)
    setShowDetails(true)
  }

  const getStatusBadge = (status) => {
    const statusMap = {
      pending: { color: 'bg-yellow-100 text-yellow-800 border-yellow-200', icon: Clock },
      approved: { color: 'bg-green-100 text-green-800 border-green-200', icon: CheckCircle },
      rejected: { color: 'bg-red-100 text-red-800 border-red-200', icon: XCircle }
    }
    const { color, icon: Icon } = statusMap[status] || statusMap.pending
    return (
      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${color}`}>
        <Icon className="h-3 w-3" />
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    )
  }

  const getStatusColor = (status) => {
    const colors = {
      pending: 'border-yellow-500 bg-yellow-50',
      approved: 'border-green-500 bg-green-50',
      rejected: 'border-red-500 bg-red-50'
    }
    return colors[status] || colors.pending
  }

  const filteredRegistrations = registrations.filter(reg => {
    const matchesFilter = filter === 'all' || reg.status === filter
    const matchesSearch = reg.institution.toLowerCase().includes(search.toLowerCase()) ||
                         reg.branch.toLowerCase().includes(search.toLowerCase()) ||
                         reg.ifsc.toLowerCase().includes(search.toLowerCase()) ||
                         reg.email.toLowerCase().includes(search.toLowerCase())
    return matchesFilter && matchesSearch
  })

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="flex flex-col items-center gap-3">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
          <p className="text-sm text-slate-500">Loading bank registrations...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Bank Management</h1>
          <p className="text-sm text-slate-500">Review bank registrations and manage their access</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 transition-all text-sm">
            <Download className="h-4 w-4" />
            Export Report
          </button>
          <button 
            onClick={fetchRegistrations}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white transition-all text-sm shadow-lg shadow-emerald-500/30"
          >
            <RefreshCw className="h-4 w-4" />
            Refresh
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-xl p-4 border border-slate-200/50 shadow-sm"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center">
              <Building className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-slate-500">Total Banks</p>
              <p className="text-xl font-bold text-slate-900">{stats.total}</p>
            </div>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-xl p-4 border border-slate-200/50 shadow-sm"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-yellow-100 flex items-center justify-center">
              <Clock className="h-5 w-5 text-yellow-600" />
            </div>
            <div>
              <p className="text-sm text-slate-500">Pending</p>
              <p className="text-xl font-bold text-yellow-600">{stats.pending}</p>
            </div>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-xl p-4 border border-slate-200/50 shadow-sm"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-green-100 flex items-center justify-center">
              <CheckCircle className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-slate-500">Approved</p>
              <p className="text-xl font-bold text-green-600">{stats.approved}</p>
            </div>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white rounded-xl p-4 border border-slate-200/50 shadow-sm"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center">
              <XCircle className="h-5 w-5 text-red-600" />
            </div>
            <div>
              <p className="text-sm text-slate-500">Rejected</p>
              <p className="text-xl font-bold text-red-600">{stats.rejected}</p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 bg-white rounded-xl p-4 border border-slate-200/50 shadow-sm">
        <div className="flex-1 relative">
          <Search className="absolute left-3.5 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search by bank name, branch, IFSC, or email..."
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
                {registrations.filter(r => status === 'all' || r.status === status).length}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Registrations Table */}
      <div className="bg-white rounded-xl border border-slate-200/50 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-5 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Institution</th>
                <th className="px-5 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Branch</th>
                <th className="px-5 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">IFSC</th>
                <th className="px-5 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Email</th>
                <th className="px-5 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Date</th>
                <th className="px-5 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Status</th>
                <th className="px-5 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200/50">
              {filteredRegistrations.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-5 py-12 text-center text-slate-500">
                    <div className="flex flex-col items-center gap-2">
                      <Building className="h-12 w-12 text-slate-300" />
                      <p>No bank registrations found</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredRegistrations.map((reg, index) => (
                  <motion.tr 
                    key={reg.id} 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: index * 0.05 }}
                    className="hover:bg-slate-50 transition-colors"
                  >
                    <td className="px-5 py-3.5">
                      <div>
                        <p className="font-medium text-slate-900 text-sm">{reg.institution}</p>
                        <p className="text-xs text-slate-400">{reg.type}</p>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 text-slate-600">{reg.branch}</td>
                    <td className="px-5 py-3.5">
                      <code className="px-2 py-1 bg-slate-100 rounded text-xs font-mono text-slate-700">
                        {reg.ifsc}
                      </code>
                    </td>
                    <td className="px-5 py-3.5 text-slate-600 text-sm">{reg.email}</td>
                    <td className="px-5 py-3.5 text-slate-600 text-sm">{reg.date}</td>
                    <td className="px-5 py-3.5">{getStatusBadge(reg.status)}</td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-2">
                        <button 
                          onClick={() => handleViewDetails(reg)}
                          className="p-1.5 text-emerald-600 hover:text-emerald-700 rounded-lg hover:bg-emerald-50 transition-colors"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        {reg.status === 'pending' && (
                          <>
                            <button 
                              onClick={() => handleAction(reg.id, 'approved')}
                              className="p-1.5 text-green-600 hover:text-green-700 rounded-lg hover:bg-green-50 transition-colors"
                              title="Approve"
                            >
                              <CheckCircle className="h-4 w-4" />
                            </button>
                            <button 
                              onClick={() => handleAction(reg.id, 'rejected')}
                              className="p-1.5 text-red-600 hover:text-red-700 rounded-lg hover:bg-red-50 transition-colors"
                              title="Reject"
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

      {/* Bank Details Modal */}
      <AnimatePresence>
        {showDetails && selectedBank && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
            onClick={() => setShowDetails(false)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6 border-b border-slate-200">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-bold text-slate-900">Bank Details</h2>
                  <button 
                    onClick={() => setShowDetails(false)}
                    className="p-2 rounded-lg hover:bg-slate-100 transition-colors"
                  >
                    <XCircle className="h-5 w-5 text-slate-400" />
                  </button>
                </div>
              </div>

              <div className="p-6 space-y-6">
                {/* Bank Info */}
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-slate-500">Institution</p>
                    <p className="font-semibold text-slate-900">{selectedBank.institution}</p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-500">Type</p>
                    <p className="font-semibold text-slate-900">{selectedBank.type}</p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-500">Branch</p>
                    <p className="font-semibold text-slate-900">{selectedBank.branch}</p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-500">IFSC Code</p>
                    <p className="font-semibold text-slate-900">{selectedBank.ifsc}</p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-500">Email</p>
                    <p className="font-semibold text-slate-900">{selectedBank.email}</p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-500">Phone</p>
                    <p className="font-semibold text-slate-900">{selectedBank.phone}</p>
                  </div>
                </div>

                <div>
                  <p className="text-sm text-slate-500">Address</p>
                  <p className="font-semibold text-slate-900">{selectedBank.address}</p>
                </div>

                <div>
                  <p className="text-sm text-slate-500">Branch Manager</p>
                  <p className="font-semibold text-slate-900">{selectedBank.manager}</p>
                </div>

                <div>
                  <p className="text-sm text-slate-500">Description</p>
                  <p className="text-slate-700">{selectedBank.description}</p>
                </div>

                <div>
                  <p className="text-sm text-slate-500 mb-2">Documents</p>
                  <div className="flex flex-wrap gap-2">
                    {selectedBank.documents.map((doc, index) => (
                      <span key={index} className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-700">
                        <FileText className="h-3.5 w-3.5 text-slate-400" />
                        {doc}
                      </span>
                    ))}
                  </div>
                </div>

                <div>
                  <p className="text-sm text-slate-500">Status</p>
                  <div className="mt-1">{getStatusBadge(selectedBank.status)}</div>
                </div>
              </div>

              {selectedBank.status === 'pending' && (
                <div className="p-6 border-t border-slate-200 bg-slate-50 rounded-b-2xl">
                  <div className="flex gap-3 justify-end">
                    <button 
                      onClick={() => {
                        handleAction(selectedBank.id, 'approved')
                        setShowDetails(false)
                      }}
                      className="px-6 py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-xl font-medium transition-all shadow-lg shadow-green-500/30 flex items-center gap-2"
                    >
                      <CheckCircle className="h-4 w-4" />
                      Approve Bank
                    </button>
                    <button 
                      onClick={() => {
                        handleAction(selectedBank.id, 'rejected')
                        setShowDetails(false)
                      }}
                      className="px-6 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl font-medium transition-all shadow-lg shadow-red-500/30 flex items-center gap-2"
                    >
                      <XCircle className="h-4 w-4" />
                      Reject Bank
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}