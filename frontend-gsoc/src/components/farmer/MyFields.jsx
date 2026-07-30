/**
 * My Fields — list the farmer's fields and add new ones with a GPS location
 * picked from the map. The stored coordinates power weather + rainfall for every
 * crop-cycle phase, so a field must exist before any crop analysis.
 */
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Plus, MapPin, Sprout, Trash2, BarChart3, ArrowRight, X } from 'lucide-react'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'
import { farmerService } from '../../services/farmerService'
import { getErrorMessage } from '../../services/api'
import MapPicker from './MapPicker'

const emptyForm = {
  fieldName: '',
  cropType: '',
  area: '',
  areaUnit: 'acre',
  latitude: null,
  longitude: null,
}

export default function MyFields() {
  const [fields, setFields] = useState([])
  const [crops, setCrops] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState(emptyForm)
  const [saving, setSaving] = useState(false)

  const load = async () => {
    setLoading(true)
    try {
      setFields(await farmerService.getFields())
    } catch (e) {
      toast.error(getErrorMessage(e))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  // The supported-crop list comes from the backend catalog, which also drives
  // crop-cycle timing and yield baselines — so a field's crop always resolves
  // to a crop the analysis pipeline understands.
  useEffect(() => {
    farmerService
      .getCropCatalog()
      .then(setCrops)
      .catch((e) => toast.error(getErrorMessage(e)))
  }, [])

  // Fields saved before the catalog existed may hold a free-text crop, so fall
  // back to whatever is stored when the key isn't recognised.
  const cropLabel = (key) => crops.find((c) => c.key === key)?.label || key

  const onChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }))

  const submit = async (e) => {
    e.preventDefault()
    if (form.latitude == null) {
      toast.error('Please mark the field location on the map')
      return
    }
    setSaving(true)
    try {
      const created = await farmerService.createField({
        fieldName: form.fieldName,
        cropType: form.cropType,
        area: Number(form.area),
        areaUnit: form.areaUnit,
        location: { latitude: Number(form.latitude), longitude: Number(form.longitude) },
      })
      setFields((prev) => [created, ...prev])
      setForm(emptyForm)
      setShowForm(false)
      toast.success('Field added successfully!')
    } catch (err) {
      toast.error(getErrorMessage(err))
    } finally {
      setSaving(false)
    }
  }

  const remove = async (id, name) => {
    if (!window.confirm(`Delete "${name}"? This cannot be undone.`)) return
    try {
      await farmerService.deleteField(id)
      setFields((prev) => prev.filter((f) => f._id !== id))
      toast.success('Field deleted')
    } catch (err) {
      toast.error(getErrorMessage(err))
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">My Fields</h1>
          <p className="text-sm text-slate-500">
            Mark each field's GPS location — we use it to fetch local weather &amp; rainfall.
          </p>
        </div>
        <button
          onClick={() => setShowForm((s) => !s)}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 text-white font-medium hover:bg-emerald-700 transition shadow-lg shadow-emerald-500/25"
        >
          {showForm ? <X className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
          {showForm ? 'Close' : 'Add field'}
        </button>
      </div>

      {showForm && (
        <motion.form
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          onSubmit={submit}
          className="bg-white rounded-xl border border-slate-200 p-5 space-y-4"
        >
          <h3 className="font-semibold text-slate-900">New field</h3>

          <div className="grid md:grid-cols-2 gap-4">
            <Field label="Field name" required>
              <input
                name="fieldName"
                value={form.fieldName}
                onChange={onChange}
                required
                minLength={2}
                placeholder="e.g. North Plot"
                className="input-base"
              />
            </Field>
            <Field label="Crop type" required>
              <select
                name="cropType"
                value={form.cropType}
                onChange={onChange}
                required
                disabled={crops.length === 0}
                className="input-base disabled:opacity-60"
              >
                <option value="" disabled>
                  {crops.length === 0 ? 'Loading crops…' : 'Select a crop'}
                </option>
                {crops.map((crop) => (
                  <option key={crop.key} value={crop.key}>
                    {crop.label}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Area" required>
              <input
                name="area"
                type="number"
                step="0.01"
                min="0.01"
                value={form.area}
                onChange={onChange}
                required
                placeholder="e.g. 2.5"
                className="input-base"
              />
            </Field>
            <Field label="Unit">
              <select name="areaUnit" value={form.areaUnit} onChange={onChange} className="input-base">
                <option value="acre">Acre</option>
                <option value="hectare">Hectare</option>
              </select>
            </Field>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Field location <span className="text-red-500">*</span>
            </label>
            <MapPicker
              value={form.latitude != null ? { latitude: form.latitude, longitude: form.longitude } : null}
              onChange={(latitude, longitude) => setForm((f) => ({ ...f, latitude, longitude }))}
            />
          </div>

          <div className="flex justify-end gap-2">
            <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 transition">
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving || form.latitude == null}
              className="px-5 py-2.5 rounded-xl bg-emerald-600 text-white font-medium hover:bg-emerald-700 transition disabled:opacity-60"
            >
              {saving ? 'Saving…' : 'Save field'}
            </button>
          </div>
        </motion.form>
      )}

      {loading ? (
        <div className="flex justify-center py-16">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-emerald-600" />
        </div>
      ) : fields.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
          <Sprout className="h-12 w-12 text-emerald-400 mx-auto mb-3" />
          <h3 className="text-lg font-semibold text-slate-900">No fields yet</h3>
          <p className="text-sm text-slate-500 mt-1">
            Add your first field to start crop analysis.
          </p>
          <button
            onClick={() => setShowForm(true)}
            className="mt-4 px-4 py-2.5 rounded-xl bg-emerald-600 text-white font-medium hover:bg-emerald-700 transition"
          >
            + Add your first field
          </button>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {fields.map((field, i) => (
            <motion.div
              key={field._id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="bg-white rounded-xl border border-slate-200 p-5 hover:shadow-md transition group"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="w-11 h-11 rounded-xl bg-emerald-100 grid place-items-center text-xl">🌾</div>
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                    {cropLabel(field.cropType)}
                  </span>
                  <button
                    onClick={() => remove(field._id, field.fieldName)}
                    className="p-1 text-slate-300 hover:text-red-500 transition"
                    title="Delete field"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>

              <h3 className="font-semibold text-slate-900 group-hover:text-emerald-700 transition">
                {field.fieldName}
              </h3>
              <p className="text-sm text-slate-500 mt-1">
                {field.area} {field.areaUnit}
              </p>
              <p className="text-xs text-slate-400 mt-1 flex items-center gap-1">
                <MapPin className="h-3 w-3" />
                {field.location.latitude.toFixed(4)}, {field.location.longitude.toFixed(4)}
              </p>

              <div className="mt-4 flex items-center gap-3">
                <Link
                  to={`/farmer/fields/${field._id}`}
                  className="inline-flex items-center gap-1 text-sm font-medium text-emerald-600 hover:text-emerald-700"
                >
                  <BarChart3 className="h-4 w-4" /> Analytics
                </Link>
                <Link
                  to="/farmer/upload-crop"
                  className="inline-flex items-center gap-1 text-sm font-medium text-slate-500 hover:text-slate-800"
                >
                  Upload <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  )
}

function Field({ label, required, children }) {
  return (
    <div>
      <label className="block text-sm font-medium text-slate-700 mb-1">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      {children}
    </div>
  )
}
