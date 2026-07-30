import { useState } from 'react'
import { useNavigate, useLocation, Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import toast from 'react-hot-toast'
import { authService } from '../../services/authService'
import { getErrorMessage } from '../../services/api'
import { useAuth } from '../../hooks/useAuth'
import { 
  Upload, 
  ArrowRight, 
  User, 
  Phone, 
  CreditCard, 
  Calendar, 
  MapPin, 
  Home, 
  Sprout, 
  Shield,
  CheckCircle,
  Sparkles,
  Users,
  Award,
  TrendingUp,
  Eye,
  EyeOff,
  Lock
} from 'lucide-react'
import { motion } from 'framer-motion'
import bankLoginBg from '../../assets/bankLoginBg.png'

const farmerSchema = z.object({
  fullName: z.string().min(2, 'Name is required'),
  phone: z.string().min(10, 'Valid phone number required'),
  aadhaar: z.string().length(12, 'Valid Aadhaar number required'),
  dob: z.string().min(1, 'Date of birth required'),
  gender: z.string().min(1, 'Gender required'),
  state: z.string().min(1, 'State required'),
  district: z.string().min(1, 'District required'),
  village: z.string().min(1, 'Village required'),
  landArea: z.string().min(1, 'Land area required'),
  landUnit: z.string().default('Acre'),
  ownershipType: z.string().default('Owned'),
  irrigationType: z.string().default('Rainfed'),
  primaryCrop: z.string().min(1, 'Primary crop required'),
  // Farmer sign-in is OTP-based, so a password is optional. If one is typed we
  // still check the length and that both fields match.
  password: z.string().optional().or(z.literal('')),
  confirmPassword: z.string().optional().or(z.literal('')),
})
  .refine((d) => !d.password || d.password.length >= 6, {
    message: 'Password must be at least 6 characters',
    path: ['password'],
  })
  .refine((d) => !d.password || d.password === d.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  })

const IRRIGATION_MAP = { Rainfed: 'rainfed', Irrigated: 'other', Both: 'other' }

// Mirrors the backend's uploadMemory limits, so a bad file is caught before the
// request is made rather than coming back as a 400.
const ALLOWED_DOC_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
const MAX_DOC_BYTES = 5 * 1024 * 1024

const pickDocument = (file, setter) => {
  if (!file) return
  if (!ALLOWED_DOC_TYPES.includes(file.type)) {
    toast.error('Aadhaar photo must be a JPG, PNG, or WEBP image.')
    return
  }
  if (file.size > MAX_DOC_BYTES) {
    toast.error('Aadhaar photo must be under 5 MB.')
    return
  }
  setter(file)
}

