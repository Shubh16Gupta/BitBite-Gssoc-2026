// src/services/farmerService.js
import api, { unwrap } from './api'

export const farmerService = {
  // --- Profile ---
  getProfile: () => api.get('/farmer/profile').then(unwrap), // { profile, isProfileComplete, missingFields }
  getProfileStatus: () => api.get('/farmer/profile/status').then(unwrap),
  updateProfile: (payload) => api.put('/farmer/profile', payload).then(unwrap),

  // Aadhaar card photos -> Cloudinary. Pass either or both sides.
  uploadAadhaarDocuments: ({ aadhaarFrontImage, aadhaarBackImage }) => {
    const formData = new FormData()
    if (aadhaarFrontImage) formData.append('aadhaarFrontImage', aadhaarFrontImage)
    if (aadhaarBackImage) formData.append('aadhaarBackImage', aadhaarBackImage)
    return api
      .put('/farmer/profile/documents', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      .then(unwrap) // { profile, aadhaarDocuments, aadhaarVerified }
  },

  // --- Fields ---
  getFields: () => api.get('/farmer/fields').then((r) => unwrap(r).fields),
  getField: (id) => api.get(`/farmer/fields/${id}`).then((r) => unwrap(r).field),
  createField: (payload) => api.post('/farmer/fields', payload).then((r) => unwrap(r).field),
  updateField: (id, payload) => api.put(`/farmer/fields/${id}`, payload).then((r) => unwrap(r).field),
  deleteField: (id) => api.delete(`/farmer/fields/${id}`).then(unwrap),

  // --- Crop cycles (the 4-phase pipeline) ---
  getCropCatalog: () => api.get('/farmer/crop-cycles/catalog').then((r) => unwrap(r).crops),
  getCropCycles: (fieldId) =>
    api.get('/farmer/crop-cycles', { params: fieldId ? { fieldId } : {} }).then((r) => unwrap(r).cycles),
  getCropCycle: (id) => api.get(`/farmer/crop-cycles/${id}`).then((r) => unwrap(r).cycle),
  startCropCycle: (payload) => api.post('/farmer/crop-cycles', payload).then((r) => unwrap(r).cycle),
  submitPhase: (cycleId, formData, onUploadProgress) =>
    api
      .post(`/farmer/crop-cycles/${cycleId}/phases`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress,
      })
      .then(unwrap), // { phase, report, status, finalYield }

  // --- Weekly-analysis dashboards (per field) ---
  getDashboard: (fieldId) => api.get(`/farmer/dashboard/${fieldId}`).then(unwrap),
  getHistory: (fieldId) => api.get(`/farmer/history/${fieldId}`).then(unwrap),
  getGraph: (fieldId) => api.get(`/farmer/graph/${fieldId}`).then(unwrap),

  // --- Loans ---
  getBanks: () => api.get('/farmer/loans/banks').then((r) => unwrap(r).banks),
  getLoans: () => api.get('/farmer/loans').then((r) => unwrap(r).loans),
  applyLoan: (payload) => api.post('/farmer/loans', payload).then((r) => unwrap(r).loan),

  // --- Recent activity (derived from the farmer's own records) ---
  getActivity: (limit = 10) =>
    api.get('/farmer/activity', { params: { limit } }).then((r) => unwrap(r).activity),

  // --- Market price ---
  getMarketPrice: (crop, params = {}) =>
    api.get('/farmer/market-price', { params: { crop, ...params } }).then(unwrap),
}

export default farmerService
