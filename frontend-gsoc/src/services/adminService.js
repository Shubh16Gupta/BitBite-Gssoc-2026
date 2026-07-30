// src/services/adminService.js
import api, { unwrap } from './api'

export const adminService = {
  getBanks: () => api.get('/admin/banks').then((r) => unwrap(r).banks || unwrap(r)),
  approveBank: (id) => api.patch(`/admin/banks/${id}/approve`).then(unwrap),
  rejectBank: (id) => api.patch(`/admin/banks/${id}/reject`).then(unwrap),
}

export default adminService
