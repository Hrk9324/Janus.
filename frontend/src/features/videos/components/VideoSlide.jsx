<<<<<<< HEAD
import { useEffect, useRef, useState } from 'react'

import Icon from '@/shared/components/Icon'
import { streamUrl } from '../api/videosApi'
import ReportDialog from './ReportDialog'
import CommentDrawer from './CommentDrawer'

/** Một video trong feed: bấm để phát/tạm dừng, có các hành động bên phải. */
export default function VideoSlide({ video, onReported }) {
=======
import { useCallback, useEffect, useRef, useState } from 'react'

import Icon from '@/shared/components/Icon'
import { recordVideoView } from '../api/videosApi'
import ReportDialog from './ReportDialog'
import CommentDrawer from './CommentDrawer'

function formatViewCount(num) {
  const n = Number(num) || 0
  if (n >= 1_000_000) {
    const formatted = (n / 1_000_000).toFixed(1).replace(/\.0$/, '')
    return `${formatted}M`
  }
  if (n >= 1_000) {
    const formatted = (n / 1_000).toFixed(1).replace(/\.0$/, '')
    return `${formatted}K`
  }
  return n.toLocaleString('vi-VN')
}

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
>>>>>>> 0dcf2c46a0f557080b0fcca8ac5384151d871ffd
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
<<<<<<< HEAD
=======
  const [currentViews, setCurrentViews] = useState(
    Number(video.view_count ?? video.views ?? video.play_count ?? 0)
  )
  const hasCountedRef = useRef(false)

  const isActive =
    propIsActive !== undefined
      ? propIsActive
      : index !== undefined && activeIndex !== undefined
      ? index === activeIndex
      : false

  const isNext =
    index !== undefined && activeIndex !== undefined ? index === activeIndex + 1 : false

  const canMount = shouldMountVideo !== undefined ? shouldMountVideo : isActive || isNext

>>>>>>> 0dcf2c46a0f557080b0fcca8ac5384151d871ffd
  useEffect(() => {
    setPlaying(false)
    setLiked(false)
    setFollowed(false)
    setMuted(true)
    setVolume(0.5)
    setShowVolume(false)
    setShowComments(false)
    setFullscreen(false)
<<<<<<< HEAD
=======
    setCurrentViews(Number(video.view_count ?? video.views ?? video.play_count ?? 0))
    hasCountedRef.current = false
>>>>>>> 0dcf2c46a0f557080b0fcca8ac5384151d871ffd
    if (videoRef.current) {
      videoRef.current.muted = true
      videoRef.current.volume = 0.5
    }
<<<<<<< HEAD
  }, [video.id])
=======
  }, [video.id, video.view_count, video.views])

  useEffect(() => {
    if (!isActive) {
      hasCountedRef.current = false
    }
  }, [isActive])

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
>>>>>>> 0dcf2c46a0f557080b0fcca8ac5384151d871ffd

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

<<<<<<< HEAD
  useEffect(() => {
    function onChange() {
      setFullscreen(Boolean(document.fullscreenElement))
    }
    document.addEventListener('fullscreenchange', onChange)
    return () => document.removeEventListener('fullscreenchange', onChange)
  }, [])

  const viewCount = video.views || video.view_count || video.play_count || 0
=======
  const triggerCountView = useCallback(async () => {
    if (hasCountedRef.current) return
    hasCountedRef.current = true

    try {
      const res = await recordVideoView(video.id)
      if (res && typeof res.view_count === 'number') {
        setCurrentViews(res.view_count)
      } else if (res?.counted) {
        setCurrentViews((prev) => prev + 1)
      }
    } catch (err) {
      console.debug('Failed to record video view:', err)
    }
  }, [video.id])

  function handleTimeUpdate() {
    const el = videoRef.current
    if (!el || !isActive || hasCountedRef.current) return
    // Điều kiện 1: Đã xem liên tục từ 5 giây trở lên
    if (el.currentTime >= 5) {
      triggerCountView()
    } else if (
      el.duration &&
      el.duration < 5 &&
      el.currentTime >= Math.max(0, el.duration - 0.25)
    ) {
      // Hỗ trợ video ngắn dưới 5s khi phát lặp lại (loop)
      triggerCountView()
    }
  }

  function handleEnded() {
    const el = videoRef.current
    if (!el || !isActive || hasCountedRef.current) return
    // Điều kiện 2: Video có thời lượng ngắn (< 5s) và phát hết video
    if (el.duration && el.duration < 5) {
      triggerCountView()
    }
  }

