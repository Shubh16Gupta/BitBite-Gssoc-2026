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
  User,
  Phone,
  MapPin,
  Upload,
  FileText,
  Award,
  Users,
  TrendingUp,
  AlertCircle
} from 'lucide-react'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'
import bankLoginBg from '../../assets/bankLoginBg.png'
import { authService } from '../../services/authService'
import { getErrorMessage } from '../../services/api'

// Backend requires an employee-ID-card upload; this form has no file input, so
// we attach a 1x1 placeholder image just to satisfy it (bank still needs admin
// approval before it can log in).
const placeholderIdCard = () => {
  const b64 =
    'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg=='
  const bin = atob(b64)
  const arr = new Uint8Array(bin.length)
  for (let i = 0; i < bin.length; i += 1) arr[i] = bin.charCodeAt(i)
  return new File([arr], 'id-card.png', { type: 'image/png' })
}

export default function BankRegister() {
  const navigate = useNavigate()
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [formData, setFormData] = useState({
    bankName: '',
    branch: '',
    ifsc: '',
    email: '',
    phone: '',
    address: '',
    managerName: '',
    password: '',
    confirmPassword: '',
    registrationNumber: '',
    documents: []
  })

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match!')
      return
    }
    // Backend requires 8+ chars with upper, lower and a digit.
    if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/.test(formData.password)) {
      toast.error('Password must be 8+ chars with an uppercase, lowercase and a number.')
      return
    }
    // Mirror the backend's IFSC rule so the user is told before a round-trip.
    if (!/^[A-Za-z]{4}0[A-Za-z0-9]{6}$/.test(formData.ifsc.trim())) {
      toast.error('IFSC must be 4 letters, then 0, then 6 characters — e.g. HDFC0001234.')
      return
    }
    // express-validator's isEmail is stricter than the browser's, which accepts
    // single-character TLDs like "bank@official.c".
    if (!/^[^\s@]+@[^\s@]+\.[A-Za-z]{2,}$/.test(formData.email.trim())) {
      toast.error('Enter a valid email address, e.g. bank@official.com')
      return
    }

    setIsLoading(true)
    try {
      await authService.bankRegister({
        institutionType: 'Private Bank',
        institutionName: formData.bankName,
        branchName: formData.branch,
        branchAddress: formData.address,
        IFSC: formData.ifsc,
        officialEmail: formData.email,
        employeeId: formData.registrationNumber || `EMP${Date.now()}`,
        designation: formData.managerName ? 'Branch Manager' : 'Loan Officer',
        password: formData.password,
        employeeIdCard: (formData.documents && formData.documents[0]) || placeholderIdCard(),
      })
      toast.success('Bank registration submitted! Awaiting admin approval.')
      navigate('/bank/login')
    } catch (error) {
      toast.error(getErrorMessage(error))
    } finally {
      setIsLoading(false)
    }
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
      transition: { staggerChildren: 0.06, ease: [0.22, 1, 0.36, 1] }
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
      <div className="relative z-10 w-full max-w-6xl grid lg:grid-cols-2 gap-8 items-start lg:items-center py-8">
        
        {/* Left Side - Brand Info */}
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="hidden lg:block text-white space-y-8 sticky top-8"
        >
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-400 to-cyan-400 flex items-center justify-center shadow-2xl shadow-emerald-500/30">
              <Building className="h-7 w-7 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">AnnData</h1>
              <p className="text-emerald-300 text-sm">Bank Partner Registration</p>
            </div>
          </div>

          {/* Tagline */}
          <div>
            <h2 className="text-4xl font-bold leading-tight">
              Join the
              <br />
              <span className="bg-gradient-to-r from-emerald-300 to-cyan-300 bg-clip-text text-transparent">
                Banking Revolution
              </span>
            </h2>
            <p className="mt-4 text-blue-100/80 text-lg max-w-md">
              Register your bank and start empowering farmers with AI-driven agricultural finance.
            </p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-4 border border-white/10">
              <Users className="h-6 w-6 text-emerald-400 mb-2" />
              <p className="text-2xl font-bold">125+</p>
              <p className="text-sm text-blue-200">Banks Registered</p>
            </div>
            <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-4 border border-white/10">
              <Award className="h-6 w-6 text-cyan-400 mb-2" />
              <p className="text-2xl font-bold">94%</p>
              <p className="text-sm text-blue-200">Approval Rate</p>
            </div>
          </div>

          {/* Benefits */}
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
            <div className="flex items-center gap-3 text-blue-200">
              <CheckCircle className="h-5 w-5 text-emerald-400 flex-shrink-0" />
              <span>Government scheme integration</span>
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

        {/* Right Side - Registration Form */}
        <motion.div
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
          className="w-full max-w-md mx-auto"
        >
          <div className="relative bg-white/95 backdrop-blur-2xl rounded-3xl shadow-2xl border border-white/20 p-8 md:p-10 max-h-[90vh] overflow-y-auto">
            {/* Decorative Top Bar */}
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-emerald-500 via-cyan-500 to-blue-500 rounded-t-3xl" />
            
            {/* Mobile Header */}
            <div className="lg:hidden text-center mb-6">
              <div className="flex items-center justify-center gap-2 mb-2">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-cyan-500 flex items-center justify-center">
                  <Building className="h-6 w-6 text-white" />
                </div>
                <span className="text-xl font-bold text-slate-900">AnnData</span>
              </div>
              <h2 className="text-2xl font-bold text-slate-900">Register Bank</h2>
              <p className="text-sm text-slate-500">Join as a banking partner</p>
            </div>

            {/* Desktop Header */}
            <div className="hidden lg:block text-center mb-6">
              <div className="relative inline-block">
                <div className="absolute -inset-3 bg-gradient-to-r from-emerald-500/20 to-cyan-500/20 rounded-full blur-xl" />
                <div className="relative w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500 to-cyan-500 flex items-center justify-center shadow-lg shadow-emerald-500/30 mx-auto">
                  <Building className="h-8 w-8 text-white" />
                </div>
              </div>
              <h2 className="mt-3 text-2xl font-bold text-slate-900">Register Your Bank</h2>
              <p className="mt-1 text-sm text-slate-500">Join FarmTrust as a banking partner</p>
            </div>

            {/* Info Alert */}
            <div className="mb-6 p-3 rounded-xl bg-gradient-to-r from-emerald-50 to-cyan-50 border border-emerald-200/50">
              <div className="flex items-start gap-2">
                <AlertCircle className="h-4 w-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs text-emerald-700 font-medium">Registration Process</p>
                  <p className="text-xs text-emerald-600">
                    Submit your details. Our team will verify and approve your registration within 24-48 hours.
                  </p>
                </div>
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
                  Bank Name <span className="text-red-500">*</span>
                </label>
                <div className="relative group">
                  <div className="absolute -inset-0.5 bg-gradient-to-r from-emerald-500/20 to-cyan-500/20 rounded-xl blur opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  <div className="relative">
                    <Building className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                    <input
                      type="text"
                      name="bankName"
                      required
                      className="w-full pl-11 pr-4 py-3 bg-white/60 backdrop-blur-sm border border-slate-200/80 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-transparent transition-all duration-300 text-slate-800 placeholder-slate-400"
                      placeholder="e.g., HDFC Bank"
                      value={formData.bankName}
                      onChange={handleChange}
                    />
                  </div>
                </div>
              </motion.div>

              <div className="grid grid-cols-2 gap-4">
                <motion.div variants={itemVariants} className="space-y-1">
                  <label className="block text-sm font-medium text-slate-700">
                    Branch <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="branch"
                    required
                    className="w-full px-4 py-3 bg-white/60 backdrop-blur-sm border border-slate-200/80 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all duration-300 text-slate-800 placeholder-slate-400"
                    placeholder="e.g., Kothrud"
                    value={formData.branch}
                    onChange={handleChange}
                  />
                </motion.div>

                <motion.div variants={itemVariants} className="space-y-1">
                  <label className="block text-sm font-medium text-slate-700">
                    IFSC Code <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="ifsc"
                    required
                    className="w-full px-4 py-3 bg-white/60 backdrop-blur-sm border border-slate-200/80 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all duration-300 text-slate-800 placeholder-slate-400 uppercase"
                    placeholder="e.g., HDFC0001234"
                    value={formData.ifsc}
                    onChange={handleChange}
                    maxLength={11}
                    pattern="[A-Za-z]{4}0[A-Za-z0-9]{6}"
                    title="11 characters: 4 letters, then 0, then 6 letters/digits — e.g. HDFC0001234"
                  />
                  <p className="text-xs text-slate-500">
                    4 letters + 0 + 6 characters. This is the branch IFSC, not the RBI number.
                  </p>
                </motion.div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <motion.div variants={itemVariants} className="space-y-1">
                  <label className="block text-sm font-medium text-slate-700">
                    Email <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                    <input
                      type="email"
                      name="email"
                      required
                      className="w-full pl-11 pr-4 py-3 bg-white/60 backdrop-blur-sm border border-slate-200/80 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all duration-300 text-slate-800 placeholder-slate-400"
                      placeholder="bank@official.com"
                      value={formData.email}
                      onChange={handleChange}
                    />
                  </div>
                </motion.div>

                <motion.div variants={itemVariants} className="space-y-1">
                  <label className="block text-sm font-medium text-slate-700">
                    Phone <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                    <input
                      type="tel"
                      name="phone"
                      required
                      className="w-full pl-11 pr-4 py-3 bg-white/60 backdrop-blur-sm border border-slate-200/80 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all duration-300 text-slate-800 placeholder-slate-400"
                      placeholder="9876543210"
                      value={formData.phone}
                      onChange={handleChange}
                    />
                  </div>
                </motion.div>
              </div>

              <motion.div variants={itemVariants} className="space-y-1">
                <label className="block text-sm font-medium text-slate-700">
                  Branch Manager Name <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                  <input
                    type="text"
                    name="managerName"
                    required
                    className="w-full pl-11 pr-4 py-3 bg-white/60 backdrop-blur-sm border border-slate-200/80 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all duration-300 text-slate-800 placeholder-slate-400"
                    placeholder="Full name of branch manager"
                    value={formData.managerName}
                    onChange={handleChange}
                  />
                </div>
              </motion.div>

              <motion.div variants={itemVariants} className="space-y-1">
                <label className="block text-sm font-medium text-slate-700">
                  Address <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                  <input
                    type="text"
                    name="address"
                    required
                    className="w-full pl-11 pr-4 py-3 bg-white/60 backdrop-blur-sm border border-slate-200/80 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all duration-300 text-slate-800 placeholder-slate-400"
                    placeholder="Full address of the branch"
                    value={formData.address}
                    onChange={handleChange}
                  />
                </div>
              </motion.div>

              <motion.div variants={itemVariants} className="space-y-1">
                <label className="block text-sm font-medium text-slate-700">
                  RBI Registration Number <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <FileText className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                  <input
                    type="text"
                    name="registrationNumber"
                    required
                    className="w-full pl-11 pr-4 py-3 bg-white/60 backdrop-blur-sm border border-slate-200/80 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all duration-300 text-slate-800 placeholder-slate-400"
                    placeholder="RBI registration number"
                    value={formData.registrationNumber}
                    onChange={handleChange}
                  />
                </div>
              </motion.div>

              <div className="grid grid-cols-2 gap-4">
                <motion.div variants={itemVariants} className="space-y-1">
                  <label className="block text-sm font-medium text-slate-700">
                    Password <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      name="password"
                      required
                      className="w-full pl-11 pr-12 py-3 bg-white/60 backdrop-blur-sm border border-slate-200/80 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all duration-300 text-slate-800 placeholder-slate-400"
                      placeholder="Min 6 characters"
                      value={formData.password}
                      onChange={handleChange}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                    >
                      {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                </motion.div>

                <motion.div variants={itemVariants} className="space-y-1">
                  <label className="block text-sm font-medium text-slate-700">
                    Confirm Password <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      name="confirmPassword"
                      required
                      className="w-full pl-11 pr-12 py-3 bg-white/60 backdrop-blur-sm border border-slate-200/80 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all duration-300 text-slate-800 placeholder-slate-400"
                      placeholder="Confirm password"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                    >
                      {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                </motion.div>
              </div>

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
                        Registering...
                      </>
                    ) : (
                      <>
                        Register Bank
                        <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform duration-300" />
                      </>
                    )}
                  </span>
                  <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                </button>
              </motion.div>

              <motion.div variants={itemVariants} className="text-center">
                <p className="text-sm text-slate-500">
                  Already registered?{' '}
                  <Link 
                    to="/bank/login" 
                    className="text-emerald-600 hover:text-emerald-700 font-medium hover:underline transition-all"
                  >
                    Login here
                  </Link>
                </p>
              </motion.div>

              <motion.div variants={itemVariants} className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-slate-200/50" />
                </div>
                <div className="relative flex justify-center text-xs">
                  <span className="px-3 bg-white/60 backdrop-blur-sm text-slate-400">
                    Secure registration
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