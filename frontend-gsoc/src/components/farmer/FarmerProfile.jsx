import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  User,
  Phone,
  Mail,
  MapPin,
  Calendar,
  CreditCard,
  Sprout,
  Home,
  Upload,
  Save,
  ArrowLeft,
  CheckCircle,
  BadgeCheck,
  AlertTriangle,
  Edit,
  XCircle,
  Camera,
  FileText,
  Shield,
  Award,
  TrendingUp,
  Clock
} from 'lucide-react'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'
import { useAuth } from '../../hooks/useAuth'
import { farmerService } from '../../services/farmerService'
import { getErrorMessage } from '../../services/api'

const cap = (s) => (s ? s.charAt(0).toUpperCase() + s.slice(1) : s)

// Mirrors the backend's uploadMemory limits so a bad file is rejected before
// the request is made.
const ALLOWED_DOC_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
const MAX_DOC_BYTES = 5 * 1024 * 1024

// Supporting documents the backend stores, keyed by their upload field name.
// `from` says where the URL lives on the profile payload.
const DOCUMENTS = [
  { key: 'front', field: 'aadhaarFrontImage', label: 'Aadhaar Front', from: 'aadhaar' },
  { key: 'back', field: 'aadhaarBackImage', label: 'Aadhaar Back', from: 'aadhaar' },
  {
    key: 'land',
    field: 'landDocument',
    label: 'Land Document',
    from: 'land',
    hint: 'Title deed, khasra/khatauni or lease deed — proves your declared land area.',
  },
]