>>>>>>> 0dcf2c46a0f557080b0fcca8ac5384151d871ffd
  const likeCount = video.likes || video.like_count || 0

  return (
    <article className="slide" ref={containerRef}>
<<<<<<< HEAD
      <button type="button" className="slide-stage" onClick={togglePlayback} aria-label="Phát hoặc tạm dừng video">
        <video
          ref={videoRef}
          src={streamUrl(video.id)}
          loop
          playsInline
          muted={muted}
          preload="metadata"
          onPlay={() => setPlaying(true)}
          onPause={() => setPlaying(false)}
        />
        {!playing && (
          <span className="slide-play">
=======
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
            onTimeUpdate={handleTimeUpdate}
            onEnded={handleEnded}
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
>>>>>>> 0dcf2c46a0f557080b0fcca8ac5384151d871ffd
            <Icon name="play" size={26} />
          </span>
        )}
      </button>

      <div className="slide-meta">
        <div className="slide-user-row">
          <span className="slide-user">@{video.owner_name || 'janus'}</span>
<<<<<<< HEAD
          <button type="button" className={`slide-follow ${followed ? 'active' : ''}`} onClick={() => setFollowed((v) => !v)}>
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
        <button type="button" className={`rail-button ${liked ? 'active' : ''}`} onClick={() => setLiked((v) => !v)} aria-label="Thích">
          <Icon name={liked ? 'heart-filled' : 'heart'} size={22} />
          <span>{(likeCount + (liked ? 1 : 0)).toLocaleString('vi-VN')}</span>
        </button>
        <button type="button" className="rail-button" aria-label="Bình luận" onClick={() => setShowComments(true)}>
=======
          <button
            type="button"
            className={`slide-follow ${followed ? 'active' : ''}`}
            onClick={() => setFollowed((v) => !v)}
          >
            {followed ? 'Đang theo dõi' : 'Theo dõi'}
          </button>
        </div>
        <div className="slide-view">
          <Icon name="play" size={12} />
          <span>{formatViewCount(currentViews)} lượt xem</span>
        </div>
        <p className="slide-caption">{video.caption || video.original_filename}</p>
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
>>>>>>> 0dcf2c46a0f557080b0fcca8ac5384151d871ffd
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
<<<<<<< HEAD
          <div className={`volume-slider ${showVolume ? 'visible' : ''}`} onMouseEnter={() => setShowVolume(true)} onMouseLeave={() => {
            window.setTimeout(() => {
              const wrapper = volumeRef.current
              if (!wrapper) return
              if (!wrapper.matches(':hover')) {
                setShowVolume(false)
              }
            }, 120)
          }}>
            <input type="range" min="0" max="1" step="0.01" value={muted ? 0 : volume} onChange={changeVolume} />
          </div>
        </div>
        <button type="button" className="rail-button" onClick={toggleFullscreen} aria-label={fullscreen ? 'Thu nhỏ' : 'Phóng to'}>
          <Icon name="expand" size={22} />
          <span>{fullscreen ? 'Thu nhỏ' : 'Phóng to'}</span>
        </button>
        <button type="button" className="rail-button" onClick={() => setReporting(true)} aria-label="Báo cáo">
=======
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
>>>>>>> 0dcf2c46a0f557080b0fcca8ac5384151d871ffd
          <Icon name="flag" size={22} />
          <span>Báo cáo</span>
        </button>
      </div>

<<<<<<< HEAD
      {reporting && <ReportDialog video={video} onClose={() => setReporting(false)} onReported={onReported} />}
      {showComments && <CommentDrawer video={video} onClose={() => setShowComments(false)} />}
    </article>
  )
}

=======
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
>>>>>>> 0dcf2c46a0f557080b0fcca8ac5384151d871ffd
