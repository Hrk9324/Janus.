import { useState } from 'react'
<<<<<<< HEAD
=======
import { useSearchParams, Link } from 'react-router-dom'
>>>>>>> 0dcf2c46a0f557080b0fcca8ac5384151d871ffd

import VideoFeed from '@/features/videos/components/VideoFeed'
import FeedGrid from '@/features/videos/components/FeedGrid'
import Icon from '@/shared/components/Icon'

export default function FeedPage() {
<<<<<<< HEAD
  const [view, setView] = useState('for-you')

=======
  const [searchParams] = useSearchParams()
  const tag = searchParams.get('tag')?.trim()
  const [tab, setTab] = useState('for-you')

  // Giao diện lưới FeedGrid CHỈ ĐƯỢC HIỂN THỊ khi người dùng thực hiện tìm kiếm thẻ nhãn (?tag=...)
  if (tag) {
    return (
      <div className="feed-page">
        <div className="feed-page-header">
          <div className="feed-tabs">
            <span className="feed-tab active">
              #{tag}
            </span>
          </div>
          <Link to="/" className="button ghost small" aria-label="Quay lại feed chính">
            <Icon name="arrow" size={14} style={{ transform: 'rotate(180deg)' }} />
            <span>Xem feed cuộn</span>
          </Link>
        </div>
        <FeedGrid activeTag={tag} />
      </div>
    )
  }

  // Mặc định tại trang chủ (/ hoặc không có query ?tag=): LUÔN LUÔN render duy nhất cuộn dọc <VideoFeed />
  // Đã gỡ bỏ hoàn toàn nút chuyển đổi chế độ xem lưới ở góc trên bên phải
>>>>>>> 0dcf2c46a0f557080b0fcca8ac5384151d871ffd
  return (
    <div className="feed-page">
      <div className="feed-page-header">
        <div className="feed-tabs">
<<<<<<< HEAD
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
=======
          <button
            type="button"
            className={`feed-tab ${tab === 'for-you' ? 'active' : ''}`}
            onClick={() => setTab('for-you')}
          >
            Dành cho bạn
          </button>
          <button
            type="button"
            className={`feed-tab ${tab === 'following' ? 'active' : ''}`}
            onClick={() => setTab('following')}
          >
            Đang theo dõi
          </button>
        </div>
      </div>
      <VideoFeed />
>>>>>>> 0dcf2c46a0f557080b0fcca8ac5384151d871ffd
    </div>
  )
}
