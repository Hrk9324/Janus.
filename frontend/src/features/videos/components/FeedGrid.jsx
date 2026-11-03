import { useFeed } from '../hooks/useFeed'
import { useTagSearch } from '../hooks/useTagSearch'
import Icon from '@/shared/components/Icon'

export default function FeedGrid({ activeTag = '' }) {
  const tagSearch = useTagSearch(activeTag)
  const defaultFeed = useFeed()

  const { videos, loading, error, refresh, hasMore, loadMore, loadingMore } = activeTag
    ? {
        videos: tagSearch.items,
        loading: tagSearch.loading,
        loadingMore: tagSearch.loadingMore,
        error: tagSearch.error,
        refresh: () => tagSearch.search(activeTag),
        hasMore: tagSearch.hasMore,
        loadMore: tagSearch.loadMore,
      }
    : defaultFeed

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
    <div className="feed-grid-wrapper">
      <div className="feed-grid">
        {videos.map((video) => {
          const authorName = video.author?.username || video.owner_name || video.username || 'janus'
          return (
            <article key={video._loopKey || video.id} className="feed-grid-card">
              <div className="feed-grid-thumb">
                {video.thumbnail_url ? (
                  <img src={video.thumbnail_url} alt={video.caption || 'Video'} loading="lazy" />
                ) : (
                  <div className="feed-grid-placeholder" />
                )}
                <div className="feed-grid-play">
                  <Icon name="play" size={14} />
                </div>
              </div>
              <div className="feed-grid-meta">
                <p className="feed-grid-title">{video.caption || video.original_filename || 'Video không tiêu đề'}</p>
                <div className="feed-grid-sub" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span className="feed-grid-user">@{authorName}</span>
                  {video.like_count !== undefined && (
                    <span className="feed-grid-likes" style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px', color: '#999' }}>
                      <Icon name="heart" size={11} /> {video.like_count}
                    </span>
                  )}
                </div>
              </div>
            </article>
          )
        })}
      </div>
      {activeTag && hasMore && (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '16px' }}>
          <button type="button" className="button ghost" onClick={loadMore} disabled={loadingMore}>
            {loadingMore ? 'Đang tải thêm...' : 'Tải thêm video'}
          </button>
        </div>
      )}
    </div>
  )
}
