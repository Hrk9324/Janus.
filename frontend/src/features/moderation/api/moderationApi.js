import { apiFetch } from '@/shared/api/client'

export function fetchQueue() {
  return apiFetch('/v1/moderation/queue')
}

export function decideVideo(videoId, action, reason) {
  return apiFetch(`/v1/moderation/videos/${videoId}/decision`, {
    method: 'POST',
    body: { action, reason: reason || null },
  })
}

export function fetchReports() {
  return apiFetch('/v1/moderation/reports')
}

export function decideReport(reportId, action, reason) {
  return apiFetch(`/v1/moderation/reports/${reportId}/decision`, {
    method: 'POST',
    body: { action, reason: reason || null },
  })
}
<<<<<<< HEAD
=======

/** Lấy danh sách các khiếu nại (UC017). */
export function fetchAppeals() {
  return apiFetch('/v1/moderation/appeals')
}

/** Đưa ra phán quyết khiếu nại (UC017). */
export function decideAppeal(appealId, action, reason) {
  return apiFetch(`/v1/moderation/appeals/${appealId}/decision`, {
    method: 'POST',
    body: { action, reason: reason || null },
  })
}
>>>>>>> 0dcf2c46a0f557080b0fcca8ac5384151d871ffd