export default function FarmerProfile() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [isEditing, setIsEditing] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [uploadingDoc, setUploadingDoc] = useState(null)
  const [profile, setProfile] = useState({
    fullName: '',
    phone: '',
    email: '',
    aadhaar: '',
    dob: '',
    gender: '',
    state: '',
    district: '',
    village: '',
    landArea: '',
    landUnit: 'Acre',
    ownershipType: 'Owned',
    irrigationType: 'Rainfed',
    primaryCrop: '',
    profileImage: null,
    // Cloudinary URLs of the Aadhaar card photos, as returned by the backend.
    aadhaarDocuments: { front: null, back: null },
    aadhaarVerified: false,
    landDocument: null,
    landVerified: false,
    documentsComplete: true, // assume complete until the profile loads
    missingDocuments: [],
    createdAt: null,
    farmingExperience: '',
    annualIncome: '',
    bankAccount: '',
    ifscCode: '',
    preferredLanguage: 'Hindi'
  })
  // The farmer's real AnnScore — the same figure lenders underwrite against.
  const [score, setScore] = useState({ annScore: null, label: null, loading: true })

  useEffect(() => {
    farmerService
      .getScore()
      .then((s) => setScore({ annScore: s.annScore, label: s.label, loading: false }))
      .catch(() => setScore({ annScore: null, label: null, loading: false }))
  }, [])

  useEffect(() => {
    ;(async () => {
      try {
        const data = await farmerService.getProfile()
        const p = data.profile || {}
        setProfile((prev) => ({
          ...prev,
          fullName: p.name || '',
          phone: p.phone || '',
          landArea: p.landArea ?? '',
          landUnit: cap(p.landUnit) || 'Acre',
          ownershipType: cap(p.ownershipType) || 'Owned',
          irrigationType: cap(p.irrigationType) || 'Rainfed',
          state: p.state || '',
          district: p.district || '',
          village: p.village || '',
          primaryCrop: p.primaryCrop || '',
          gender: p.gender || '',
          dob: p.dateOfBirth ? String(p.dateOfBirth).slice(0, 10) : '',
          aadhaar: p.aadhaarMasked || '',
          aadhaarDocuments: p.aadhaarDocuments || { front: null, back: null },
          aadhaarVerified: Boolean(p.aadhaarVerified),
          landDocument: p.landDocument || null,
          landVerified: Boolean(p.landVerified),
          documentsComplete: p.documentsComplete !== false,
          missingDocuments: p.missingDocuments || [],
          createdAt: p.createdAt || null,
        }))
      } catch {
        // Fall back to the stored session basics.
        const storedUser = localStorage.getItem('user')
        if (storedUser) {
          try {
            const u = JSON.parse(storedUser)
            setProfile((prev) => ({ ...prev, fullName: u.name || '', phone: u.phone || '' }))
          } catch {
            /* ignore */
          }
        }
      }
    })()
  }, [])

  const handleChange = (e) => {
    const { name, value } = e.target
    setProfile(prev => ({ ...prev, [name]: value }))
  }

  /**
   * Upload one side of the Aadhaar card. The file goes straight to the backend
   * (which stores it on Cloudinary) rather than waiting for "Save Changes", so
   * the document and its verified state are persisted immediately.
   */
  const handleFileUpload = async (e, doc) => {
    const file = e.target.files[0]
    e.target.value = '' // allow re-selecting the same file after a failure
    if (!file) return

    if (!ALLOWED_DOC_TYPES.includes(file.type)) {
      toast.error('Please upload a JPG, PNG, or WEBP image.')
      return
    }
    if (file.size > MAX_DOC_BYTES) {
      toast.error('File size should be less than 5MB')
      return
    }

    setUploadingDoc(doc.key)
    try {
      const res = await farmerService.uploadDocuments({ [doc.field]: file })
      setProfile((prev) => ({
        ...prev,
        aadhaarDocuments: res.aadhaarDocuments,
        aadhaarVerified: res.aadhaarVerified,
        landDocument: res.landDocument ?? prev.landDocument,
        landVerified: Boolean(res.landVerified),
        documentsComplete: res.documentsComplete !== false,
        missingDocuments: res.missingDocuments || [],
      }))
      toast.success(`${doc.label} uploaded successfully!`)
    } catch (error) {
      toast.error(getErrorMessage(error))
    } finally {
      setUploadingDoc(null)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsLoading(true)
    try {
      // Only backend-updatable fields (phone/aadhaar/dob are managed by auth).
      await farmerService.updateProfile({
        name: profile.fullName,
        landArea: profile.landArea === '' ? undefined : Number(profile.landArea),
        landUnit: (profile.landUnit || 'acre').toLowerCase(),
        ownershipType: (profile.ownershipType || 'owned').toLowerCase(),
        state: profile.state,
        district: profile.district,
        village: profile.village,
      })
      const storedUser = localStorage.getItem('user')
      if (storedUser) {
        const u = JSON.parse(storedUser)
        u.name = profile.fullName
        localStorage.setItem('user', JSON.stringify(u))
      }
      toast.success('Profile updated successfully!')
      setIsEditing(false)
    } catch (error) {
      toast.error(getErrorMessage(error))
    } finally {
      setIsLoading(false)
    }
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.08, ease: [0.22, 1, 0.36, 1] }
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="p-2 rounded-xl bg-white/80 backdrop-blur-sm border border-slate-200/50 hover:bg-slate-50 transition-all hover:shadow-md group"
            aria-label="Go back"
          >
            <ArrowLeft className="h-5 w-5 text-slate-600 group-hover:text-slate-900 transition-colors" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">My Profile</h1>
            <p className="text-sm text-slate-500">Manage your personal and farm information</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {!isEditing ? (
            <button
              onClick={() => setIsEditing(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-cyan-600 hover:from-emerald-700 hover:to-cyan-700 text-white transition-all shadow-lg shadow-emerald-500/30"
            >
              <Edit className="h-4 w-4" />
              Edit Profile
            </button>
          ) : (
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsEditing(false)}
                className="px-4 py-2 rounded-xl bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                disabled={isLoading}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-cyan-600 hover:from-emerald-700 hover:to-cyan-700 text-white transition-all shadow-lg shadow-emerald-500/30 disabled:opacity-70"
              >
                {isLoading ? (
                  <>
                    <svg className="animate-spin h-4 w-4 text-white" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4" />
                    Save Changes
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Profile Content */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="grid lg:grid-cols-3 gap-6"
      >
        {/* Left Column - Profile Image & Stats */}
        <motion.div variants={itemVariants} className="lg:col-span-1 space-y-4">
          {/* Profile Image Card */}
          <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-6 border border-white/50 shadow-sm text-center">
            <div className="relative inline-block">
              <div className="w-32 h-32 rounded-full bg-gradient-to-br from-emerald-400 to-cyan-400 flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/30">
                <span className="text-5xl font-bold text-white">
                  {profile.fullName?.charAt(0) || 'F'}
                </span>
              </div>
              {isEditing && (
                <label className="absolute bottom-0 right-0 p-2 bg-white rounded-full shadow-lg cursor-pointer hover:bg-slate-50 transition-colors border border-slate-200">
                  <Camera className="h-4 w-4 text-slate-600" />
                  <input type="file" accept="image/*" className="hidden" />
                </label>
              )}
            </div>
            <h3 className="mt-4 text-xl font-bold text-slate-900">{profile.fullName || 'Farmer'}</h3>
            <p className="text-sm text-slate-500">Farmer Account</p>
            {profile.aadhaarVerified ? (
              <div className="mt-4 inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-xs font-medium">
                <BadgeCheck className="h-3.5 w-3.5" />
                Aadhaar Verified
              </div>
            ) : (
              <div className="mt-4 inline-flex items-center gap-1.5 px-3 py-1 bg-amber-100 text-amber-700 rounded-full text-xs font-medium">
                <Clock className="h-3.5 w-3.5" />
                Aadhaar Pending
              </div>
            )}
          </div>

          {/* Quick Stats */}
          <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-4 border border-white/50 shadow-sm">
            <h4 className="text-sm font-semibold text-slate-700 mb-3">Quick Stats</h4>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-500">AnnScore</span>
                {score.loading ? (
                  <span className="text-sm text-slate-400">…</span>
                ) : score.annScore == null ? (
                  <span className="text-sm text-slate-400">no analysis yet</span>
                ) : (
                  <span className="text-lg font-bold text-emerald-600">
                    {score.annScore}
                    <span className="text-xs font-medium text-slate-400"> / 100</span>
                  </span>
                )}
              </div>
              {score.label && score.annScore != null && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-500">Rating</span>
                  <span className="text-sm font-medium text-slate-700 capitalize">{score.label}</span>
                </div>
              )}
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-500">Member Since</span>
                <span className="text-sm font-medium text-slate-700">
                  {profile.createdAt ? new Date(profile.createdAt).getFullYear() : '—'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-500">Status</span>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                  <CheckCircle className="h-3 w-3" />
                  Active
                </span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Right Column - Profile Details */}
        <motion.div variants={itemVariants} className="lg:col-span-2 space-y-4">
          {/* Personal Information */}
          <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-6 border border-white/50 shadow-sm">
            <h4 className="text-sm font-semibold text-slate-700 mb-4 flex items-center gap-2">
              <User className="h-4 w-4 text-emerald-600" />
              Personal Information
            </h4>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-600">Full Name</label>
                {isEditing ? (
                  <input
                    type="text"
                    name="fullName"
                    value={profile.fullName}
                    onChange={handleChange}
                    className="w-full mt-1 px-4 py-2 bg-white/60 backdrop-blur-sm border border-slate-200/80 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all text-slate-800"
                  />
                ) : (
                  <p className="mt-1 text-slate-900 font-medium">{profile.fullName || 'Not provided'}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-600">Phone Number</label>
                {isEditing ? (
                  <input
                    type="tel"
                    name="phone"
                    value={profile.phone}
                    onChange={handleChange}
                    className="w-full mt-1 px-4 py-2 bg-white/60 backdrop-blur-sm border border-slate-200/80 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all text-slate-800"
                  />
                ) : (
                  <p className="mt-1 text-slate-900 font-medium">{profile.phone || 'Not provided'}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-600">Email</label>
                {isEditing ? (
                  <input
                    type="email"
                    name="email"
                    value={profile.email}
                    onChange={handleChange}
                    className="w-full mt-1 px-4 py-2 bg-white/60 backdrop-blur-sm border border-slate-200/80 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all text-slate-800"
                  />
                ) : (
                  <p className="mt-1 text-slate-900 font-medium">{profile.email || 'Not provided'}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-600">Date of Birth</label>
                {isEditing ? (
                  <input
                    type="date"
                    name="dob"
                    value={profile.dob}
                    onChange={handleChange}
                    className="w-full mt-1 px-4 py-2 bg-white/60 backdrop-blur-sm border border-slate-200/80 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all text-slate-800"
                  />
                ) : (
                  <p className="mt-1 text-slate-900 font-medium">{profile.dob || 'Not provided'}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-600">Gender</label>
                {isEditing ? (
                  <select
                    name="gender"
                    value={profile.gender}
                    onChange={handleChange}
                    className="w-full mt-1 px-4 py-2 bg-white/60 backdrop-blur-sm border border-slate-200/80 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all text-slate-800"
                  >
                    <option value="">Select</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                ) : (
                  <p className="mt-1 text-slate-900 font-medium">{profile.gender || 'Not provided'}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-600">Aadhaar Number</label>
                {/* Read-only in both modes: the number is stored as a one-way
                    hash at signup and can never be edited or read back. */}
                <p className="mt-1 text-slate-900 font-medium flex items-center gap-2">
                  {profile.aadhaar ? '••••••••' + profile.aadhaar.slice(-4) : 'Not provided'}
                  {profile.aadhaarVerified && <BadgeCheck className="h-4 w-4 text-emerald-500" />}
                </p>
              </div>
            </div>
          </div>

          {/* Farm Information */}
          <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-6 border border-white/50 shadow-sm">
            <h4 className="text-sm font-semibold text-slate-700 mb-4 flex items-center gap-2">
              <Home className="h-4 w-4 text-emerald-600" />
              Farm Information
            </h4>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-600">State</label>
                {isEditing ? (
                  <input
                    type="text"
                    name="state"
                    value={profile.state}
                    onChange={handleChange}
                    className="w-full mt-1 px-4 py-2 bg-white/60 backdrop-blur-sm border border-slate-200/80 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all text-slate-800"
                  />
                ) : (
                  <p className="mt-1 text-slate-900 font-medium">{profile.state || 'Not provided'}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-600">District</label>
                {isEditing ? (
                  <input
                    type="text"
                    name="district"
                    value={profile.district}
                    onChange={handleChange}
                    className="w-full mt-1 px-4 py-2 bg-white/60 backdrop-blur-sm border border-slate-200/80 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all text-slate-800"
                  />
                ) : (
                  <p className="mt-1 text-slate-900 font-medium">{profile.district || 'Not provided'}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-600">Village</label>
                {isEditing ? (
                  <input
                    type="text"
                    name="village"
                    value={profile.village}
                    onChange={handleChange}
                    className="w-full mt-1 px-4 py-2 bg-white/60 backdrop-blur-sm border border-slate-200/80 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all text-slate-800"
                  />
                ) : (
                  <p className="mt-1 text-slate-900 font-medium">{profile.village || 'Not provided'}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-600">Primary Crop</label>
                {isEditing ? (
                  <input
                    type="text"
                    name="primaryCrop"
                    value={profile.primaryCrop}
                    onChange={handleChange}
                    className="w-full mt-1 px-4 py-2 bg-white/60 backdrop-blur-sm border border-slate-200/80 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all text-slate-800"
                  />
                ) : (
                  <p className="mt-1 text-slate-900 font-medium">{profile.primaryCrop || 'Not provided'}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-600">Land Area</label>
                {isEditing ? (
                  <div className="flex gap-2 mt-1">
                    <input
                      type="number"
                      name="landArea"
                      value={profile.landArea}
                      onChange={handleChange}
                      className="flex-1 px-4 py-2 bg-white/60 backdrop-blur-sm border border-slate-200/80 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all text-slate-800"
                    />
                    <select
                      name="landUnit"
                      value={profile.landUnit}
                      onChange={handleChange}
                      className="px-3 py-2 bg-white/60 backdrop-blur-sm border border-slate-200/80 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all text-slate-800"
                    >
                      <option value="Acre">Acre</option>
                      <option value="Hectare">Hectare</option>
                      <option value="Bigha">Bigha</option>
                    </select>
                  </div>
                ) : (
                  <p className="mt-1 text-slate-900 font-medium">
                    {profile.landArea ? `${profile.landArea} ${profile.landUnit}` : 'Not provided'}
                  </p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-600">Ownership Type</label>
                {isEditing ? (
                  <select
                    name="ownershipType"
                    value={profile.ownershipType}
                    onChange={handleChange}
                    className="w-full mt-1 px-4 py-2 bg-white/60 backdrop-blur-sm border border-slate-200/80 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all text-slate-800"
                  >
                    <option value="Owned">Owned</option>
                    <option value="Leased">Leased</option>
                    <option value="Shared">Shared</option>
                  </select>
                ) : (
                  <p className="mt-1 text-slate-900 font-medium">{profile.ownershipType || 'Not provided'}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-600">Irrigation Type</label>
                {isEditing ? (
                  <select
                    name="irrigationType"
                    value={profile.irrigationType}
                    onChange={handleChange}
                    className="w-full mt-1 px-4 py-2 bg-white/60 backdrop-blur-sm border border-slate-200/80 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all text-slate-800"
                  >
                    <option value="Rainfed">Rainfed</option>
                    <option value="Irrigated">Irrigated</option>
                    <option value="Both">Both</option>
                  </select>
                ) : (
                  <p className="mt-1 text-slate-900 font-medium">{profile.irrigationType || 'Not provided'}</p>
                )}
              </div>
            </div>
          </div>

          {/* Verification documents */}
          <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-6 border border-white/50 shadow-sm">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
              <h4 className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                <FileText className="h-4 w-4 text-emerald-600" />
                Verification Documents
              </h4>
              {profile.documentsComplete ? (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-emerald-100 text-emerald-700 rounded-full text-xs font-medium">
                  <BadgeCheck className="h-3.5 w-3.5" />
                  Verified
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-amber-100 text-amber-700 rounded-full text-xs font-medium">
                  <Clock className="h-3.5 w-3.5" />
                  {profile.missingDocuments.length} pending
                </span>
              )}
            </div>

            {/* Incomplete-profile warning: an unverified holding is the single
                biggest drag on how a lender reads the AnnScore. */}
            {!profile.documentsComplete && (
              <div className="mb-4 flex items-start gap-2.5 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3">
                <AlertTriangle className="h-4 w-4 text-amber-600 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium text-amber-900">Your profile is incomplete</p>
                  <p className="text-xs text-amber-700 mt-0.5">
                    Missing: {profile.missingDocuments.join(', ')}. Unverified details lower the
                    confidence lenders place in your AnnScore, which can reduce loan and insurance
                    offers. Upload {profile.missingDocuments.length > 1 ? 'them' : 'it'} below.
                  </p>
                </div>
              </div>
            )}

            <div className="grid md:grid-cols-2 gap-4">
              {DOCUMENTS.map((doc) => {
                const url =
                  doc.from === 'land' ? profile.landDocument : profile.aadhaarDocuments?.[doc.key]
                const isUploading = uploadingDoc === doc.key
                return (
                  <div key={doc.key} className="border border-slate-200/50 rounded-xl p-4">
                    <div className="flex items-center justify-between">
                      <label className="block text-sm font-medium text-slate-600">{doc.label}</label>
                      {url ? (
                        <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-600">
                          <BadgeCheck className="h-3.5 w-3.5" />
                          Uploaded
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-xs text-amber-600">
                          <XCircle className="h-3.5 w-3.5" />
                          Not uploaded
                        </span>
                      )}
                    </div>
                    {doc.hint && <p className="mt-1 text-xs text-slate-400">{doc.hint}</p>}

                    {url && (
                      <a href={url} target="_blank" rel="noopener noreferrer" className="mt-3 block group">
                        <img
                          src={url}
                          alt={doc.label}
                          className="w-full h-36 object-cover rounded-lg border border-slate-200 group-hover:opacity-90 transition"
                        />
                        <span className="mt-1.5 block text-xs text-emerald-600 group-hover:underline">
                          View full size
                        </span>
                      </a>
                    )}

                    {isEditing && (
                      <div className="mt-3">
                        <input
                          type="file"
                          accept="image/jpeg,image/png,image/webp"
                          className="hidden"
                          id={doc.field}
                          disabled={isUploading}
                          onChange={(e) => handleFileUpload(e, doc)}
                        />
                        <label
                          htmlFor={doc.field}
                          className={`flex items-center justify-center gap-2 px-4 py-3 border-2 border-dashed border-slate-300 rounded-xl transition-all duration-300 ${
                            isUploading
                              ? 'opacity-60 cursor-wait'
                              : 'cursor-pointer hover:border-emerald-500 hover:bg-emerald-50/30'
                          }`}
                        >
                          <Upload className="h-5 w-5 text-slate-400" />
                          <span className="text-sm text-slate-500">
                            {isUploading ? 'Uploading…' : url ? `Replace ${doc.label}` : `Upload ${doc.label}`}
                          </span>
                        </label>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>

            <p className="mt-4 text-xs text-slate-400">
              Your Aadhaar number is stored only as a one-way hash and shown masked. The card photos are
              held in secure cloud storage and used to verify your identity for loan and insurance partners.
            </p>
          </div>

          {/* Additional Information */}
          <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-6 border border-white/50 shadow-sm">
            <h4 className="text-sm font-semibold text-slate-700 mb-4 flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-emerald-600" />
              Additional Information
            </h4>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-600">Farming Experience</label>
                {isEditing ? (
                  <select
                    name="farmingExperience"
                    value={profile.farmingExperience}
                    onChange={handleChange}
                    className="w-full mt-1 px-4 py-2 bg-white/60 backdrop-blur-sm border border-slate-200/80 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all text-slate-800"
                  >
                    <option value="">Select</option>
                    <option value="Less than 1 year">Less than 1 year</option>
                    <option value="1-5 years">1-5 years</option>
                    <option value="5-10 years">5-10 years</option>
                    <option value="10+ years">10+ years</option>
                  </select>
                ) : (
                  <p className="mt-1 text-slate-900 font-medium">{profile.farmingExperience || 'Not provided'}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-600">Annual Income</label>
                {isEditing ? (
                  <select
                    name="annualIncome"
                    value={profile.annualIncome}
                    onChange={handleChange}
                    className="w-full mt-1 px-4 py-2 bg-white/60 backdrop-blur-sm border border-slate-200/80 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all text-slate-800"
                  >
                    <option value="">Select</option>
                    <option value="Below ₹50,000">Below ₹50,000</option>
                    <option value="₹50,000 - ₹1,00,000">₹50,000 - ₹1,00,000</option>
                    <option value="₹1,00,000 - ₹2,50,000">₹1,00,000 - ₹2,50,000</option>
                    <option value="₹2,50,000 - ₹5,00,000">₹2,50,000 - ₹5,00,000</option>
                    <option value="Above ₹5,00,000">Above ₹5,00,000</option>
                  </select>
                ) : (
                  <p className="mt-1 text-slate-900 font-medium">{profile.annualIncome || 'Not provided'}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-600">Bank Account Number</label>
                {isEditing ? (
                  <input
                    type="text"
                    name="bankAccount"
                    value={profile.bankAccount}
                    onChange={handleChange}
                    className="w-full mt-1 px-4 py-2 bg-white/60 backdrop-blur-sm border border-slate-200/80 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all text-slate-800"
                  />
                ) : (
                  <p className="mt-1 text-slate-900 font-medium">
                    {profile.bankAccount ? '••••••' + profile.bankAccount.slice(-4) : 'Not provided'}
                  </p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-600">IFSC Code</label>
                {isEditing ? (
                  <input
                    type="text"
                    name="ifscCode"
                    value={profile.ifscCode}
                    onChange={handleChange}
                    className="w-full mt-1 px-4 py-2 bg-white/60 backdrop-blur-sm border border-slate-200/80 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all text-slate-800 uppercase"
                  />
                ) : (
                  <p className="mt-1 text-slate-900 font-medium">{profile.ifscCode || 'Not provided'}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-600">Preferred Language</label>
                {isEditing ? (
                  <select
                    name="preferredLanguage"
                    value={profile.preferredLanguage}
                    onChange={handleChange}
                    className="w-full mt-1 px-4 py-2 bg-white/60 backdrop-blur-sm border border-slate-200/80 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all text-slate-800"
                  >
                    <option value="Hindi">Hindi</option>
                    <option value="English">English</option>
                    <option value="Marathi">Marathi</option>
                    <option value="Tamil">Tamil</option>
                    <option value="Telugu">Telugu</option>
                    <option value="Kannada">Kannada</option>
                    <option value="Malayalam">Malayalam</option>
                    <option value="Punjabi">Punjabi</option>
                    <option value="Bengali">Bengali</option>
                    <option value="Gujarati">Gujarati</option>
                  </select>
                ) : (
                  <p className="mt-1 text-slate-900 font-medium">{profile.preferredLanguage || 'Not provided'}</p>
                )}
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </div>
  )
}