export default function FarmerSignup() {
  const navigate = useNavigate()
  const location = useLocation()
  const { setSession } = useAuth()
  const phoneFromOtp = location.state?.phone || ''
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [aadhaarFront, setAadhaarFront] = useState(null)
  const [aadhaarBack, setAadhaarBack] = useState(null)

  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(farmerSchema),
    defaultValues: { phone: phoneFromOtp },
  })

  // Without this, a failed validation blocks submit with no visible feedback.
  const onInvalid = (formErrors) => {
    const first = Object.values(formErrors)[0]
    toast.error(first?.message || 'Please fill all required fields correctly.')
    const firstKey = Object.keys(formErrors)[0]
    document
      .querySelector(`[name="${firstKey}"]`)
      ?.scrollIntoView({ behavior: 'smooth', block: 'center' })
  }

  const onSubmit = async (data) => {
    setIsLoading(true)
    try {
      const payload = {
        name: data.fullName,
        phone: (phoneFromOtp || data.phone || '').trim(),
        aadhaarNumber: data.aadhaar,
        dateOfBirth: data.dob,
        gender: data.gender,
        state: data.state,
        district: data.district,
        village: data.village,
        landArea: Number(data.landArea),
        landUnit: (data.landUnit || 'acre').toLowerCase(),
        ownershipType: (data.ownershipType || 'owned').toLowerCase(),
        irrigationType: IRRIGATION_MAP[data.irrigationType] || 'rainfed',
        primaryCrop: data.primaryCrop,
      }
      const res = await authService.farmerSignup(payload, {
        aadhaarFrontImage: aadhaarFront,
        aadhaarBackImage: aadhaarBack,
      })
      setSession(res.token, { role: 'farmer', ...res.farmer })
      toast.success('Registration successful!')
      navigate('/farmer')
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
    // pt-28 clears the fixed navbar (h-20) so the card is never cut off; the page
    // scrolls rather than the card having its own scroll area.
    <div className="min-h-screen flex items-start justify-center px-4 pt-28 pb-12 relative overflow-hidden">
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
      <div className="relative z-10 w-full max-w-6xl grid lg:grid-cols-2 gap-8 items-start py-4">
        
        {/* Left Side - Brand Info */}
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="hidden lg:block text-white space-y-8 sticky top-28"
        >

          {/* Tagline */}
          <div>
            <h2 className="text-4xl font-bold leading-tight">
              Join the
              <br />
              <span className="bg-gradient-to-r from-emerald-300 to-cyan-300 bg-clip-text text-transparent">
                Agricultural Revolution
              </span>
            </h2>
            <p className="mt-4 text-blue-100/80 text-lg max-w-md">
              Register and unlock access to fair credit, AI-powered insights, and sustainable farming opportunities.
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

          {/* Benefits */}
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
              <span>Easy access to government schemes</span>
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

        {/* Right Side - Registration Form */}
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
                
                
              </div>
              <h2 className="text-2xl font-bold text-slate-900">Farmer Registration</h2>
              <p className="text-sm text-slate-500">Join the farming revolution</p>
            </div>

            {/* Desktop Header */}
            <div className="hidden lg:block text-center mb-6">
              <div className="relative inline-block">
                <div className="absolute -inset-3 bg-gradient-to-r from-emerald-500/20 to-cyan-500/20 rounded-full blur-xl" />
                
              </div>
              <h2 className="mt-3 text-2xl font-bold text-slate-900">Farmer Registration</h2>
              <p className="mt-1 text-sm text-slate-500">Register to access FarmTrust services</p>
            </div>

            {/* Form */}
            <motion.form 
              variants={staggerContainer}
              initial="hidden"
              animate="show"
              className="space-y-4" 
              onSubmit={handleSubmit(onSubmit, onInvalid)}
            >
              {/* Personal Information */}
              <motion.div variants={itemVariants} className="space-y-3">
                <h3 className="text-sm font-semibold text-slate-800 flex items-center gap-2">
                  <User className="h-4 w-4 text-emerald-600" />
                  Personal Information
                </h3>

                <div className="space-y-1">
                  <label className="block text-sm font-medium text-slate-700">
                    Full Name <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                    <input 
                      {...register('fullName')} 
                      className="w-full pl-11 pr-4 py-3 bg-white/60 backdrop-blur-sm border border-slate-200/80 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all duration-300 text-slate-800 placeholder-slate-400" 
                      placeholder="Enter full name" 
                    />
                  </div>
                  {errors.fullName && <p className="text-red-500 text-sm mt-1">{errors.fullName.message}</p>}
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="block text-sm font-medium text-slate-700">
                      Phone <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                      <input 
                        {...register('phone')} 
                        className="w-full pl-11 pr-4 py-3 bg-white/60 backdrop-blur-sm border border-slate-200/80 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all duration-300 text-slate-800 placeholder-slate-400" 
                        placeholder="9876543210" 
                        type="tel" 
                      />
                    </div>
                    {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone.message}</p>}
                  </div>

                  <div className="space-y-1">
                    <label className="block text-sm font-medium text-slate-700">
                      Aadhaar <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <CreditCard className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                      <input 
                        {...register('aadhaar')} 
                        className="w-full pl-11 pr-4 py-3 bg-white/60 backdrop-blur-sm border border-slate-200/80 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all duration-300 text-slate-800 placeholder-slate-400" 
                        placeholder="12-digit Aadhaar" 
                        maxLength={12} 
                      />
                    </div>
                    {errors.aadhaar && <p className="text-red-500 text-sm mt-1">{errors.aadhaar.message}</p>}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="block text-sm font-medium text-slate-700">
                      Date of Birth <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <Calendar className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                      <input 
                        {...register('dob')} 
                        className="w-full pl-11 pr-4 py-3 bg-white/60 backdrop-blur-sm border border-slate-200/80 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all duration-300 text-slate-800 placeholder-slate-400" 
                        type="date" 
                      />
                    </div>
                    {errors.dob && <p className="text-red-500 text-sm mt-1">{errors.dob.message}</p>}
                  </div>

                  <div className="space-y-1">
                    <label className="block text-sm font-medium text-slate-700">
                      Gender <span className="text-red-500">*</span>
                    </label>
                    <select {...register('gender')} className="w-full px-4 py-3 bg-white/60 backdrop-blur-sm border border-slate-200/80 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all duration-300 text-slate-800">
                      <option value="">Select</option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                    {errors.gender && <p className="text-red-500 text-sm mt-1">{errors.gender.message}</p>}
                  </div>
                </div>
              </motion.div>

              {/* Farm Information */}
              <motion.div variants={itemVariants} className="space-y-3 pt-3 border-t border-slate-200/50">
                <h3 className="text-sm font-semibold text-slate-800 flex items-center gap-2">
                  <Home className="h-4 w-4 text-emerald-600" />
                  Farm Information
                </h3>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="block text-sm font-medium text-slate-700">
                      State <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                      <input 
                        {...register('state')} 
                        className="w-full pl-11 pr-4 py-3 bg-white/60 backdrop-blur-sm border border-slate-200/80 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all duration-300 text-slate-800 placeholder-slate-400" 
                        placeholder="State" 
                      />
                    </div>
                    {errors.state && <p className="text-red-500 text-sm mt-1">{errors.state.message}</p>}
                  </div>

                  <div className="space-y-1">
                    <label className="block text-sm font-medium text-slate-700">
                      District <span className="text-red-500">*</span>
                    </label>
                    <input 
                      {...register('district')} 
                      className="w-full px-4 py-3 bg-white/60 backdrop-blur-sm border border-slate-200/80 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all duration-300 text-slate-800 placeholder-slate-400" 
                      placeholder="District" 
                    />
                    {errors.district && <p className="text-red-500 text-sm mt-1">{errors.district.message}</p>}
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="block text-sm font-medium text-slate-700">
                    Village <span className="text-red-500">*</span>
                  </label>
                  <input 
                    {...register('village')} 
                    className="w-full px-4 py-3 bg-white/60 backdrop-blur-sm border border-slate-200/80 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all duration-300 text-slate-800 placeholder-slate-400" 
                    placeholder="Village name" 
                  />
                  {errors.village && <p className="text-red-500 text-sm mt-1">{errors.village.message}</p>}
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="block text-sm font-medium text-slate-700">
                      Land Area <span className="text-red-500">*</span>
                    </label>
                    <input 
                      {...register('landArea')} 
                      className="w-full px-4 py-3 bg-white/60 backdrop-blur-sm border border-slate-200/80 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all duration-300 text-slate-800 placeholder-slate-400" 
                      placeholder="e.g., 5" 
                      type="number" 
                    />
                    {errors.landArea && <p className="text-red-500 text-sm mt-1">{errors.landArea.message}</p>}
                  </div>

                  <div className="space-y-1">
                    <label className="block text-sm font-medium text-slate-700">Land Unit</label>
                    <select {...register('landUnit')} className="w-full px-4 py-3 bg-white/60 backdrop-blur-sm border border-slate-200/80 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all duration-300 text-slate-800">
                      <option value="Acre">Acre</option>
                      <option value="Hectare">Hectare</option>
                      <option value="Bigha">Bigha</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="block text-sm font-medium text-slate-700">Ownership Type</label>
                    <select {...register('ownershipType')} className="w-full px-4 py-3 bg-white/60 backdrop-blur-sm border border-slate-200/80 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all duration-300 text-slate-800">
                      <option value="Owned">Owned</option>
                      <option value="Leased">Leased</option>
                      <option value="Shared">Shared</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="block text-sm font-medium text-slate-700">Irrigation Type</label>
                    <select {...register('irrigationType')} className="w-full px-4 py-3 bg-white/60 backdrop-blur-sm border border-slate-200/80 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all duration-300 text-slate-800">
                      <option value="Rainfed">Rainfed</option>
                      <option value="Irrigated">Irrigated</option>
                      <option value="Both">Both</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="block text-sm font-medium text-slate-700">
                    Primary Crop <span className="text-red-500">*</span>
                  </label>
                  <input 
                    {...register('primaryCrop')} 
                    className="w-full px-4 py-3 bg-white/60 backdrop-blur-sm border border-slate-200/80 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all duration-300 text-slate-800 placeholder-slate-400" 
                    placeholder="e.g., Wheat, Rice, Cotton" 
                  />
                  {errors.primaryCrop && <p className="text-red-500 text-sm mt-1">{errors.primaryCrop.message}</p>}
                </div>
              </motion.div>

              {/* Aadhaar Upload */}
              <motion.div variants={itemVariants} className="space-y-3 pt-3 border-t border-slate-200/50">
                <h3 className="text-sm font-semibold text-slate-800 flex items-center gap-2">
                  <Shield className="h-4 w-4 text-emerald-600" />
                  Aadhaar Verification
                </h3>
                
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Aadhaar Front</label>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      id="aadhaarFront"
                      onChange={(e) => pickDocument(e.target.files[0], setAadhaarFront)}
                    />
                    <label htmlFor="aadhaarFront" className="cursor-pointer block">
                      <div className="border-2 border-dashed border-slate-300 rounded-xl p-4 text-center hover:border-emerald-500 hover:bg-emerald-50/30 transition-all duration-300">
                        <Upload className="h-6 w-6 mx-auto text-slate-400" />
                        <p className="text-xs text-slate-500 mt-1">Upload Front</p>
                        {aadhaarFront && <p className="text-xs text-emerald-600 mt-1">{aadhaarFront.name}</p>}
                      </div>
                    </label>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Aadhaar Back</label>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      id="aadhaarBack"
                      onChange={(e) => pickDocument(e.target.files[0], setAadhaarBack)}
                    />
                    <label htmlFor="aadhaarBack" className="cursor-pointer block">
                      <div className="border-2 border-dashed border-slate-300 rounded-xl p-4 text-center hover:border-emerald-500 hover:bg-emerald-50/30 transition-all duration-300">
                        <Upload className="h-6 w-6 mx-auto text-slate-400" />
                        <p className="text-xs text-slate-500 mt-1">Upload Back</p>
                        {aadhaarBack && <p className="text-xs text-emerald-600 mt-1">{aadhaarBack.name}</p>}
                      </div>
                    </label>
                  </div>
                </div>
              </motion.div>

              {/* Password */}
              <motion.div variants={itemVariants} className="space-y-3 pt-3 border-t border-slate-200/50">
                <h3 className="text-sm font-semibold text-slate-800 flex items-center gap-2">
                  <Lock className="h-4 w-4 text-emerald-600" />
                  Account Security <span className="font-normal text-slate-400">(optional — you sign in with OTP)</span>
                </h3>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="block text-sm font-medium text-slate-700">
                      Password
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        {...register('password')}
                        className="w-full pl-11 pr-12 py-3 bg-white/60 backdrop-blur-sm border border-slate-200/80 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all duration-300 text-slate-800 placeholder-slate-400"
                        placeholder="Min 6 characters"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                      >
                        {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                      </button>
                    </div>
                    {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password.message}</p>}
                  </div>

                  <div className="space-y-1">
                    <label className="block text-sm font-medium text-slate-700">
                      Confirm Password
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                      <input
                        type={showConfirmPassword ? 'text' : 'password'}
                        {...register('confirmPassword')}
                        className="w-full pl-11 pr-12 py-3 bg-white/60 backdrop-blur-sm border border-slate-200/80 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all duration-300 text-slate-800 placeholder-slate-400"
                        placeholder="Confirm password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                      >
                        {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                      </button>
                    </div>
                    {errors.confirmPassword && <p className="text-red-500 text-sm mt-1">{errors.confirmPassword.message}</p>}
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
                        Creating Account...
                      </>
                    ) : (
                      <>
                        Create Account
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
                    to="/login" 
                    className="text-emerald-600 hover:text-emerald-700 font-medium hover:underline transition-all"
                  >
                    Login here
                  </Link>
                </p>
              </motion.div>

              <motion.div variants={itemVariants} className="flex justify-center gap-4 text-xs text-slate-400">
                <span className="flex items-center gap-1">
                  <Shield className="h-3 w-3" /> 256-bit SSL
                </span>
                <span className="flex items-center gap-1">
                  <CheckCircle className="h-3 w-3" /> Data Secure
                </span>
              </motion.div>
            </motion.form>
          </div>
        </motion.div>
      </div>
    </div>
  )
}