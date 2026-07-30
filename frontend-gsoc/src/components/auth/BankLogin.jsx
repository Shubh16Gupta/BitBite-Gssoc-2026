import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { 
  Building, 
  Mail, 
  Lock, 
  ArrowRight, 
  Shield,
  Eye,
  EyeOff,
  CheckCircle,
  Sparkles,
  Users,
  Award,
  TrendingUp
} from 'lucide-react'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'
import { useAuth } from '../../hooks/useAuth'
import { authService } from '../../services/authService'
import { getErrorMessage } from '../../services/api'
import bankLoginBg from '../../assets/bankLoginBg.png'

export default function BankLogin() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    ifsc: ''
  })
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const { setSession } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsLoading(true)
    try {
      const res = await authService.bankLogin(formData.email, formData.password)
      setSession(res.token, {
        role: 'bank',
        name: res.bank?.institutionName,
        ...res.bank,
      })
      toast.success('Bank login successful!')
      navigate('/bank')
    } catch (error) {
      toast.error(getErrorMessage(error))
    } finally {
      setIsLoading(false)
    }
  }

  const handleQuickFill = () => {
    setFormData({
      email: 'loans1785274171@bank.co.in',
      password: 'BankPass1',
      ifsc: ''
    })
    toast.success('Sample bank credentials filled')
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
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-cyan-500/20 rounded-full blur-3xl animate-pulse delay-1000" />
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
              <span className="bg-gradient-to-r from-emerald-300 to-cyan-300 bg-clip-text text-transparent">
                Future of Banking
              </span>
            </h2>
            <p className="mt-4 text-blue-100/80 text-lg max-w-md">
              Access your bank dashboard, manage loans, and empower farmers with AI-driven insights.
            </p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-4 border border-white/10">
              <Users className="h-6 w-6 text-emerald-400 mb-2" />
              <p className="text-2xl font-bold">10+</p>
              <p className="text-sm text-blue-200">Farmers Served</p>
            </div>
            <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-4 border border-white/10">
              <Award className="h-6 w-6 text-cyan-400 mb-2" />
              <p className="text-2xl font-bold">94%</p>
              <p className="text-sm text-blue-200">Approval Rate</p>
            </div>
          </div>

          {/* Features */}
          <div className="space-y-3">
            <div className="flex items-center gap-3 text-blue-200">
              <CheckCircle className="h-5 w-5 text-emerald-400 flex-shrink-0" />
              <span>AI-powered loan processing</span>
            </div>
            <div className="flex items-center gap-3 text-blue-200">
              <CheckCircle className="h-5 w-5 text-emerald-400 flex-shrink-0" />
              <span>Real-time crop monitoring</span>
            </div>
            <div className="flex items-center gap-3 text-blue-200">
              <CheckCircle className="h-5 w-5 text-emerald-400 flex-shrink-0" />
              <span>Instant credit scoring</span>
            </div>
          </div>

          {/* Trust Badge */}
          <div className="flex items-center gap-4 text-sm text-blue-300/60">
            <span>🔒 256-bit SSL</span>
            <span>•</span>
            <span>🏦 RBI Compliant</span>
            <span>•</span>
            <span>🛡️ Secure Banking</span>
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
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-emerald-500 via-cyan-500 to-blue-500 rounded-t-3xl" />
            
            {/* Mobile Header */}
            <div className="lg:hidden text-center mb-6">
              <div className="flex items-center justify-center gap-2 mb-2">
                <span className="text-xl font-bold text-slate-900">AnnData</span>
              </div>
              <h2 className="text-2xl font-bold text-slate-900">Bank Login</h2>
              <p className="text-sm text-slate-500">Login with your official credentials</p>
            </div>

            {/* Desktop Header */}
            <div className="hidden lg:block text-center mb-8">
              <h2 className="mt-4 text-2xl font-bold text-slate-900">Bank Login</h2>
              <p className="mt-1 text-sm text-slate-500">Login with your official bank credentials</p>
            </div>

            {/* Demo Credentials Hint */}
            <div className="mb-6 p-3 rounded-xl bg-gradient-to-r from-emerald-50 to-cyan-50 border border-emerald-200/50">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-emerald-600" />
                  <span className="text-xs text-emerald-700 font-medium">Demo Credentials</span>
                </div>
                <button 
                  onClick={handleQuickFill}
                  className="text-xs text-emerald-600 hover:text-emerald-700 font-medium underline-offset-2 hover:underline"
                >
                  Quick Fill
                </button>
              </div>
              <div className="mt-1 text-xs text-slate-500 space-y-0.5">
                <p>Email: loans1785274171@bank.co.in</p>
                <p>Password: BankPass1</p>
                <p>(approved bank — IFSC optional)</p>
              </div>
            </div>

            {/* Form */}
            <motion.form 
              variants={staggerContainer}
              initial="hidden"
              animate="show"
              className="space-y-4" 
              onSubmit={handleSubmit}
            >
              <motion.div variants={itemVariants} className="space-y-1">
                <label className="block text-sm font-medium text-slate-700">
                  Official Email
                </label>
                <div className="relative group">
                  <div className="absolute -inset-0.5 bg-gradient-to-r from-emerald-500/20 to-cyan-500/20 rounded-xl blur opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                    <input
                      type="email"
                      required
                      className="w-full pl-11 pr-4 py-3 bg-white/60 backdrop-blur-sm border border-slate-200/80 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-transparent transition-all duration-300 text-slate-800 placeholder-slate-400"
                      placeholder="bank@official.com"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    />
                  </div>
                </div>
              </motion.div>

              <motion.div variants={itemVariants} className="space-y-1">
                <label className="block text-sm font-medium text-slate-700">
                  Bank IFSC Code
                </label>
                <div className="relative group">
                  <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500/20 to-indigo-500/20 rounded-xl blur opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  <div className="relative">
                    <Shield className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                    <input
                      type="text"
                      className="w-full pl-11 pr-4 py-3 bg-white/60 backdrop-blur-sm border border-slate-200/80 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-transparent transition-all duration-300 text-slate-800 placeholder-slate-400 uppercase"
                      placeholder="Optional"
                      value={formData.ifsc}
                      onChange={(e) => setFormData({ ...formData, ifsc: e.target.value.toUpperCase() })}
                      maxLength={11}
                    />
                  </div>
                </div>
              </motion.div>

              <motion.div variants={itemVariants} className="space-y-1">
                <label className="block text-sm font-medium text-slate-700">
                  Password
                </label>
                <div className="relative group">
                  <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-xl blur opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      className="w-full pl-11 pr-12 py-3 bg-white/60 backdrop-blur-sm border border-slate-200/80 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-transparent transition-all duration-300 text-slate-800 placeholder-slate-400"
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
                  className="w-full group relative overflow-hidden rounded-xl bg-gradient-to-r from-emerald-600 to-cyan-600 hover:from-emerald-700 hover:to-cyan-700 text-white font-semibold py-3.5 px-6 transition-all duration-500 hover:scale-[1.02] shadow-lg shadow-emerald-500/30 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
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
                        Login as Bank
                        <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform duration-300" />
                      </>
                    )}
                  </span>
                  <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                </button>
              </motion.div>

              <motion.div variants={itemVariants} className="text-center">
                <p className="text-sm text-slate-500">
                  Not registered as a bank?{' '}
                  <Link 
                    to="/bank/register" 
                    className="text-emerald-600 hover:text-emerald-700 font-medium hover:underline transition-all"
                  >
                    Register here
                  </Link>
                </p>
              </motion.div>

              <motion.div variants={itemVariants} className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-slate-200/50" />
                </div>
                <div className="relative flex justify-center text-xs">
                  <span className="px-3 bg-white/60 backdrop-blur-sm text-slate-400">
                    Secure banking portal
                  </span>
                </div>
              </motion.div>

              <motion.div variants={itemVariants} className="flex justify-center gap-4 text-xs text-slate-400">
                <span className="flex items-center gap-1">
                  <Shield className="h-3 w-3" /> 256-bit SSL
                </span>
                <span className="flex items-center gap-1">
                  <CheckCircle className="h-3 w-3" /> RBI Compliant
                </span>
              </motion.div>
            </motion.form>
          </div>
        </motion.div>
      </div>
    </div>
  )
}