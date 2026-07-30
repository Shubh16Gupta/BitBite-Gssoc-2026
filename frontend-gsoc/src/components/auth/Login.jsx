// src/components/auth/Login.jsx
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { 
  Phone, 
  Mail, 
  ArrowRight, 
  Sprout, 
  Shield,
  Eye,
  EyeOff,
  Lock,
  CheckCircle,
  Sparkles,
  Users,
  Award,
  TrendingUp
} from 'lucide-react'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'
import bankLoginBg from '../../assets/bankLoginBg.png'
import { authService } from '../../services/authService'
import { getErrorMessage } from '../../services/api'

export default function Login() {
  const [loginType, setLoginType] = useState('phone')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    identifier: '',
    password: '',
  })
  const navigate = useNavigate()

  // Farmer auth is OTP-based (no password). Enter phone -> we send an OTP ->
  // continue on the verification screen.
  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsLoading(true)
    try {
      const phone = String(formData.identifier || '').trim()
      if (!phone) {
        toast.error('Please enter your phone number')
        return
      }
      const res = await authService.sendOtp(phone)
      toast.success(res?.note ? 'OTP generated — check the backend console.' : 'OTP sent to your phone!')
      navigate('/verify-otp', { state: { phone } })
    } catch (error) {
      toast.error(getErrorMessage(error))
    } finally {
      setIsLoading(false)
    }
  }

  const handleQuickFill = () => {
    setFormData({ identifier: '9876543210', password: '' })
    toast.success('Sample phone filled')
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
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-400 to-cyan-400 flex items-center justify-center shadow-2xl shadow-emerald-500/30">
              <Sprout className="h-7 w-7 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">AnnData</h1>
              <p className="text-emerald-300 text-sm">Farmer Portal</p>
            </div>
          </div>

          {/* Tagline */}
          <div>
            <h2 className="text-4xl font-bold leading-tight">
              Welcome Back to
              <br />
              <span className="bg-gradient-to-r from-emerald-300 to-cyan-300 bg-clip-text text-transparent">
                Smart Farming
              </span>
            </h2>
            <p className="mt-4 text-blue-100/80 text-lg max-w-md">
              Login to access AI-powered insights, fair credit, and sustainable farming opportunities.
            </p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-4 border border-white/10">
              <Users className="h-6 w-6 text-emerald-400 mb-2" />
              <p className="text-2xl font-bold">10K+</p>
              <p className="text-sm text-blue-200">Farmers Registered</p>
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
              <span>AI-powered credit scoring</span>
            </div>
            <div className="flex items-center gap-3 text-blue-200">
              <CheckCircle className="h-5 w-5 text-emerald-400 flex-shrink-0" />
              <span>Real-time crop health monitoring</span>
            </div>
            <div className="flex items-center gap-3 text-blue-200">
              <CheckCircle className="h-5 w-5 text-emerald-400 flex-shrink-0" />
              <span>24x7 AI support in 30+ languages</span>
            </div>
          </div>

          {/* Trust Badge */}
          <div className="flex items-center gap-4 text-sm text-blue-300/60">
            <span>🔒 256-bit SSL</span>
            <span>•</span>
            <span>🏦 RBI Compliant</span>
            <span>•</span>
            <span>🛡️ Secure Platform</span>
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
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-cyan-500 flex items-center justify-center">
                  <Sprout className="h-6 w-6 text-white" />
                </div>
                <span className="text-xl font-bold text-slate-900">AnnData</span>
              </div>
              <h2 className="text-2xl font-bold text-slate-900">Welcome Back</h2>
              <p className="text-sm text-slate-500">Login to your account</p>
            </div>

            {/* Desktop Header */}
            <div className="hidden lg:block text-center mb-8">
              <div className="relative inline-block">
                <div className="absolute -inset-3 bg-gradient-to-r from-emerald-500/20 to-cyan-500/20 rounded-full blur-xl" />
                <div className="relative w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500 to-cyan-500 flex items-center justify-center shadow-lg shadow-emerald-500/30 mx-auto">
                  <Sprout className="h-8 w-8 text-white" />
                </div>
              </div>
              <h2 className="mt-4 text-2xl font-bold text-slate-900">Welcome Back</h2>
              <p className="mt-1 text-sm text-slate-500">Login to your FarmTrust account</p>
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
                <p>{loginType === 'phone' ? 'Phone: 9876543210' : 'Email: farmer@example.com'}</p>
                <p>Password: farmer123</p>
              </div>
            </div>

            {/* Login Type Toggle */}
            <motion.div 
              variants={itemVariants}
              className="flex rounded-xl overflow-hidden border border-slate-200/80 mb-6"
            >
              <button
                onClick={() => {
                  setLoginType('phone')
                  setFormData({ identifier: '', password: '' })
                }}
                className={`flex-1 py-2.5 px-4 text-sm font-medium transition-all duration-300 flex items-center justify-center gap-2 ${
                  loginType === 'phone'
                    ? 'bg-gradient-to-r from-emerald-600 to-cyan-600 text-white shadow-lg shadow-emerald-500/30'
                    : 'bg-white/60 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <Phone className="h-4 w-4" />
                Phone
              </button>
              <button
                onClick={() => {
                  setLoginType('email')
                  setFormData({ identifier: '', password: '' })
                }}
                className={`flex-1 py-2.5 px-4 text-sm font-medium transition-all duration-300 flex items-center justify-center gap-2 ${
                  loginType === 'email'
                    ? 'bg-gradient-to-r from-emerald-600 to-cyan-600 text-white shadow-lg shadow-emerald-500/30'
                    : 'bg-white/60 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <Mail className="h-4 w-4" />
                Email
              </button>
            </motion.div>

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
                  {loginType === 'phone' ? 'Phone Number' : 'Email Address'}
                </label>
                <div className="relative group">
                  <div className="absolute -inset-0.5 bg-gradient-to-r from-emerald-500/20 to-cyan-500/20 rounded-xl blur opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  <div className="relative">
                    {loginType === 'phone' ? (
                      <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                    ) : (
                      <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                    )}
                    <input
                      type={loginType === 'phone' ? 'tel' : 'email'}
                      required
                      className="w-full pl-11 pr-4 py-3 bg-white/60 backdrop-blur-sm border border-slate-200/80 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-transparent transition-all duration-300 text-slate-800 placeholder-slate-400"
                      placeholder={loginType === 'phone' ? 'Enter phone number' : 'Enter email address'}
                      value={formData.identifier}
                      onChange={(e) => setFormData({ ...formData, identifier: e.target.value })}
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
                        Login
                        <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform duration-300" />
                      </>
                    )}
                  </span>
                  <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                </button>
              </motion.div>

              <motion.div variants={itemVariants} className="text-center">
                <p className="text-sm text-slate-500">
                  Don't have an account?{' '}
                  <Link 
                    to="/farmer/signup" 
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
                    Secure login
                  </span>
                </div>
              </motion.div>

              <motion.div variants={itemVariants} className="flex justify-center gap-4 text-xs text-slate-400">
                <span className="flex items-center gap-1">
                  <Shield className="h-3 w-3" /> 256-bit SSL
                </span>
                <span className="flex items-center gap-1">
                  <CheckCircle className="h-3 w-3" /> Secure Platform
                </span>
              </motion.div>
            </motion.form>
          </div>
        </motion.div>
      </div>
    </div>
  )
}