// src/services/insuranceService.js
import api, { unwrap } from './api'

export const insuranceService = {
  // --- Farmer ---
  getQuote: (cycleId) => api.get(`/farmer/insurance/quote/${cycleId}`).then(unwrap),
  apply: (cycleId) => api.post('/farmer/insurance/apply', { cycleId }).then((r) => unwrap(r).application),
  myApplications: () => api.get('/farmer/insurance/applications').then((r) => unwrap(r).applications),

  // --- Insurer auth ---
  login: (officialEmail, password) =>
    api.post('/insurer/login', { officialEmail, password }).then(unwrap),
  signup: (payload) => api.post('/insurer/signup', payload).then(unwrap),

  // --- Insurer dashboard ---
  dashboard: () => api.get('/insurer/dashboard').then(unwrap),
  setCriteria: (minAnnScore) => api.put('/insurer/criteria', { minAnnScore }).then(unwrap),
  applications: (status) =>
    api.get('/insurer/applications', { params: status ? { status } : {} }).then((r) => unwrap(r).applications),
  approve: (id, note) =>
    api.patch(`/insurer/applications/${id}/approve`, { note }).then((r) => unwrap(r).application),
  reject: (id, note) =>
    api.patch(`/insurer/applications/${id}/reject`, { note }).then((r) => unwrap(r).application),
  farmerReport: (farmerId) => api.get(`/insurer/farmers/${farmerId}/report`).then(unwrap),
}

export default insuranceService
