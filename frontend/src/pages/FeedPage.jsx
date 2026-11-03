import { useState } from 'react'
import { useSearchParams, Link } from 'react-router-dom'

import VideoFeed from '@/features/videos/components/VideoFeed'
import FeedGrid from '@/features/videos/components/FeedGrid'
import Icon from '@/shared/components/Icon'

export default function FeedPage() {
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
  return (
    <div className="feed-page">
      <div className="feed-page-header">
        <div className="feed-tabs">
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
    </div>
  )
}
