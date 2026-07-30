import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { Shield, ArrowRight } from 'lucide-react'
import toast from 'react-hot-toast'
import { authService } from '../../services/authService'
import { getErrorMessage } from '../../services/api'
import { useAuth } from '../../hooks/useAuth'

/** Spread a 6-digit code across the six input boxes. */
const toDigits = (code) =>
  String(code || '')
    .padEnd(6, ' ')
    .slice(0, 6)
    .split('')
    .map((c) => (/\d/.test(c) ? c : ''))

export default function OTPVerification() {
  const location = useLocation()
  // In demo mode the code travels here from the login screen and is prefilled,
  // so there is nothing to type and no SMS to wait for.
  const [otp, setOtp] = useState(() =>
    location.state?.otp ? toDigits(location.state.otp) : ['', '', '', '', '', '']
  )
  const [demoOtp, setDemoOtp] = useState(location.state?.otp || null)
  const [timer, setTimer] = useState(30)
  const [canResend, setCanResend] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const navigate = useNavigate()
  const { setSession } = useAuth()
  const phone = location.state?.phone || ''

  useEffect(() => {
    if (!phone) navigate('/login', { replace: true })
  }, [phone, navigate])

  useEffect(() => {
    if (timer > 0) {
      const interval = setInterval(() => {
        setTimer((prev) => prev - 1)
      }, 1000)
      return () => clearInterval(interval)
    } else {
      setCanResend(true)
    }
  }, [timer])

  const handleChange = (index, value) => {
    if (value.length > 1) return
    const newOtp = [...otp]
    newOtp[index] = value
    setOtp(newOtp)

    // Auto-focus next input
    if (value && index < 5) {
      const nextInput = document.getElementById(`otp-${index + 1}`)
      if (nextInput) nextInput.focus()
    }
  }

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      const prevInput = document.getElementById(`otp-${index - 1}`)
      if (prevInput) prevInput.focus()
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const otpValue = otp.join('')
    if (otpValue.length !== 6) {
      toast.error('Please enter the complete 6-digit OTP')
      return
    }

    setSubmitting(true)
    try {
      const res = await authService.verifyOtp(phone, otpValue)
      if (res.isRegistered) {
        setSession(res.token, { role: 'farmer', ...res.farmer })
        toast.success('Login successful!')
        navigate('/farmer')
      } else {
        toast.success('OTP verified — please complete your signup.')
        navigate('/farmer/signup', { state: { phone } })
      }
    } catch (error) {
      toast.error(getErrorMessage(error))
    } finally {
      setSubmitting(false)
    }
  }

  const handleResend = async () => {
    if (!canResend) return
    try {
      const res = await authService.sendOtp(phone)
      setTimer(30)
      setCanResend(false)
      if (res?.otp) {
        // Demo mode — refill the boxes with the new code.
        setOtp(toDigits(res.otp))
        setDemoOtp(res.otp)
        toast.success(`Demo OTP: ${res.otp}`, { duration: 12000, icon: '🔐' })
      } else {
        toast.success('OTP sent again!')
      }
    } catch (error) {
      toast.error(getErrorMessage(error))
    }
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-12 px-4">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-xl shadow-lg">
        <div className="text-center">
          <div className="flex justify-center">
            <Shield className="h-12 w-12 text-primary-600" />
          </div>
          <h2 className="mt-4 text-2xl font-extrabold text-secondary-900">OTP Verification</h2>
          {demoOtp ? (
            <div className="mt-3 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3">
              <p className="text-sm text-emerald-800">
                Demo mode — code for {phone} is{' '}
                <span className="font-bold tracking-[0.2em]">{demoOtp}</span>
              </p>
              <p className="mt-0.5 text-xs text-emerald-600">
                Already filled in below. Just press Verify.
              </p>
            </div>
          ) : (
            <p className="mt-2 text-sm text-secondary-600">
              We've sent a 6-digit OTP to {phone || 'your phone'}
            </p>
          )}
        </div>

        <form onSubmit={handleSubmit} className="mt-8">
          <div className="flex justify-center gap-3 mb-8">
            {otp.map((digit, index) => (
              <input
                key={index}
                id={`otp-${index}`}
                type="text"
                maxLength="1"
                value={digit}
                onChange={(e) => handleChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                className="w-12 h-14 text-center text-2xl font-bold border-2 border-secondary-300 rounded-lg focus:border-primary-500 focus:outline-none transition-colors"
                autoFocus={index === 0}
              />
            ))}
          </div>

          <button type="submit" disabled={submitting} className="w-full btn-primary flex items-center justify-center disabled:opacity-60">
            {submitting ? 'Verifying…' : 'Verify OTP'}
            <ArrowRight className="ml-2 h-4 w-4" />
          </button>

          <div className="mt-4 text-center">
            {canResend ? (
              <button
                type="button"
                onClick={handleResend}
                className="text-primary-600 hover:text-primary-700 font-medium"
              >
                Resend OTP
              </button>
            ) : (
              <p className="text-secondary-500 text-sm">
                Resend in {timer} seconds
              </p>
            )}
          </div>
        </form>
      </div>
    </div>
  )
}