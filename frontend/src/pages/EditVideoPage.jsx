import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'

import Icon from '@/shared/components/Icon'
import { fetchMyVideos, updateVideo } from '@/features/videos/api/videosApi'

export default function EditVideoPage() {
  const navigate = useNavigate()
  const [step, setStep] = useState('list')
  const [videos, setVideos] = useState([])
  const [selectedVideo, setSelectedVideo] = useState(null)
  const [title, setTitle] = useState('')
  const [visibility, setVisibility] = useState('public')
  const [allowComments, setAllowComments] = useState(true)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetchMyVideos()
      .then(setVideos)
      .catch((requestError) => setError(requestError.detail || requestError.message))
      .finally(() => setLoading(false))
  }, [])

  function selectVideo(video) {
    setSelectedVideo(video)
    setTitle(video.caption || video.original_filename || '')
    setVisibility(video.visibility || 'public')
    setAllowComments(video.allow_comments !== false)
    setStep('edit')
  }

  async function submit(e) {
    e.preventDefault()
    setSaving(true)
    setError('')
    try {
      await updateVideo(selectedVideo.id, { caption: title, visibility, allow_comments: allowComments })
      navigate('/profile')
    } catch (requestError) {
      setError(requestError.detail || requestError.message)
    } finally {
      setSaving(false)
    }
  }

  if (step === 'list') {
    return (
      <div className="page">
        <div className="page-head">
          <div>
            <h1>Video của tôi</h1>
            <p className="page-sub">Chọn video bạn đã tải lên để chỉnh sửa thông tin.</p>
          </div>
        </div>
        {error && <p className="error-note">{error}</p>}

        <section className="card">
          <header className="card-head">
            <div>
              <h2>Danh sách video</h2>
              <p className="card-sub">Chọn một video để cập nhật</p>
            </div>
          </header>
          <div className="card-body">
            {loading ? (
              <p>Đang tải danh sách video...</p>
            ) : (
              <div className="video-list">
                {videos.map((video) => (
                  <button key={video.id} type="button" className="video-list-item" onClick={() => selectVideo(video)}>
                    <div className="video-list-thumb">
                      <Icon name="play" size={18} />
                    </div>
                    <div className="video-list-info">
                      <strong>{video.caption || video.original_filename || 'Video không tiêu đề'}</strong>
                      <span>Chỉnh sửa</span>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </section>
      </div>
    )
  }

  const isRejected = selectedVideo?.status === 'rejected'
  const isPending = selectedVideo?.status === 'pending_review' || selectedVideo?.status === 'pending'
  const isPublished = selectedVideo?.status === 'published'

  return (
    <div className="page">
      <div className="page-head">
        <div>
          <h1>Chỉnh sửa thông tin video</h1>
          <p className="page-sub">Cập nhật caption và quyền hiển thị cho "{selectedVideo?.caption || selectedVideo?.original_filename}".</p>
        </div>
      </div>
      {error && <p className="error-note">{error}</p>}

      <form className="edit-video-grid" onSubmit={submit}>
        <section className="card">
          <header className="card-head">
            <div>
              <h2>Thông tin cơ bản</h2>
              <p className="card-sub">Điền thông tin hiển thị trên video</p>
            </div>
          </header>
          <div className="card-body form-stack">
            <label className="field">
              <span>Caption</span>
              <input className="text-input" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Nhập tiêu đề video" />
            </label>
            <label className="field">
              <span>Hiển thị</span>
              <select className="text-input" value={visibility} onChange={(e) => setVisibility(e.target.value)}>
                <option value="public">Công khai</option>
                <option value="private">Riêng tư</option>
              </select>
            </label>
            <label className="field">
              <span>
                <input type="checkbox" checked={allowComments} onChange={(e) => setAllowComments(e.target.checked)} /> Cho phép bình luận
              </span>
            </label>
          </div>
        </section>

        <div className="edit-actions" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {isRejected && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '10px 14px',
                borderRadius: '8px',
                background: 'rgba(255, 92, 92, 0.12)',
                border: '1px solid rgba(255, 92, 92, 0.3)',
                color: 'var(--danger)',
                fontSize: '13px',
                fontWeight: 500,
              }}
            >
              <Icon name="shield" size={16} />
              <span>Video đã bị từ chối do vi phạm tiêu chuẩn cộng đồng</span>
            </div>
          )}

          {isPending && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '10px 14px',
                borderRadius: '8px',
                background: 'rgba(255, 176, 32, 0.12)',
                border: '1px solid rgba(255, 176, 32, 0.3)',
                color: 'var(--warn)',
                fontSize: '13px',
                fontWeight: 500,
              }}
            >
              <Icon name="clock" size={16} />
              <span>Video đang được lưu trữ và chờ kiểm duyệt viên xem xét thủ công</span>
            </div>
          )}

          <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', flexWrap: 'wrap' }}>
            <button type="button" className="button ghost" onClick={() => setStep('list')}>Quay lại danh sách</button>
            <button type="button" className="button ghost" onClick={() => navigate(-1)}>Hủy</button>
            {isPublished && (
              <Link to="/" className="button ghost">
                Xem ở feed <Icon name="arrow" size={14} />
              </Link>
            )}
            <button type="submit" className="button primary" disabled={saving}>{saving ? 'Đang lưu...' : 'Lưu thay đổi'}</button>
          </div>
        </div>
      </form>
    </div>
  )
}
