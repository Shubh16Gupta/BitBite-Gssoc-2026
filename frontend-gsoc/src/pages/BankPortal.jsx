import { Outlet, NavLink, useLocation } from 'react-router-dom'
import {
  LayoutDashboard,
  FileText,
  TrendingUp,
  Building,
  Bell,
  Settings,
  HelpCircle,
  ChevronRight,
  Sparkles,
} from 'lucide-react'
import { motion } from 'framer-motion'
import { useState } from 'react'

export default function BankPortal() {
  const [isCollapsed, setIsCollapsed] = useState(false)
  const location = useLocation()

  // ✅ Removed Admin from navItems
  const navItems = [
    { to: '/bank', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/bank/requests', icon: FileText, label: 'Loan Requests' },
    { to: '/bank/monitoring', icon: TrendingUp, label: 'Monitoring' },
    // ❌ Admin removed from here
  ]

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.05, ease: [0.22, 1, 0.36, 1] },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, x: -20 },
    show: {
      opacity: 1,
      x: 0,
      transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] },
    },
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/30 overflow-x-hidden">
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-20 right-20 w-96 h-96 bg-emerald-200/20 rounded-full blur-3xl" />
        <div className="absolute bottom-20 left-20 w-80 h-80 bg-blue-200/20 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-purple-100/10 rounded-full blur-3xl" />
      </div>

      <div className="container-custom px-6 md:px-8 py-8 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="mb-8"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 mb-1">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-cyan-500 flex items-center justify-center shadow-lg shadow-emerald-500/30">
                <Building className="h-5 w-5 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-slate-900">Bank Portal</h1>
                <p className="text-sm text-slate-500">Manage loans, monitor crops, and track performance</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button className="p-2 rounded-xl bg-white/60 backdrop-blur-sm border border-slate-200/50 hover:bg-white/80 transition-all hover:shadow-md">
                <Bell className="h-5 w-5 text-slate-600" />
              </button>
              <button className="p-2 rounded-xl bg-white/60 backdrop-blur-sm border border-slate-200/50 hover:bg-white/80 transition-all hover:shadow-md">
                <Settings className="h-5 w-5 text-slate-600" />
              </button>
              <button className="p-2 rounded-xl bg-white/60 backdrop-blur-sm border border-slate-200/50 hover:bg-white/80 transition-all hover:shadow-md">
                <HelpCircle className="h-5 w-5 text-slate-600" />
              </button>
            </div>
          </div>
        </motion.div>

        <div className="flex flex-col lg:flex-row gap-8">
          <motion.aside
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="lg:w-64 flex-shrink-0 transition-all duration-300"
          >
            <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-lg p-4 sticky top-24 border border-white/50">
              {/* User Profile */}
              <div className="flex items-center gap-3 px-3 py-3 mb-4 rounded-xl bg-gradient-to-r from-emerald-50/50 to-cyan-50/50 border border-emerald-200/30">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-500 to-cyan-500 flex items-center justify-center flex-shrink-0">
                  <span className="text-white font-bold text-sm">BK</span>
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-slate-900">Bank Admin</p>
                  <p className="text-xs text-slate-500">HDFC Bank</p>
                </div>
              </div>

              {/* Navigation */}
              <motion.nav
                variants={containerVariants}
                initial="hidden"
                animate="show"
                className="space-y-1"
              >
                {navItems.map((item) => {
                  const Icon = item.icon
                  const isActive = location.pathname === item.to

                  return (
                    <motion.div key={item.to} variants={itemVariants}>
                      <NavLink
                        to={item.to}
                        end={item.to === '/bank'}
                        className={({ isActive: navActive }) =>
                          `group flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors ${
                            navActive
                              ? 'bg-gradient-to-r from-emerald-50 to-cyan-50 text-emerald-700'
                              : 'text-slate-600 hover:bg-slate-50'
                          }`
                        }
                      >
                        {() => (
                          <>
                            <div
                              className={`relative ${
                                isActive
                                  ? 'text-emerald-600'
                                  : 'text-slate-400 group-hover:text-slate-600'
                              }`}
                            >
                              <Icon className="h-5 w-5" />
                              {isActive && (
                                <span className="absolute -right-1 -top-1 w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                              )}
                            </div>

                            <span className="flex-1 text-sm">{item.label}</span>
                            {isActive && <Sparkles className="h-3 w-3 text-emerald-500" />}
                          </>
                        )}
                      </NavLink>
                    </motion.div>
                  )
                })}
              </motion.nav>

              {/* Bottom Section */}
              <div className="mt-6 pt-4 border-t border-slate-200/50">
                <div className="px-3 py-3 rounded-xl bg-gradient-to-r from-emerald-600/5 to-cyan-600/5 border border-emerald-200/20">
                  <p className="text-xs font-medium text-slate-700">Live Status</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                    </span>
                    <span className="text-xs text-slate-500">System Online</span>
                  </div>
                  <p className="text-xs text-slate-400 mt-1">Last sync: 2 min ago</p>
                </div>
              </div>
            </div>
          </motion.aside>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
            className="flex-1"
          >
            <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-lg p-6 border border-white/50 min-h-[500px]">
              <div className="flex items-center gap-2 text-sm text-slate-400 mb-6 pb-4 border-b border-slate-200/50">
                <Building className="h-4 w-4" />
                <span>Bank Portal</span>
                <ChevronRight className="h-3 w-3" />
                <span className="text-slate-600 font-medium">
                  {navItems.find((item) => location.pathname === item.to)?.label || 'Dashboard'}
                </span>
              </div>

              <Outlet />
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}