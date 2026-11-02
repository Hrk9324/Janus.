import { useCallback, useEffect, useRef, useState } from 'react'

import { fetchFeed } from '../api/videosApi'

/**
 * Thuật toán Fisher-Yates để xáo trộn danh sách ngẫu nhiên không thiên lệch.
 */
function shuffleArray(array) {
  const result = [...array]
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[result[i], result[j]] = [result[j], result[i]]
  }
  return result
}

/**
 * Hook quản lý nạp feed video:
 * - First load: Nạp trước 2-3 video (limit=3).
 * - Phân trang cursor: Khi gần tới cuối feed (activeIndex >= videos.length - 2), nạp tiếp 2 video (limit=2).
 * - Infinite Loop / Shuffle: Khi backend hết video (has_more=false), tự động xáo trộn pool video
 *   và nối tiếp vào feed với key duy nhất (`${id}-loop-${loopCount}`) giúp người dùng cuộn mãi mãi.
 */
export function useFeed(activeIndex = 0) {
  const [videos, setVideos] = useState([])
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [error, setError] = useState('')

  // Bộ đệm lưu trữ danh sách các video duy nhất đã nạp từ backend
  const poolRef = useRef([])
  const hasMoreRef = useRef(true)
  const nextCursorRef = useRef(null)
  const loopCountRef = useRef(0)
  const isFetchingRef = useRef(false)

  // Khởi tạo hoặc tải lại feed từ đầu
  const refresh = useCallback(async () => {
    setError('')
    setLoading(true)
    isFetchingRef.current = true
    loopCountRef.current = 0
    try {
      const res = await fetchFeed({ limit: 3 })
      const items = res?.items || (Array.isArray(res) ? res : [])
      poolRef.current = [...items]
      hasMoreRef.current = Boolean(res?.has_more && res?.next_cursor)
      nextCursorRef.current = res?.next_cursor || null

      const initialVideos = items.map((item, idx) => ({
        ...item,
        _loopKey: `${item.id}-init-${idx}`,
      }))
      setVideos(initialVideos)
    } catch (requestError) {
      setError(requestError.detail || requestError.message || 'Không thể tải feed video.')
      setVideos([])
      poolRef.current = []
    } finally {
      setLoading(false)
      isFetchingRef.current = false
    }
  }, [])

  // Nạp thêm video: ưu tiên cursor pagination từ backend; khi hết video thì shuffle pool
  const loadMore = useCallback(async () => {
    if (isFetchingRef.current) return
    if (poolRef.current.length === 0) return

    // 1. Nếu Backend vẫn còn video mới
    if (hasMoreRef.current && nextCursorRef.current) {
      isFetchingRef.current = true
      setLoadingMore(true)
      try {
        const res = await fetchFeed({ limit: 2, cursor: nextCursorRef.current })
        const newItems = res?.items || []
        hasMoreRef.current = Boolean(res?.has_more && res?.next_cursor)
        nextCursorRef.current = res?.next_cursor || null

        if (newItems.length > 0) {
          newItems.forEach((item) => {
            if (!poolRef.current.some((p) => p.id === item.id)) {
              poolRef.current.push(item)
            }
          })
          const loopCount = loopCountRef.current
          const mapped = newItems.map((item, idx) => ({
            ...item,
            _loopKey: `${item.id}-page-${loopCount}-${idx}`,
          }))
          setVideos((prev) => [...prev, ...mapped])
          return
        }
      } catch {
        // Lỗi kết nối khi nạp tiếp -> tạm chuyển sang chế độ xoay vòng pool
        hasMoreRef.current = false
      } finally {
        isFetchingRef.current = false
        setLoadingMore(false)
      }
    }

    // 2. Khi Backend đã hết video (has_more: false) -> Cơ chế Infinite Shuffle Loop
    if (poolRef.current.length > 0) {
      isFetchingRef.current = true
      loopCountRef.current += 1
      const loopCount = loopCountRef.current

      let batch = shuffleArray(poolRef.current)
      // Nếu số lượng video trong pool quá ít (< 3), nhân bản để đảm bảo chiều dài cuộn mượt mà
      if (batch.length > 0 && batch.length < 3) {
        const multiplier = Math.ceil(3 / batch.length)
        const expanded = []
        for (let m = 0; m < multiplier; m++) {
          expanded.push(...batch)
        }
        batch = expanded
      }

      setVideos((prev) => {
        const lastVideo = prev[prev.length - 1]
        // Tránh video đầu tiên của batch mới trùng khớp ngay lập tức với video vừa xem cuối cùng
        if (batch.length > 1 && lastVideo && batch[0].id === lastVideo.id) {
          const swapIdx = batch.length - 1
          ;[batch[0], batch[swapIdx]] = [batch[swapIdx], batch[0]]
        }
        const looped = batch.map((item, idx) => ({
          ...item,
          _loopKey: `${item.id}-loop-${loopCount}-${idx}`,
        }))
        return [...prev, ...looped]
      })

      isFetchingRef.current = false
    }
  }, [])

  useEffect(() => {
    refresh()
  }, [refresh])

  // Tự động kích hoạt loadMore khi người dùng cuộn gần tới cuối danh sách (còn 1-2 video)
  useEffect(() => {
    if (loading || videos.length === 0) return
    if (activeIndex >= videos.length - 2) {
      loadMore()
    }
  }, [activeIndex, videos.length, loading, loadMore])

  return {
    videos,
    loading,
    loadingMore,
    error,
    refresh,
    loadMore,
  }
}
