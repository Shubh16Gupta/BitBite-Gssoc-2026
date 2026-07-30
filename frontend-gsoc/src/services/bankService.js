// src/services/bankService.js
import api, { unwrap } from './api'

export const bankService = {
  // Lending threshold (post / read)
  getCriteria: () => api.get('/bank/criteria').then(unwrap), // { minAnnScore }
  setCriteria: (minAnnScore) => api.put('/bank/criteria', { minAnnScore }).then(unwrap),

  // Eligibility
  getDashboard: (minAnnScore) =>
    api.get('/bank/dashboard', { params: minAnnScore != null ? { minAnnScore } : {} }).then(unwrap),
  getEligibleFarmers: (minAnnScore) =>
    api
      .get('/bank/eligible-farmers', { params: minAnnScore != null ? { minAnnScore } : {} })
      .then(unwrap), // { threshold, count, farmers }

  // Loan applications addressed to this bank
  loanSummary: () => api.get('/bank/loans/summary').then(unwrap),
  loans: (status) =>
    api.get('/bank/loans', { params: status ? { status } : {} }).then((r) => unwrap(r).loans),
  approveLoan: (id, note) => api.patch(`/bank/loans/${id}/approve`, { note }).then((r) => unwrap(r).loan),
  rejectLoan: (id, note) => api.patch(`/bank/loans/${id}/reject`, { note }).then((r) => unwrap(r).loan),

  // Drill-down report for a farmer (why they earned their score)
  getFarmerReport: (farmerId) => api.get(`/bank/farmers/${farmerId}/report`).then(unwrap),
}

export default bankService
