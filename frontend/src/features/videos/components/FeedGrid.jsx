import { useFeed } from '../hooks/useFeed'
import Icon from '@/shared/components/Icon'

export default function FeedGrid() {
  const { videos, loading, error, refresh } = useFeed()

  if (loading) {
    return <div className="feed-grid-empty">Đang tải...</div>
  }

  if (error) {
    return (
      <div className="feed-grid-empty">
        <span>{error}</span>
        <button type="button" className="button ghost" onClick={refresh}>Thử lại</button>
      </div>
    )
  }

  if (!Array.isArray(videos) || videos.length === 0) {
    return <div className="feed-grid-empty">Chưa có video nào</div>
  }

  return (
    <div className="feed-grid">
      {videos.map((video) => (
        <article key={video.id} className="feed-grid-card">
          <div className="feed-grid-thumb">
            <Icon name="play" size={22} />
          </div>
          <div className="feed-grid-meta">
            <p className="feed-grid-title">{video.caption || 'Video không tiêu đề'}</p>
            <span className="feed-grid-user">@{video.owner_name || 'janus'}</span>
          </div>
        </article>
      ))}
    </div>
  )
}
