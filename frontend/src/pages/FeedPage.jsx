import { useState } from 'react'

import VideoFeed from '@/features/videos/components/VideoFeed'
import FeedGrid from '@/features/videos/components/FeedGrid'
import Icon from '@/shared/components/Icon'

export default function FeedPage() {
  const [view, setView] = useState('for-you')

  return (
    <div className="feed-page">
      <div className="feed-page-header">
        <div className="feed-tabs">
          <button type="button" className={`feed-tab ${view === 'for-you' ? 'active' : ''}`} onClick={() => setView('for-you')}>
            Dành cho bạn
          </button>
          <button type="button" className={`feed-tab ${view === 'following' ? 'active' : ''}`} onClick={() => setView('following')}>
            Đang theo dõi
          </button>
        </div>
        <button type="button" className="feed-grid-toggle" onClick={() => setView(view === 'grid' ? 'for-you' : 'grid')} aria-label="Chế độ lưới">
          <Icon name="film" size={18} />
          <span>{view === 'grid' ? 'Dạng cuộn' : 'Chế độ lưới'}</span>
        </button>
      </div>
      {view === 'grid' ? <FeedGrid /> : <VideoFeed />}
    </div>
  )
}
