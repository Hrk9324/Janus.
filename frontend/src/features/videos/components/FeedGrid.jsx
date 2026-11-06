import { useCallback, useEffect, useState } from 'react'

import Icon from '@/shared/components/Icon'
import { fetchFeed, searchVideosByTag } from '../api/videosApi'

function keepPublishedVideos(items = []) {
  return items.filter((video) => (
    video?.id
    && (!video.status || video.status === 'published')
    && (!video.visibility || video.visibility === 'public')
    && video.is_deleted !== true
  ))
}

export default function FeedGrid({ activeTag = '', onWatchingChange }) {
  const [videos, setVideos] = useState([])
  const [cursor, setCursor] = useState(null)
  const [hasMore, setHasMore] = useState(false)
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [error, setError] = useState('')
  const [selectedVideo, setSelectedVideo] = useState(null)

  const fetchPage = useCallback(async (nextCursor = null) => {
    const request = activeTag
      ? searchVideosByTag(activeTag, { limit: 12, cursor: nextCursor })
      : fetchFeed({ limit: 12, cursor: nextCursor })
    return request
  }, [activeTag])

  const refresh = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const result = await fetchPage()
      setVideos(keepPublishedVideos(result.items))
      setCursor(result.next_cursor || null)
      setHasMore(Boolean(result.has_more && result.next_cursor))
    } catch (requestError) {
      setError(requestError.detail || requestError.message || 'Không tải được danh sách video.')
      setVideos([])
    } finally {
      setLoading(false)
    }
  }, [fetchPage])

  useEffect(() => { refresh() }, [refresh])

  async function loadMore() {
    if (!hasMore || !cursor || loadingMore) return
    setLoadingMore(true)
    setError('')
    try {
      const result = await fetchPage(cursor)
      setVideos((current) => [...current, ...keepPublishedVideos(result.items)])
      setCursor(result.next_cursor || null)
      setHasMore(Boolean(result.has_more && result.next_cursor))
    } catch (requestError) {
      setError(requestError.detail || requestError.message || 'Không tải thêm được video.')
    } finally {
      setLoadingMore(false)
    }
  }

  if (selectedVideo) {
    const authorName = selectedVideo.author?.username || selectedVideo.owner_name || selectedVideo.username || 'nhà sáng tạo Janus'
    const title = selectedVideo.caption || selectedVideo.original_filename || 'Video không tiêu đề'
    const source = selectedVideo.stream_url || `/api/v1/videos/${selectedVideo.id}/stream`

    return (
      <section className="feed-grid-watch" aria-label="Đang xem video">
        <header className="feed-grid-watch-header">
          <button type="button" className="button ghost small" onClick={() => { setSelectedVideo(null); onWatchingChange?.(false) }}>
            <Icon name="arrow" size={14} style={{ transform: 'rotate(180deg)' }} />
            <span>Quay lại lưới</span>
          </button>
          <span className="feed-grid-watch-count">{Number(selectedVideo.view_count || 0).toLocaleString('vi-VN')} lượt xem</span>
        </header>
        <div className="feed-grid-watch-content">
          <div className="feed-grid-watch-player">
            <video
              key={selectedVideo.id}
              src={source}
              poster={selectedVideo.thumbnail_url || undefined}
              controls
              autoPlay
              muted
              playsInline
              onError={() => setError('Video này hiện không phát được.')}
            />
          </div>
          <div className="feed-grid-watch-meta">
            <span className="feed-grid-watch-author">@{authorName}</span>
            <h1>{title}</h1>
            {selectedVideo.matched_labels?.length > 0 && (
              <div className="feed-grid-labels">
                {selectedVideo.matched_labels.map((label) => <span key={label}>#{label}</span>)}
              </div>
            )}
            {error && <p className="feed-grid-watch-error" role="status">{error}</p>}
          </div>
        </div>
      </section>
    )
  }

  if (loading) return <div className="feed-grid-empty">Đang tải video…</div>
  if (error && videos.length === 0) return <div className="feed-grid-empty"><span>{error}</span><button type="button" className="button ghost" onClick={refresh}>Thử lại</button></div>
  if (!videos.length) return <div className="feed-grid-empty">Chưa có video nào được đăng</div>

  return (
    <div className="feed-grid-scroll">
      <div className="feed-grid">
        {videos.map((video) => {
          const authorName = video.author?.username || video.owner_name || video.username || 'janus'
          const title = video.caption || video.original_filename || 'Video không tiêu đề'
          return (
            <button
              key={video._loopKey || video.id}
              type="button"
              className="feed-grid-card"
              onClick={() => { setError(''); setSelectedVideo(video); onWatchingChange?.(true) }}
              aria-label={`Xem video: ${title}`}
            >
              <span className="feed-grid-thumb">
                {video.thumbnail_url
                  ? <img src={video.thumbnail_url} alt="" loading="lazy" />
                  : <span className="feed-grid-placeholder" aria-hidden="true" />}
                <span className="feed-grid-play"><Icon name="play" size={16} /></span>
                <span className="feed-grid-duration"><Icon name="play" size={11} />{Number(video.view_count || 0).toLocaleString('vi-VN')} lượt xem</span>
              </span>
              <span className="feed-grid-meta">
                <span className="feed-grid-title">{title}</span>
                <span className="feed-grid-sub">
                  <span className="feed-grid-user">@{authorName}</span>
                  {video.like_count !== undefined && <span className="feed-grid-likes"><Icon name="heart" size={12} />{video.like_count}</span>}
                </span>
                {video.matched_labels?.length > 0 && (
                  <span className="feed-grid-labels">
                    {video.matched_labels.map((label) => <span key={label}>#{label}</span>)}
                  </span>
                )}
              </span>
            </button>
          )
        })}
      </div>
      {error && <p className="feed-grid-inline-error">{error}</p>}
      {hasMore && <div className="feed-grid-more"><button type="button" className="button ghost" onClick={loadMore} disabled={loadingMore}>{loadingMore ? 'Đang tải…' : 'Tải thêm video'}</button></div>}
    </div>
  )
}
