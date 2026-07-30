// src/components/auth/AdminLogin.jsx
import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { 
  Shield, 
  Mail, 
  Lock, 
  ArrowRight, 
  Eye,
  EyeOff,
  CheckCircle,
  Sparkles,
  Users,
  Award,
  TrendingUp,
  Building
} from 'lucide-react'
import { useAuth } from '../../hooks/useAuth'
import { authService } from '../../services/authService'
import { getErrorMessage } from '../../services/api'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'
import bankLoginBg from '../../assets/bankLoginBg.png'

export default function AdminLogin() {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  })
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const { setSession } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsLoading(true)
    try {
      const res = await authService.adminLogin(formData.email, formData.password)
      setSession(res.token, { role: 'admin', ...res.admin })
      toast.success('Admin login successful!')
      navigate('/admin')
    } catch (error) {
      toast.error(getErrorMessage(error))
    } finally {
      setIsLoading(false)
    }
  }

  const handleQuickFill = () => {
    setFormData({ email: 'admin@farmtrust.in', password: 'Admin@12345' })
    toast.success('Admin credentials filled')
  }

  const fadeInUp = {
    hidden: { opacity: 0, y: 30 },
    show: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] }
    }
  }

  const staggerContainer = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.08, ease: [0.22, 1, 0.36, 1] }
    }
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    show: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] }
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background Image */}
      <div 
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url(${bankLoginBg})` }}
      />
      
      {/* Dark Overlay */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />

      {/* Animated Gradient Overlay */}
      <div className="absolute inset-0">
        <div className="absolute top-0 right-0 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-indigo-500/20 rounded-full blur-3xl animate-pulse delay-1000" />
      </div>

      {/* Main Container */}
      <div className="relative z-10 w-full max-w-6xl grid lg:grid-cols-2 gap-8 items-center">
        
        {/* Left Side - Brand Info */}
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="hidden lg:block text-white space-y-8"
        >
          
          

          {/* Tagline */}
          <div>
            <h2 className="text-4xl font-bold leading-tight">
              Welcome to the
              <br />
              <span className="bg-gradient-to-r from-purple-300 to-indigo-300 bg-clip-text text-transparent">
                Admin Dashboard
              </span>
            </h2>
            <p className="mt-4 text-blue-100/80 text-lg max-w-md">
              Manage banks, users, and monitor platform activity from a single dashboard.
            </p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-4 border border-white/10">
              <Building className="h-6 w-6 text-purple-400 mb-2" />
              <p className="text-2xl font-bold">12</p>
              <p className="text-sm text-blue-200">Banks Registered</p>
            </div>
            <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-4 border border-white/10">
              <Users className="h-6 w-6 text-indigo-400 mb-2" />
              <p className="text-2xl font-bold">1.2K</p>
              <p className="text-sm text-blue-200">Farmers</p>
            </div>
          </div>

          {/* Features */}
          <div className="space-y-3">
            <div className="flex items-center gap-3 text-blue-200">
              <CheckCircle className="h-5 w-5 text-purple-400 flex-shrink-0" />
              <span>Manage bank registrations</span>
            </div>
            <div className="flex items-center gap-3 text-blue-200">
              <CheckCircle className="h-5 w-5 text-purple-400 flex-shrink-0" />
              <span>Monitor platform activity</span>
            </div>
            <div className="flex items-center gap-3 text-blue-200">
              <CheckCircle className="h-5 w-5 text-purple-400 flex-shrink-0" />
              <span>View analytics and reports</span>
            </div>
          </div>

          {/* Trust Badge */}
          <div className="flex items-center gap-4 text-sm text-blue-300/60">
            <span>🔒 256-bit SSL</span>
            <span>•</span>
            <span>🛡️ Secure Admin</span>
          </div>
        </motion.div>

        {/* Right Side - Login Form */}
        <motion.div
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
          className="w-full max-w-md mx-auto"
        >
          <div className="relative bg-white/95 backdrop-blur-2xl rounded-3xl shadow-2xl border border-white/20 p-8 md:p-10">
            {/* Decorative Top Bar */}
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-purple-500 via-indigo-500 to-blue-500 rounded-t-3xl" />
            
            {/* Mobile Header */}
            <div className="lg:hidden text-center mb-6">
    
              <h2 className="text-2xl font-bold text-slate-900">Admin Login</h2>
              <p className="text-sm text-slate-500">Access the admin panel</p>
            </div>

            {/* Desktop Header */}
            <div className="hidden lg:block text-center mb-8">
              <div className="relative inline-block">
                <div className="absolute -inset-3 bg-gradient-to-r from-purple-500/20 to-indigo-500/20 rounded-full blur-xl" />
                
              </div>
              <h2 className="mt-4 text-2xl font-bold text-slate-900">Admin Login</h2>
              <p className="mt-1 text-sm text-slate-500">Access the admin panel</p>
            </div>

            {/* Demo Credentials Hint */}
            <div className="mb-6 p-3 rounded-xl bg-gradient-to-r from-purple-50 to-indigo-50 border border-purple-200/50">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-purple-600" />
                  <span className="text-xs text-purple-700 font-medium">Demo Credentials</span>
                </div>
                <button 
                  onClick={handleQuickFill}
                  className="text-xs text-purple-600 hover:text-purple-700 font-medium underline-offset-2 hover:underline"
                >
                  Quick Fill
                </button>
              </div>
              <div className="mt-1 text-xs text-slate-500 space-y-0.5">
                <p>Email: admin@farmtrust.in</p>
                <p>Password: Admin@12345</p>
              </div>
            </div>

            {/* Form */}
            <motion.form 
              variants={staggerContainer}
              initial="hidden"
              animate="show"
              className="space-y-5" 
              onSubmit={handleSubmit}
            >
              <motion.div variants={itemVariants} className="space-y-1">
                <label className="block text-sm font-medium text-slate-700">
                  Email Address <span className="text-red-500">*</span>
                </label>
                <div className="relative group">
                  <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-500/20 to-indigo-500/20 rounded-xl blur opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                    <input
                      type="email"
                      required
                      className="w-full pl-11 pr-4 py-3 bg-white/60 backdrop-blur-sm border border-slate-200/80 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-transparent transition-all duration-300 text-slate-800 placeholder-slate-400"
                      placeholder="admin@anndata.in"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    />
                  </div>
                </div>
              </motion.div>

              <motion.div variants={itemVariants} className="space-y-1">
                <label className="block text-sm font-medium text-slate-700">
                  Password <span className="text-red-500">*</span>
                </label>
                <div className="relative group">
                  <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-500/20 to-indigo-500/20 rounded-xl blur opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      className="w-full pl-11 pr-12 py-3 bg-white/60 backdrop-blur-sm border border-slate-200/80 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-transparent transition-all duration-300 text-slate-800 placeholder-slate-400"
                      placeholder="Enter password"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                    >
                      {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                </div>
              </motion.div>

              <motion.div variants={itemVariants} className="pt-2">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full group relative overflow-hidden rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-semibold py-3.5 px-6 transition-all duration-500 hover:scale-[1.02] shadow-lg shadow-purple-500/30 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  <span className="relative z-10 flex items-center gap-2">
                    {isLoading ? (
                      <>
                        <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                        Logging in...
                      </>
                    ) : (
                      <>
                        Login as Admin
                        <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform duration-300" />
                      </>
                    )}
                  </span>
                  <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                </button>
              </motion.div>

              <motion.div variants={itemVariants} className="text-center">
                <p className="text-sm text-slate-500">
                  <Link 
                    to="/login" 
                    className="text-purple-600 hover:text-purple-700 font-medium hover:underline transition-all"
                  >
                    Back to Login
                  </Link>
                </p>
              </motion.div>

              <motion.div variants={itemVariants} className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-slate-200/50" />
                </div>
                <div className="relative flex justify-center text-xs">
                  <span className="px-3 bg-white/60 backdrop-blur-sm text-slate-400">
                    Secure admin portal
                  </span>
                </div>
              </motion.div>

              <motion.div variants={itemVariants} className="flex justify-center gap-4 text-xs text-slate-400">
                <span className="flex items-center gap-1">
                  <Shield className="h-3 w-3" /> 256-bit SSL
                </span>
                <span className="flex items-center gap-1">
                  <CheckCircle className="h-3 w-3" /> Secure Access
                </span>
              </motion.div>
            </motion.form>
          </div>
        </motion.div>
      </div>
    </div>
  )
}