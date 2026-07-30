// src/services/authService.js
import api, { unwrap } from './api'

export const authService = {
  // --- Farmer (OTP-based, no password) ---
  async sendOtp(phone) {
    const res = await api.post('/farmer/send-otp', { phone })
    return unwrap(res) // { phone, expiresAt, note? }
  },

  async verifyOtp(phone, otp) {
    const res = await api.post('/farmer/verify-otp', { phone, otp })
    return unwrap(res) // { isRegistered, token?, farmer? }
  },

  /**
   * Register a farmer. `documents` may carry the Aadhaar card photos
   * ({ aadhaarFrontImage, aadhaarBackImage }); when any is present the request
   * is sent as multipart so the backend can stream them to Cloudinary.
   */
  async farmerSignup(userData, documents = {}) {
    const fields = {}
    Object.keys(userData).forEach((k) => {
      if (userData[k] !== undefined && userData[k] !== '') fields[k] = userData[k]
    })

    const files = Object.entries(documents).filter(([, file]) => file)
    if (files.length === 0) {
      const res = await api.post('/farmer/signup', fields)
      return unwrap(res) // { token, farmer }
    }

    const formData = new FormData()
    Object.entries(fields).forEach(([k, v]) => formData.append(k, v))
    files.forEach(([name, file]) => formData.append(name, file))

    const res = await api.post('/farmer/signup', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    return unwrap(res) // { token, farmer }
  },

  // --- Bank (email + password) ---
  async bankLogin(officialEmail, password) {
    const res = await api.post('/bank/login', { officialEmail, password })
    return unwrap(res) // { token, bank }
  },

  async bankRegister(bankData) {
    // Requires an employeeIdCard file -> multipart.
    const formData = new FormData()
    Object.keys(bankData).forEach((k) => {
      if (bankData[k] !== undefined && bankData[k] !== '') formData.append(k, bankData[k])
    })
    const res = await api.post('/bank/signup', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    return unwrap(res) // { ...bank } (status: Pending)
  },

  // --- Admin (email + password) ---
  async adminLogin(email, password) {
    const res = await api.post('/admin/login', { email, password })
    return unwrap(res) // { token, admin }
  },
}

export default authService
