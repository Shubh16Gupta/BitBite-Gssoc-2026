import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { 
  TrendingUp, 
  CreditCard, 
  Sprout, 
  Award, 
  Calendar, 
  DollarSign, 
  FileText, 
  Camera, 
  CheckCircle, 
  ArrowRight,
  ArrowLeft,
  Home,
  ChevronRight,
  BarChart3,
  Clock,
  Users,
  Leaf,
  Sparkles,
  Bell,
  Settings,
  HelpCircle,
  Zap,
  MapPin
} from 'lucide-react'
import { motion } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import { farmerService } from '../../services/farmerService'

/** "2 days ago"-style relative time for the activity feed. */
const timeAgo = (date) => {
  const secs = Math.floor((Date.now() - new Date(date).getTime()) / 1000)
  if (secs < 60) return 'just now'
  const mins = Math.floor(secs / 60)
  if (mins < 60) return `${mins} min ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs} hour${hrs === 1 ? '' : 's'} ago`
  const days = Math.floor(hrs / 24)
  if (days < 30) return `${days} day${days === 1 ? '' : 's'} ago`
  return new Date(date).toLocaleDateString()
}

export default function FarmerDashboard() {
  const navigate = useNavigate()
  const { t } = useTranslation()
  const [loans, setLoans] = useState([])
  const [profile, setProfile] = useState(null)
  const [activeLoans, setActiveLoans] = useState(0)
  const [activity, setActivity] = useState([])
  const [summary, setSummary] = useState({
    cycles: 0,
    annScore: null,
    cropHealth: null,
    predictedYield: 0,
  })

  // Profile drives the greeting + location; loans and activity fill the banner
  // and the Recent Activity card with the farmer's real records.
  useEffect(() => {
    let active = true
    ;(async () => {
      try {
        const [data, loanList, feed] = await Promise.all([
          farmerService.getProfile().catch(() => null),
          farmerService.getLoans().catch(() => []),
          farmerService.getActivity(6).catch(() => []),
        ])
        if (!active) return
        if (data?.profile) setProfile(data.profile)
        setActiveLoans((loanList || []).filter((l) => l.status === 'approved').length)
        setActivity(feed || [])
      } catch {
        /* handled globally */
      }
    })()
    return () => {
      active = false
    }
  }, [])

  // Pull the farmer's real crop cycles and derive the headline numbers.
  useEffect(() => {
    let active = true
    ;(async () => {
      try {
        const cycles = await farmerService.getCropCycles()
        if (!active) return

        const scored = cycles.filter((c) => (c.phases || []).some((p) => p.annScore != null))
        const avg = (arr) => (arr.length ? arr.reduce((a, b) => a + b, 0) / arr.length : null)
        const cycleAnn = scored.map((c) => avg(c.phases.filter((p) => p.annScore != null).map((p) => p.annScore)))
        const cycleHealth = scored.map((c) => avg(c.phases.filter((p) => p.cropHealthScore != null).map((p) => p.cropHealthScore)))
        const round1 = (n) => (n == null ? null : Math.round(n * 10) / 10)

        setSummary({
          cycles: cycles.length,
          annScore: round1(avg(cycleAnn)),
          cropHealth: round1(avg(cycleHealth)),
          predictedYield: round1(
            cycles.reduce((sum, c) => sum + (c.finalYield?.estimatedYield || 0), 0)
          ),
        })

        // Show crop cycles in place of loans until a loan module exists.
        setLoans(
          cycles.slice(0, 4).map((c) => ({
            id: c._id,
            crop: c.cropLabel,
            status: c.status === 'completed' ? 'completed' : 'active',
            phases: `${c.phases?.length || 0}/${c.totalPhases}`,
            yieldEstimate: c.finalYield?.estimatedYield || null,
          }))
        )
      } catch {
        /* handled globally */
      }
    })()
    return () => {
      active = false
    }
  }, [])

  const stats = [
    { label: 'Crop Cycles', value: String(summary.cycles), icon: CreditCard, color: 'from-blue-500 to-blue-600', bg: 'bg-blue-50' },
    { label: 'Predicted Yield', value: summary.predictedYield ? `${summary.predictedYield} q` : '—', icon: DollarSign, color: 'from-emerald-500 to-emerald-600', bg: 'bg-emerald-50' },
    { label: 'AnnScore', value: summary.annScore ?? '—', icon: TrendingUp, color: 'from-purple-500 to-purple-600', bg: 'bg-purple-50' },
    { label: 'Crop Health', value: summary.cropHealth != null ? `${summary.cropHealth}%` : '—', icon: Sprout, color: 'from-amber-500 to-amber-600', bg: 'bg-amber-50' }
  ]

  // Greeting + banner details, sourced from the farmer's profile.
  const storedUser = (() => {
    try {
      return JSON.parse(localStorage.getItem('user') || 'null')
    } catch {
      return null
    }
  })()
  const farmerName = profile?.name || storedUser?.name || 'Farmer'
  const hour = new Date().getHours()
  const greeting =
    hour < 12
      ? t('farmer.dashboard.goodMorning')
      : hour < 17
        ? t('farmer.dashboard.goodAfternoon')
        : t('farmer.dashboard.goodEvening')
  const location =
    [profile?.village, profile?.district, profile?.state].filter(Boolean).join(', ') || t('farmer.dashboard.notSet')
  const landLine = profile?.landArea ? `${profile.landArea} ${profile.landUnit || ''}`.trim() : ''

  const quickActions = [
    { to: '/farmer/fields', icon: Leaf, label: 'My Fields', gradient: 'from-blue-500 to-indigo-600', iconBg: 'bg-blue-100 text-blue-600' },
    { to: '/farmer/upload-crop', icon: Camera, label: 'Crop Analysis', gradient: 'from-emerald-500 to-teal-600', iconBg: 'bg-emerald-100 text-emerald-600' },
    { to: '/farmer/insurance', icon: Award, label: 'Crop Insurance', gradient: 'from-teal-500 to-emerald-600', iconBg: 'bg-teal-100 text-teal-600' },
    { to: '/farmer/apply-loan', icon: FileText, label: 'Apply for Loan', gradient: 'from-purple-500 to-pink-600', iconBg: 'bg-purple-100 text-purple-600' },
    { to: '/farmer/schemes', icon: Award, label: 'View Schemes', gradient: 'from-orange-500 to-amber-600', iconBg: 'bg-orange-100 text-orange-600' }
  ]

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.06, ease: [0.22, 1, 0.36, 1] }
    }
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] }
    }
  }

  const getStatusBadge = (status) => {
    const styles = {
      active: 'bg-green-100 text-green-800 border-green-200',
      pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      completed: 'bg-blue-100 text-blue-800 border-blue-200',
      rejected: 'bg-red-100 text-red-800 border-red-200'
    }
    return (
      <span className={`px-2.5 py-1 rounded-full text-xs font-medium border ${styles[status] || styles.pending}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    )
  }

  return (
    <div className="space-y-6">
      {/* Navigation Bar - Back Button & Breadcrumb */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-200/50">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="p-2 rounded-xl bg-white/80 backdrop-blur-sm border border-slate-200/50 hover:bg-slate-50 transition-all hover:shadow-md group"
            aria-label="Go back"
          >
            <ArrowLeft className="h-5 w-5 text-slate-600 group-hover:text-slate-900 transition-colors" />
          </button>
          
          <div className="flex items-center gap-2 text-sm text-slate-500">
            <Link to="/" className="hover:text-emerald-600 transition-colors">
              <Home className="h-4 w-4" />
            </Link>
            <ChevronRight className="h-3 w-3 text-slate-300" />
            <Link to="/farmer" className="hover:text-emerald-600 transition-colors font-medium text-slate-700">
              Farmer Portal
            </Link>
            <ChevronRight className="h-3 w-3 text-slate-300" />
            <span className="text-slate-900 font-medium">Dashboard</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button className="p-2 rounded-xl bg-white/80 backdrop-blur-sm border border-slate-200/50 hover:bg-slate-50 transition-all hover:shadow-md">
            <Bell className="h-4 w-4 text-slate-600" />
          </button>
          <button className="p-2 rounded-xl bg-white/80 backdrop-blur-sm border border-slate-200/50 hover:bg-slate-50 transition-all hover:shadow-md">
            <Settings className="h-4 w-4 text-slate-600" />
          </button>
          <button className="p-2 rounded-xl bg-white/80 backdrop-blur-sm border border-slate-200/50 hover:bg-slate-50 transition-all hover:shadow-md">
            <HelpCircle className="h-4 w-4 text-slate-600" />
          </button>
        </div>
      </div>

      {/* Welcome Section */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-emerald-600 to-cyan-600 p-6 text-white">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-2xl" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-emerald-400/10 rounded-full blur-2xl" />
        
        <div className="relative">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Sparkles className="h-4 w-4 text-amber-300" />
                <span className="text-xs font-medium text-emerald-200">{t('farmer.dashboard.welcomeBack')}</span>
              </div>
              <h1 className="text-2xl font-bold">{greeting}, {farmerName}!</h1>
              <p className="text-emerald-100 text-sm mt-1">{t('farmer.dashboard.snapshot')}</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl px-4 py-2 border border-white/20">
              <p className="text-xs text-emerald-200">{t('farmer.dashboard.today')}</p>
              <p className="text-sm font-semibold">{new Date().toLocaleDateString('en-IN', { 
                day: 'numeric', 
                month: 'short', 
                year: 'numeric' 
              })}</p>
            </div>
          </div>

          {/* Location + active loans (the crop metrics live in the cards below) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white/10 backdrop-blur-sm rounded-xl p-3 border border-white/10"
            >
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-emerald-200" />
                <span className="text-xs text-emerald-200">{t('farmer.dashboard.location')}</span>
              </div>
              <p className="text-lg font-bold mt-1 truncate">{location}</p>
              {landLine && <p className="text-xs text-emerald-100/80">{landLine}</p>}
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white/10 backdrop-blur-sm rounded-xl p-3 border border-white/10"
            >
              <div className="flex items-center gap-2">
                <CreditCard className="h-4 w-4 text-emerald-200" />
                <span className="text-xs text-emerald-200">{t('farmer.dashboard.activeLoans')}</span>
              </div>
              <p className="text-xl font-bold mt-1">{activeLoans}</p>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Stats Grid - Detailed */}
      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="grid grid-cols-2 md:grid-cols-4 gap-4"
      >
        {stats.map((stat, index) => {
          const Icon = stat.icon
          return (
            <motion.div
              key={index}
              variants={itemVariants}
              className={`${stat.bg} rounded-xl p-4 border border-slate-200/50 hover:shadow-md transition-all hover:-translate-y-1`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center`}>
                  <Icon className="h-5 w-5 text-white" />
                </div>
                <span className="text-xs text-slate-400">Updated</span>
              </div>
              <p className="text-2xl font-bold text-slate-900">{stat.value}</p>
              <p className="text-sm text-slate-600">{stat.label}</p>
            </motion.div>
          )
        })}
      </motion.div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-sm font-semibold text-slate-700 mb-3 flex items-center gap-2">
          <Zap className="h-4 w-4 text-amber-500" />
          Quick Actions
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {quickActions.map((action, index) => {
            const Icon = action.icon
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.08 }}
              >
                <Link
                  to={action.to}
                  className={`group relative overflow-hidden p-4 rounded-xl bg-white border border-slate-200/50 hover:shadow-lg transition-all hover:-translate-y-1 text-center block`}
                >
                  <div className={`w-12 h-12 mx-auto rounded-xl ${action.iconBg} flex items-center justify-center mb-2 group-hover:scale-110 transition-transform`}>
                    <Icon className="h-6 w-6" />
                  </div>
                  <span className="text-sm font-medium text-slate-700">{action.label}</span>
                </Link>
              </motion.div>
            )
          })}
        </div>
      </div>

      {/* Active Loans */}
      <div>
        <div className="flex justify-between items-center mb-3">
          <h2 className="text-sm font-semibold text-slate-700 flex items-center gap-2">
            <CreditCard className="h-4 w-4 text-emerald-500" />
            Active Loans
          </h2>
          <Link 
            to="/farmer/loan-status" 
            className="text-sm text-emerald-600 hover:text-emerald-700 font-medium flex items-center gap-1 group"
          >
            View All 
            <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
        
        {loans.length === 0 ? (
          <div className="text-center py-8 bg-slate-50 rounded-xl border border-slate-200/50">
            <Sprout className="h-12 w-12 text-slate-300 mx-auto mb-2" />
            <p className="text-slate-500">No crop cycles yet</p>
            <Link to="/farmer/upload-crop" className="text-emerald-600 hover:text-emerald-700 text-sm font-medium inline-block mt-2">
              Start a crop cycle
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {loans.map((loan, index) => (
              <motion.div
                key={loan.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white border border-slate-200/50 rounded-xl p-4 hover:shadow-md transition-all"
              >
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-semibold text-slate-900">{loan.crop}</span>
                      {getStatusBadge(loan.status)}
                    </div>
                    <div className="flex flex-wrap gap-4 text-sm text-slate-500 mt-1">
                      <span className="flex items-center gap-1">
                        <BarChart3 className="h-3.5 w-3.5" />
                        {loan.phases} phases
                      </span>
                      {loan.yieldEstimate != null && (
                        <span className="flex items-center gap-1">
                          <TrendingUp className="h-3.5 w-3.5" />
                          {loan.yieldEstimate} q predicted
                        </span>
                      )}
                    </div>
                  </div>
                  <Link
                    to="/farmer/upload-crop"
                    className="text-sm text-emerald-600 hover:text-emerald-700 font-medium flex items-center gap-1 group whitespace-nowrap"
                  >
                    View Details
                    <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Recent Activity */}
      <div className="bg-slate-50/50 rounded-xl p-4 border border-slate-200/50">
        <div className="flex items-center gap-2 mb-3">
          <Clock className="h-4 w-4 text-slate-400" />
          <h3 className="text-sm font-medium text-slate-700">{t('farmer.dashboard.recentActivity')}</h3>
        </div>
        <div className="space-y-2 text-sm text-slate-500">
          {activity.length === 0 ? (
            <p className="p-2 text-slate-400">
              {t('farmer.dashboard.noActivity')}
            </p>
          ) : (
            activity.map((a, i) => (
              <div
                key={i}
                className="flex items-center justify-between gap-3 p-2 bg-white rounded-lg border border-slate-100"
              >
                <span className="min-w-0">
                  <span className="text-slate-700">{a.title}</span>
                  {a.detail && <span className="ml-1 text-xs text-slate-400">· {a.detail}</span>}
                </span>
                <span className="text-xs text-slate-400 whitespace-nowrap">{timeAgo(a.at)}</span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}