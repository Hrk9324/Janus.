import { useCallback, useEffect, useState } from 'react'

import Icon from '@/shared/components/Icon'
import { EmptyState, ErrorNote, Spinner, StatusBadge } from '@/shared/components/Feedback'
import { VIDEO_STATUS_LABEL, formatBytes, formatDateTime } from '@/shared/lib/format'
import { useAuth } from '@/features/auth/AuthContext'
import AiResultPanel from '@/features/videos/components/AiResultPanel'
import { deleteVideo, fetchMyVideos, streamUrl } from '@/features/videos/api/videosApi'

const STATUS_TABS = [
  { id: 'all', label: 'Tất cả' },
  { id: 'published', label: 'Đã phát' },
  { id: 'pending', label: 'Chờ duyệt' },
  { id: 'rejected', label: 'Bị từ chối' },
]

export default function ProfilePage() {
  const { user } = useAuth()
  const [videos, setVideos] = useState([])
  const [activeTab, setActiveTab] = useState('all')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [selectedId, setSelectedId] = useState(null)
  const [busyId, setBusyId] = useState(null)

  const load = useCallback(async () => {
    setError('')
    try {
      const items = await fetchMyVideos()
      setVideos(items)
      setSelectedId((current) => (current && items.some((item) => item.id === current) ? current : items[0]?.id ?? null))
    } catch (requestError) {
      setError(requestError.detail || requestError.message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  async function remove(video) {
    setBusyId(video.id)
    try {
      await deleteVideo(video.id)
      await load()
    } catch (requestError) {
      setError(requestError.detail || requestError.message)
    } finally {
      setBusyId(null)
    }
  }

  // Số lượng đếm cho từng tab
  const counts = {
    all: videos.length,
    published: videos.filter((item) => item.status === 'published').length,
    pending: videos.filter((item) => item.status === 'pending' || item.status === 'pending_review' || item.status === 'processing').length,
    rejected: videos.filter((item) => item.status === 'rejected' || item.status === 'failed').length,
  }

  // Lọc theo tab đang chọn
  const filteredVideos = videos.filter((item) => {
    if (activeTab === 'published') return item.status === 'published'
    if (activeTab === 'pending') return item.status === 'pending' || item.status === 'pending_review' || item.status === 'processing'
    if (activeTab === 'rejected') return item.status === 'rejected' || item.status === 'failed'
    return true
  })

  function handleTabChange(tabId) {
    setActiveTab(tabId)
    const matched = videos.filter((item) => {
      if (tabId === 'published') return item.status === 'published'
      if (tabId === 'pending') return item.status === 'pending' || item.status === 'pending_review' || item.status === 'processing'
      if (tabId === 'rejected') return item.status === 'rejected' || item.status === 'failed'
      return true
    })
    if (matched.length > 0 && !matched.some((m) => m.id === selectedId)) {
      setSelectedId(matched[0].id)
    }
  }

  if (loading) {
    return (
      <div className="page-center">
        <Spinner label="Đang tải danh sách video" />
      </div>
    )
  }

  return (
    <div className="page">
      <div className="profile-head">
        <span className="avatar avatar-lg">{user.display_name.slice(0, 2).toUpperCase()}</span>
        <div>
          <h1>{user.display_name}</h1>
          <p className="page-sub">
            {user.email} · vai trò <strong>{user.role}</strong>
          </p>
        </div>
        <div className="stat-row">
          <button
            type="button"
            className={`stat stat-button ${activeTab === 'all' ? 'active' : ''}`}
            onClick={() => handleTabChange('all')}
          >
            <strong>{counts.all}</strong>
            <span>Tất cả</span>
          </button>
          <button
            type="button"
            className={`stat stat-button ${activeTab === 'published' ? 'active' : ''}`}
            onClick={() => handleTabChange('published')}
          >
            <strong>{counts.published}</strong>
            <span>Đã phát</span>
          </button>
          <button
            type="button"
            className={`stat stat-button ${activeTab === 'pending' ? 'active' : ''}`}
            onClick={() => handleTabChange('pending')}
          >
            <strong>{counts.pending}</strong>
            <span>Chờ duyệt</span>
          </button>
          <button
            type="button"
            className={`stat stat-button ${activeTab === 'rejected' ? 'active' : ''}`}
            onClick={() => handleTabChange('rejected')}
          >
            <strong>{counts.rejected}</strong>
            <span>Bị từ chối</span>
          </button>
        </div>
      </div>

      <ErrorNote>{error}</ErrorNote>

      {videos.length === 0 ? (
        <EmptyState
          icon="upload"
          title="Bạn chưa tải video nào"
          hint="Video tải lên sẽ hiển thị tại đây cùng kết quả phân tích AI."
          action={
            <a className="button primary" href="/upload">
              Tải video đầu tiên
            </a>
          }
        />
      ) : (
        <>
          {/* Thanh Tabs lọc trạng thái */}
          <div className="card-tabs" style={{ marginBottom: '16px' }}>
            <div className="tabs" role="tablist">
              {STATUS_TABS.map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  role="tab"
                  aria-selected={activeTab === tab.id}
                  className={activeTab === tab.id ? 'tab active' : 'tab'}
                  onClick={() => handleTabChange(tab.id)}
                >
                  {tab.label} ({counts[tab.id] ?? 0})
                </button>
              ))}
            </div>
          </div>

          <div className="profile-grid">
            {filteredVideos.length === 0 ? (
              <p className="ai-empty">Không có video nào trong danh mục này.</p>
            ) : (
              <ul className="video-list">
                {filteredVideos.map((video) => (
                  <li key={video.id} className={video.id === selectedId ? 'video-row active' : 'video-row'}>
                    <button type="button" className="video-row-main" onClick={() => setSelectedId(video.id)}>
                      <span className="video-row-thumb">
                        <video src={streamUrl(video.id)} muted playsInline preload="metadata" />
                      </span>
                      <span className="video-row-copy">
                        <strong>{video.caption || video.original_filename}</strong>
                        <span>
                          {formatDateTime(video.created_at)} · {formatBytes(video.size_bytes)}
                        </span>
                      </span>
                      <StatusBadge status={video.status} label={VIDEO_STATUS_LABEL[video.status] || video.status} />
                    </button>
                    <button
                      type="button"
                      className="icon-button danger"
                      onClick={() => remove(video)}
                      disabled={busyId === video.id}
                      aria-label="Xóa video"
                      title="Xóa video"
                    >
                      <Icon name="trash" size={16} />
                    </button>
                  </li>
                ))}
              </ul>
            )}

            {selectedId && <AiResultPanel videoId={selectedId} />}
          </div>
        </>
      )}
    </div>
  )
}
