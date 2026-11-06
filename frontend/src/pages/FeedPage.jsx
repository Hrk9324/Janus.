import { useState } from 'react'
import { useSearchParams, Link } from 'react-router-dom'

import VideoFeed from '@/features/videos/components/VideoFeed'
import FeedGrid from '@/features/videos/components/FeedGrid'
import Icon from '@/shared/components/Icon'

export default function FeedPage() {
  const [searchParams] = useSearchParams()
  const tag = searchParams.get('tag')?.trim()
  const [view, setView] = useState('video')
  const [focusedVideo, setFocusedVideo] = useState(null)

  function selectGridVideo(video) {
    setFocusedVideo(video)
    setView('video')
  }

  if (tag) {
    return (
      <div className="feed-page">
        <div className="feed-page-header">
          <div className="feed-tabs">
            <span className="feed-tab active">#{tag}</span>
          </div>
          {focusedVideo ? (
            <button type="button" className="button ghost small" onClick={() => setFocusedVideo(null)}>
              <Icon name="arrow" size={14} style={{ transform: 'rotate(180deg)' }} />
              <span>Quay lại lưới</span>
            </button>
          ) : (
            <Link to="/" className="button ghost small" aria-label="Quay lại feed chính">
              <Icon name="arrow" size={14} style={{ transform: 'rotate(180deg)' }} />
              <span>Xem feed cuộn</span>
            </Link>
          )}
        </div>
        {focusedVideo
          ? <VideoFeed focusVideo={focusedVideo} />
          : <FeedGrid activeTag={tag} onSelectVideo={selectGridVideo} />}
      </div>
    )
  }

  return (
    <div className="feed-page">
      <div className="feed-page-header">
        <div className="feed-tabs"><span className="feed-tab active">Dành cho bạn</span></div>
        <div className="feed-view-switch" role="group" aria-label="Chế độ xem video">
          <button type="button" className={view === 'video' ? 'active' : ''} onClick={() => setView('video')} aria-pressed={view === 'video'}>Video dọc</button>
          <button type="button" className={view === 'grid' ? 'active' : ''} onClick={() => setView('grid')} aria-pressed={view === 'grid'}>Lưới</button>
        </div>
      </div>
      {view === 'video'
        ? <VideoFeed focusVideo={focusedVideo} />
        : <FeedGrid onSelectVideo={selectGridVideo} />}
    </div>
  )
}
