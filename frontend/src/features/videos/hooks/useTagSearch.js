import { useCallback, useEffect, useState } from 'react'
import { searchVideosByTag } from '../api/videosApi'

/**
 * Custom hook quản lý tìm kiếm video theo tag/nhãn dạng lưới kèm phân trang cursor (UC009).
 * Cung cấp state và hàm loadMore để UI component chỉ việc sử dụng.
 */
export function useTagSearch(initialTag = '') {
  const [tag, setTag] = useState(initialTag)
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(false)
  const [loadingMore, setLoadingMore] = useState(false)
  const [error, setError] = useState('')
  const [hasMore, setHasMore] = useState(false)
  const [nextCursor, setNextCursor] = useState(null)

  const activeTag = tag ? tag.trim().replace(/^#/, '') : ''

  const search = useCallback(async (searchTag) => {
    const cleanTag = searchTag ? searchTag.trim().replace(/^#/, '') : ''
    if (!cleanTag) {
      setItems([])
      setHasMore(false)
      setNextCursor(null)
      setError('')
      return
    }

    setLoading(true)
    setError('')
    try {
      const response = await searchVideosByTag(cleanTag, { limit: 12 })
      setItems(response?.items || [])
      setHasMore(Boolean(response?.has_more))
      setNextCursor(response?.next_cursor || null)
    } catch (requestError) {
      setError(requestError.detail || requestError.message || 'Không tìm thấy video phù hợp.')
      setItems([])
      setHasMore(false)
      setNextCursor(null)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (activeTag) {
      search(activeTag)
    }
  }, [activeTag, search])

  const loadMore = useCallback(async () => {
    if (!activeTag || !hasMore || !nextCursor || loadingMore) return

    setLoadingMore(true)
    try {
      const response = await searchVideosByTag(activeTag, { limit: 12, cursor: nextCursor })
      if (response?.items?.length) {
        setItems((current) => [...current, ...response.items])
      }
      setHasMore(Boolean(response?.has_more))
      setNextCursor(response?.next_cursor || null)
    } catch (requestError) {
      console.error('Lỗi tải thêm video theo tag:', requestError)
    } finally {
      setLoadingMore(false)
    }
  }, [activeTag, hasMore, nextCursor, loadingMore])

  return {
    tag,
    setTag,
    items,
    loading,
    loadingMore,
    error,
    hasMore,
    loadMore,
    refresh: () => search(activeTag),
  }
}
