import { useEffect, useRef, useState } from 'react'

import Icon from '@/shared/components/Icon'
import ReportDialog from './ReportDialog'
import CommentDrawer from './CommentDrawer'

/**
 * Một video slide trong feed dọc.
 * Áp dụng cơ chế Cửa sổ trượt (Sliding Window):
 * - Chỉ mount thẻ <video> cho video active (preload="auto") và video kế tiếp (preload="metadata").
 * - Tất cả các video còn lại chỉ mount ảnh thumbnail <img src={thumbnail_url}> để tiết kiệm băng thông.
 */
export default function VideoSlide({
  video,
  index,
  activeIndex,
  shouldMountVideo,
  isActive: propIsActive,
  onReported,
}) {
  const containerRef = useRef(null)
  const videoRef = useRef(null)
  const volumeRef = useRef(null)
  const [playing, setPlaying] = useState(false)
  const [muted, setMuted] = useState(true)
  const [volume, setVolume] = useState(0.5)
  const [reporting, setReporting] = useState(false)
  const [showComments, setShowComments] = useState(false)
  const [liked, setLiked] = useState(false)
  const [followed, setFollowed] = useState(false)
  const [showVolume, setShowVolume] = useState(false)
  const [fullscreen, setFullscreen] = useState(false)

  const isActive =
    propIsActive !== undefined
      ? propIsActive
      : index !== undefined && activeIndex !== undefined
      ? index === activeIndex
      : false

  const isNext =
    index !== undefined && activeIndex !== undefined ? index === activeIndex + 1 : false

  const canMount = shouldMountVideo !== undefined ? shouldMountVideo : isActive || isNext

  useEffect(() => {
    setPlaying(false)
    setLiked(false)
    setFollowed(false)
    setMuted(true)
    setVolume(0.5)
    setShowVolume(false)
    setShowComments(false)
    setFullscreen(false)
    if (videoRef.current) {
      videoRef.current.muted = true
      videoRef.current.volume = 0.5
    }
  }, [video.id])

  // Tự động phát khi slide trở thành active và dừng khi lướt sang video khác
  useEffect(() => {
    const element = videoRef.current
    if (!element) return

    if (isActive) {
      element
        .play()
        .then(() => setPlaying(true))
        .catch(() => {
          // Trình duyệt chặn autoplay có tiếng -> chuyển muted rồi phát lại
          if (!element.muted) {
            element.muted = true
            setMuted(true)
            element.play().then(() => setPlaying(true)).catch(() => setPlaying(false))
          } else {
            setPlaying(false)
          }
        })
    } else {
      element.pause()
      element.currentTime = 0
      setPlaying(false)
    }
  }, [isActive])

  useEffect(() => {
    if (!canMount) setPlaying(false)
  }, [canMount])

  useEffect(() => {
    function onChange() {
      setFullscreen(Boolean(document.fullscreenElement))
    }
    document.addEventListener('fullscreenchange', onChange)
    return () => document.removeEventListener('fullscreenchange', onChange)
  }, [])

  async function togglePlayback() {
    const element = videoRef.current
    if (!element) return
    if (element.paused) {
      try {
        await element.play()
        setPlaying(true)
      } catch {
        setPlaying(false)
      }
    } else {
      element.pause()
      setPlaying(false)
    }
  }

  function toggleMute() {
    const element = videoRef.current
    if (!element) return
    const nextMuted = !(muted || volume === 0)
    if (nextMuted) {
      setMuted(true)
      element.muted = true
    } else {
      setMuted(false)
      element.muted = false
      if (volume === 0) {
        setVolume(0.5)
        element.volume = 0.5
      }
    }
  }

  function changeVolume(e) {
    const value = Number(e.target.value)
    setVolume(value)
    const element = videoRef.current
    if (!element) return
    element.volume = value
    if (value === 0) {
      setMuted(true)
      element.muted = true
    } else {
      setMuted(false)
      element.muted = false
    }
  }

  function toggleFullscreen() {
    const videoEl = videoRef.current
    const containerEl = containerRef.current
    if (!videoEl) return
    const el = fullscreen ? containerEl : videoEl
    if (!el) return
    if (document.fullscreenElement) {
      document.exitFullscreen()
      setFullscreen(false)
      return
    }
    el.requestFullscreen?.().then(() => setFullscreen(true)).catch(() => {})
  }

  const viewCount = video.views || video.view_count || video.play_count || 0
  const likeCount = video.likes || video.like_count || 0

  return (
    <article className="slide" ref={containerRef}>
      <button
        type="button"
        className="slide-stage"
        onClick={togglePlayback}
        aria-label="Phát hoặc tạm dừng video"
      >
        {canMount ? (
          <video
            ref={videoRef}
            src={video.stream_url}
            loop
            playsInline
            muted={muted}
            preload={isActive ? 'auto' : 'metadata'}
            onPlay={() => setPlaying(true)}
            onPause={() => setPlaying(false)}
          />
        ) : video.thumbnail_url ? (
          <img
            src={video.thumbnail_url}
            alt={video.caption || 'Video thumbnail'}
            className="slide-poster"
            style={{
              width: 'min(420px, 40vw)',
              height: '100%',
              objectFit: 'contain',
              background: '#000',
            }}
            loading="lazy"
          />
        ) : (
          <div
            className="slide-poster placeholder"
            style={{ width: 'min(420px, 40vw)', height: '100%', background: '#000' }}
            aria-label="Ảnh bìa chưa sẵn sàng"
          />
        )}
        {!playing && (
          <span className="slide-play" style={!canMount ? { opacity: 0.65 } : undefined}>
            <Icon name="play" size={26} />
          </span>
        )}
      </button>

      <div className="slide-meta">
        <div className="slide-user-row">
          <span className="slide-user">@{video.owner_name || 'janus'}</span>
          <button
            type="button"
            className={`slide-follow ${followed ? 'active' : ''}`}
            onClick={() => setFollowed((v) => !v)}
          >
            {followed ? 'Đang theo dõi' : 'Theo dõi'}
          </button>
        </div>
        <p className="slide-caption">{video.caption || video.original_filename}</p>
        <div className="slide-view">
          <Icon name="play" size={12} />
          <span>{viewCount.toLocaleString('vi-VN')} lượt xem</span>
        </div>
      </div>

      <div className="slide-actions">
        <button
          type="button"
          className={`rail-button ${liked ? 'active' : ''}`}
          onClick={() => setLiked((v) => !v)}
          aria-label="Thích"
        >
          <Icon name={liked ? 'heart-filled' : 'heart'} size={22} />
          <span>{(likeCount + (liked ? 1 : 0)).toLocaleString('vi-VN')}</span>
        </button>
        <button
          type="button"
          className="rail-button"
          aria-label="Bình luận"
          onClick={() => setShowComments(true)}
        >
          <Icon name="message" size={22} />
          <span>Bình luận</span>
        </button>
        <div
          className="rail-volume"
          ref={volumeRef}
          onMouseEnter={() => setShowVolume(true)}
          onMouseLeave={() => {
            window.setTimeout(() => {
              const wrapper = volumeRef.current
              if (!wrapper) return
              if (!wrapper.matches(':hover')) {
                setShowVolume(false)
              }
            }, 120)
          }}
        >
          <button
            type="button"
            className="rail-button"
            onClick={toggleMute}
            aria-label={muted || volume === 0 ? 'Bật tiếng' : 'Tắt tiếng'}
          >
            <Icon name={muted || volume === 0 ? 'mute' : 'volume'} size={22} />
            <span>{muted || volume === 0 ? 'Bật tiếng' : 'Âm lượng'}</span>
          </button>
          <div
            className={`volume-slider ${showVolume ? 'visible' : ''}`}
            onMouseEnter={() => setShowVolume(true)}
            onMouseLeave={() => {
              window.setTimeout(() => {
                const wrapper = volumeRef.current
                if (!wrapper) return
                if (!wrapper.matches(':hover')) {
                  setShowVolume(false)
                }
              }, 120)
            }}
          >
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={muted ? 0 : volume}
              onChange={changeVolume}
            />
          </div>
        </div>
        <button
          type="button"
          className="rail-button"
          onClick={toggleFullscreen}
          aria-label={fullscreen ? 'Thu nhỏ' : 'Phóng to'}
        >
          <Icon name="expand" size={22} />
          <span>{fullscreen ? 'Thu nhỏ' : 'Phóng to'}</span>
        </button>
        <button
          type="button"
          className="rail-button"
          onClick={() => setReporting(true)}
          aria-label="Báo cáo"
        >
          <Icon name="flag" size={22} />
          <span>Báo cáo</span>
        </button>
      </div>

      {reporting && (
        <ReportDialog
          video={video}
          onClose={() => setReporting(false)}
          onReported={onReported}
        />
      )}
      {showComments && (
        <CommentDrawer video={video} onClose={() => setShowComments(false)} />
      )}
    </article>
  )
}
