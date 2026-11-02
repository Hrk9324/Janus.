import { useEffect, useRef, useState } from 'react'

import { EmptyState, ErrorNote, Spinner } from '@/shared/components/Feedback'
import { useFeed } from '../hooks/useFeed'
import VideoSlide from './VideoSlide'

/**
 * Feed cuộn dọc toàn màn hình kiểu TikTok (Snap-scrolling).
 * Áp dụng cơ chế Cửa sổ trượt (Sliding Window): Chỉ mount video cho slide đang xem
 * và slide kế tiếp để tiết kiệm băng thông và tài nguyên giải mã media.
 */
export default function VideoFeed() {
  const { videos, loading, error, refresh } = useFeed()
  const containerRef = useRef(null)
  const [activeIndex, setActiveIndex] = useState(0)

  useEffect(() => {
    const container = containerRef.current
    if (!container) return
    const slides = Array.from(container.querySelectorAll('.slide'))
    if (slides.length === 0) return

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && entry.intersectionRatio >= 0.5) {
            const index = slides.indexOf(entry.target)
            if (index >= 0) setActiveIndex(index)
          }
        })
      },
      { root: container, threshold: [0.5, 0.75] },
    )

    slides.forEach((slide) => observer.observe(slide))

    // Bắt thêm sự kiện scroll để cập nhật tức thời khi người dùng vuốt nhanh
    const handleScroll = () => {
      const slideHeight = container.clientHeight
      if (slideHeight > 0) {
        const index = Math.round(container.scrollTop / slideHeight)
        if (index >= 0 && index < slides.length) {
          setActiveIndex(index)
        }
      }
    }

    container.addEventListener('scroll', handleScroll, { passive: true })

    return () => {
      observer.disconnect()
      container.removeEventListener('scroll', handleScroll)
    }
  }, [videos])

  if (loading) {
    return (
      <div className="feed-center">
        <Spinner label="Đang tải feed" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="feed-center">
        <ErrorNote>{error}</ErrorNote>
        <button type="button" className="button ghost" onClick={refresh}>
          Thử lại
        </button>
      </div>
    )
  }

  if (!Array.isArray(videos) || videos.length === 0) {
    return (
      <div className="feed-center">
        <EmptyState
          icon="film"
          title="Chưa có video nào được phát"
          hint="Hãy tải video đầu tiên lên Janus để xem kết quả kiểm duyệt tại đây."
          action={
            <a className="button primary" href="/upload">
              Tải video lên
            </a>
          }
        />
      </div>
    )
  }

  return (
    <div className="feed-wrapper">
      <div className="feed" ref={containerRef}>
        {videos.map((video, index) => (
          <VideoSlide
            key={video.id}
            video={video}
            index={index}
            activeIndex={activeIndex}
            shouldMountVideo={index === activeIndex || index === activeIndex + 1}
            isActive={index === activeIndex}
            onReported={refresh}
          />
        ))}
      </div>
      {videos.length > 1 && (
        <div className="feed-progress">
          {videos.map((_, index) => (
            <span
              key={index}
              className={`feed-progress-dot ${index === activeIndex ? 'active' : ''}`}
            />
          ))}
        </div>
      )}
    </div>
  )
}
