import { useCallback, useEffect, useState } from 'react'

import Icon from '@/shared/components/Icon'
import { fetchFeed, searchVideosByTag } from '../api/videosApi'

export default function FeedGrid({ activeTag = '' }) {
  const [videos, setVideos] = useState([])
  const [cursor, setCursor] = useState(null)
  const [hasMore, setHasMore] = useState(false)
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [error, setError] = useState('')

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
      setVideos(result.items || [])
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
      setVideos((current) => [...current, ...(result.items || [])])
      setCursor(result.next_cursor || null)
      setHasMore(Boolean(result.has_more && result.next_cursor))
    } catch (requestError) {
      setError(requestError.detail || requestError.message || 'Không tải thêm được video.')
    } finally {
      setLoadingMore(false)
    }
  }

  if (loading) return <div className="feed-grid-empty">Đang tải video…</div>
  if (error && videos.length === 0) return <div className="feed-grid-empty"><span>{error}</span><button type="button" className="button ghost" onClick={refresh}>Thử lại</button></div>
  if (!videos.length) return <div className="feed-grid-empty">Chưa có video nào</div>

  return <div className="feed-grid-scroll"><div className="feed-grid">
    {videos.map((video) => {
      const authorName = video.author?.username || video.owner_name || video.username || 'janus'
      const source = video.stream_url || `/api/v1/videos/${video.id}/stream`
      return <article key={video._loopKey || video.id} className="feed-grid-card">
        <div className="feed-grid-thumb"><video src={source} poster={video.thumbnail_url || undefined} controls playsInline preload="none" aria-label={video.caption || video.original_filename || 'Video Janus'}/><span className="feed-grid-duration"><Icon name="play" size={11}/>{Number(video.view_count||0).toLocaleString('vi-VN')} lượt xem</span></div>
        <div className="feed-grid-meta"><p className="feed-grid-title">{video.caption || video.original_filename || 'Video không tiêu đề'}</p><div className="feed-grid-sub"><span className="feed-grid-user">@{authorName}</span>{video.like_count!==undefined&&<span className="feed-grid-likes"><Icon name="heart" size={12}/>{video.like_count}</span>}</div>{video.matched_labels?.length>0&&<div className="feed-grid-labels">{video.matched_labels.map((label)=><span key={label}>#{label}</span>)}</div>}</div>
      </article>
    })}
  </div>{error&&<p className="feed-grid-inline-error">{error}</p>}{hasMore&&<div className="feed-grid-more"><button type="button" className="button ghost" onClick={loadMore} disabled={loadingMore}>{loadingMore?'Đang tải…':'Tải thêm video'}</button></div>}</div>
}
