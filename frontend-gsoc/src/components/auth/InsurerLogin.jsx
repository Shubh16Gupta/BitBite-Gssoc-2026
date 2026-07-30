/**
 * Insurer login. Approved insurers only — the backend blocks Pending/Rejected.
 */
import { useState } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { ShieldCheck, Mail, Lock, ArrowRight, Eye, EyeOff, CheckCircle } from 'lucide-react'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'
import { insuranceService } from '../../services/insuranceService'
import { getErrorMessage } from '../../services/api'
import { useAuth } from '../../hooks/useAuth'
import bankLoginBg from '../../assets/bankLoginBg.png'

export default function InsurerLogin() {
  const navigate = useNavigate()
  const { isAuthenticated, role, setSession } = useAuth()
  const [form, setForm] = useState({ email: '', password: '' })
  const [showPassword, setShowPassword] = useState(false)
  const [busy, setBusy] = useState(false)

  if (isAuthenticated && role === 'insurer') return <Navigate to="/insurer" replace />

  const submit = async (e) => {
    e.preventDefault()
    setBusy(true)
    try {
      const res = await insuranceService.login(form.email, form.password)
      setSession(res.token, { role: 'insurer', name: res.insurer?.companyName, ...res.insurer })
      toast.success('Insurer login successful!')
      navigate('/insurer')
    } catch (err) {
      toast.error(getErrorMessage(err))
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${bankLoginBg})` }} />
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
      <div className="absolute inset-0">
        <div className="absolute top-0 right-0 w-96 h-96 bg-teal-500/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-emerald-500/20 rounded-full blur-3xl animate-pulse delay-1000" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7 }}
        className="relative z-10 w-full max-w-md"
      >
        <div className="relative bg-white/95 backdrop-blur-2xl rounded-3xl shadow-2xl border border-white/20 p-8 md:p-10">
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-teal-500 via-emerald-500 to-cyan-500 rounded-t-3xl" />

          <div className="mb-6 flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-teal-500 to-emerald-500 grid place-items-center shadow-lg">
              <ShieldCheck className="h-6 w-6 text-white" />
            </div>
            <div>
              <p className="text-lg font-bold text-slate-900">AnnData</p>
              <p className="text-xs text-slate-500">Insurance portal</p>
            </div>
          </div>

          <form onSubmit={submit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Official email</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                <input
                  type="email"
                  required
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  placeholder="claims@insurer.co.in"
                  className="w-full pl-11 pr-4 py-3 bg-white/60 border border-slate-200/80 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/40 text-slate-800"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Password</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  placeholder="••••••••"
                  className="w-full pl-11 pr-12 py-3 bg-white/60 border border-slate-200/80 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/40 text-slate-800"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            <button
              disabled={busy}
              className="w-full rounded-xl bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-white font-semibold py-3.5 transition-all hover:scale-[1.02] shadow-lg shadow-teal-500/30 flex items-center justify-center gap-2 disabled:opacity-70"
            >
              {busy ? 'Logging in…' : 'Log in'}
              <ArrowRight className="h-5 w-5" />
            </button>
          </form>

          <p className="mt-4 text-center text-xs text-slate-500">
            Insurer accounts require admin approval before first login.
          </p>

          <div className="mt-4 border-t border-slate-200/50 pt-4 flex items-center justify-center gap-4 text-xs">
            <Link to="/login" className="font-semibold text-slate-400 hover:text-teal-600 transition">
              Farmer login
            </Link>
            <span className="text-slate-300">·</span>
            <Link to="/bank/login" className="font-semibold text-slate-400 hover:text-teal-600 transition">
              Bank login
            </Link>
          </div>

          <div className="mt-4 flex justify-center gap-4 text-xs text-slate-400">
            <span className="flex items-center gap-1"><ShieldCheck className="h-3 w-3" /> IRDAI aligned</span>
            <span className="flex items-center gap-1"><CheckCircle className="h-3 w-3" /> Secure</span>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
