/**
 * Apply for a loan.
 *
 * The farmer picks one of the platform's admin-approved banks; the application
 * is submitted with a snapshot of their live AnnScore so the bank underwrites
 * against real crop data. There is no tenure field — agri credit here is
 * harvest-linked rather than a monthly EMI schedule.
 */
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import toast from 'react-hot-toast'
import { IndianRupee, Building2, Sprout, FileText, Send, TrendingUp, MapPin } from 'lucide-react'
import { farmerService } from '../../services/farmerService'
import { getErrorMessage } from '../../services/api'

const loanSchema = z.object({
  bankId: z.string().min(1, 'Please select a bank'),
  amount: z.string().min(1, 'Loan amount required'),
  cropType: z.string().min(1, 'Crop type required'),
  landArea: z.string().optional(),
  purpose: z.string().optional(),
  existingLoans: z.string().optional(),
})

export default function LoanApplication() {
  const navigate = useNavigate()
  const [isLoading, setIsLoading] = useState(false)
  const [banks, setBanks] = useState([])
  const [profile, setProfile] = useState(null)
  const [annScore, setAnnScore] = useState(null)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({ resolver: zodResolver(loanSchema) })

  useEffect(() => {
    let active = true
    ;(async () => {
      try {
        const [bankList, prof, cycles] = await Promise.all([
          farmerService.getBanks(),
          farmerService.getProfile().catch(() => null),
          farmerService.getCropCycles().catch(() => []),
        ])
        if (!active) return
        setBanks(bankList)
        if (prof?.profile) {
          setProfile(prof.profile)
          reset({
            cropType: prof.profile.primaryCrop || '',
            landArea: prof.profile.landArea ? String(prof.profile.landArea) : '',
          })
        }
        // Show the score the bank will see.
        const avg = (a) => (a.length ? a.reduce((x, y) => x + y, 0) / a.length : null)
        const perCycle = cycles
          .map((c) => avg((c.phases || []).filter((p) => p.annScore != null).map((p) => p.annScore)))
          .filter((v) => v != null)
        const overall = avg(perCycle)
        setAnnScore(overall == null ? null : Math.round(overall * 10) / 10)
      } catch (e) {
        toast.error(getErrorMessage(e))
      }
    })()
    return () => {
      active = false
    }
  }, [reset])

  const onInvalid = (formErrors) => {
    toast.error(Object.values(formErrors)[0]?.message || 'Please complete the required fields.')
  }

  const onSubmit = async (data) => {
    setIsLoading(true)
    try {
      await farmerService.applyLoan({
        bankId: data.bankId,
        amount: Number(data.amount),
        cropType: data.cropType,
        landArea: data.landArea ? Number(data.landArea) : undefined,
        purpose: data.purpose,
        existingLoans: data.existingLoans,
      })
      toast.success('Loan application submitted to the bank!')
      navigate('/farmer/loan-status')
    } catch (error) {
      toast.error(getErrorMessage(error))
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Apply for Loan</h1>
        <p className="text-slate-600">
          Choose a bank — your application carries your live AnnScore and crop analysis.
        </p>
      </div>

      {/* What the bank will see */}
      <div className="mb-6 rounded-xl border border-emerald-200 bg-emerald-50/60 p-4">
        <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm">
          <span className="flex items-center gap-1.5 font-medium text-emerald-800">
            <TrendingUp className="h-4 w-4" />
            Your AnnScore: <strong>{annScore ?? 'not scored yet'}</strong>
          </span>
          {profile && (
            <span className="flex items-center gap-1.5 text-slate-600">
              <MapPin className="h-4 w-4" />
              {[profile.village, profile.district, profile.state].filter(Boolean).join(', ')}
            </span>
          )}
        </div>
        {annScore == null && (
          <p className="mt-1 text-xs text-amber-700">
            Upload crop photos first — a scored crop gives the bank real data to lend against.
          </p>
        )}
      </div>

      <form onSubmit={handleSubmit(onSubmit, onInvalid)} className="space-y-6">
        {/* Bank selection */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Select Bank <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
            <select {...register('bankId')} className="input-field pl-10">
              <option value="">Choose a registered bank…</option>
              {banks.map((b) => (
                <option key={b._id} value={b._id}>
                  {b.institutionName} — {b.branchName}
                  {b.IFSC ? ` (${b.IFSC})` : ''}
                  {b.minAnnScore != null ? ` · min AnnScore ${b.minAnnScore}` : ''}
                </option>
              ))}
            </select>
          </div>
          {banks.length === 0 && (
            <p className="text-amber-600 text-sm mt-1">
              No approved banks are available yet.
            </p>
          )}
          {errors.bankId && <p className="text-red-500 text-sm mt-1">{errors.bankId.message}</p>}
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Loan Amount (₹) <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <IndianRupee className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
              <input
                {...register('amount')}
                type="number"
                min="1"
                className="input-field pl-10"
                placeholder="e.g., 50000"
              />
            </div>
            {errors.amount && <p className="text-red-500 text-sm mt-1">{errors.amount.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Crop Type <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <Sprout className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
              <input
                {...register('cropType')}
                className="input-field pl-10"
                placeholder="e.g., Wheat, Rice, Cotton"
              />
            </div>
            {errors.cropType && <p className="text-red-500 text-sm mt-1">{errors.cropType.message}</p>}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Land Area (Acres)</label>
          <input {...register('landArea')} type="number" step="0.01" className="input-field" placeholder="e.g., 5" />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Purpose of Loan</label>
          <div className="relative">
            <FileText className="absolute left-3 top-3 h-5 w-5 text-slate-400" />
            <textarea
              {...register('purpose')}
              rows={4}
              className="input-field pl-10"
              placeholder="Describe why you need this loan..."
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Any Existing Loans?</label>
          <input
            {...register('existingLoans')}
            className="input-field"
            placeholder="e.g., KCC loan of ₹25,000"
          />
        </div>

        <button
          type="submit"
          disabled={isLoading || banks.length === 0}
          className="w-full py-3 rounded-xl bg-emerald-600 text-white font-semibold hover:bg-emerald-700 transition disabled:opacity-60 flex items-center justify-center gap-2"
        >
          {isLoading ? 'Submitting…' : 'Submit Application'}
          <Send className="h-4 w-4" />
        </button>
      </form>
    </div>
  )
}
