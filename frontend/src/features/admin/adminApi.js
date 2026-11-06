import { apiFetch } from '@/shared/api/client'

export const fetchAdminStats = (days = 30) => apiFetch(`/v1/admin/stats?days=${days}`)
export const fetchAdminUsers = (search = '') => {
  const query = new URLSearchParams({ limit: '100' })
  if (search.trim()) query.set('search', search.trim())
  return apiFetch(`/v1/admin/users?${query}`)
}
export const setUserActive = (userId, isActive) => apiFetch(`/v1/admin/users/${userId}/status`, { method: 'PATCH', body: { is_active: isActive } })
export const setUserRole = (userId, role) => apiFetch(`/v1/admin/users/${userId}/role`, { method: 'PATCH', body: { role } })
export const fetchAdminLabels = () => apiFetch('/v1/admin/labels')
export const createAdminLabel = (name) => apiFetch('/v1/admin/labels', { method: 'POST', body: { name } })
export const updateAdminLabel = (labelId, patch) => apiFetch(`/v1/admin/labels/${labelId}`, { method: 'PATCH', body: patch })
