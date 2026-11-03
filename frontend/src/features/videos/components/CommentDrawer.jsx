import { useCallback, useEffect, useState } from 'react'

import Icon from '@/shared/components/Icon'
import { ErrorNote } from '@/shared/components/Feedback'
import { useAuth } from '@/features/auth/AuthContext'
import { createComment, deleteComment, listComments } from '../api/socialApi'

function mapComment(comment) {
  return {
    ...comment,
    user: comment.author?.display_name || comment.author?.email?.split('@')[0] || 'người dùng',
    time: new Date(comment.created_at).toLocaleString('vi-VN', { dateStyle: 'short', timeStyle: 'short' }),
  }
}

export default function CommentDrawer({ video, onClose }) {
  const { user, isAuthenticated } = useAuth()
  const [text, setText] = useState('')
  const [comments, setComments] = useState([])
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [error, setError] = useState('')

  const loadComments = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const page = await listComments(video.id)
      setComments((page.items || []).filter((item) => !item.is_deleted).map(mapComment))
    } catch (requestError) {
      setError(requestError.detail || requestError.message || 'Không tải được bình luận.')
    } finally {
      setLoading(false)
    }
  }, [video.id])

  useEffect(() => { loadComments() }, [loadComments])

  async function handleSubmit(event) {
    event.preventDefault()
    const content = text.trim()
    if (!content || !isAuthenticated || sending) return
    setSending(true)
    setError('')
    try {
      const created = await createComment(video.id, content)
      setComments((current) => [mapComment(created), ...current])
      setText('')
    } catch (requestError) {
      setError(requestError.detail || requestError.message || 'Không gửi được bình luận.')
    } finally {
      setSending(false)
    }
  }

  async function handleDelete(commentId) {
    setError('')
    try {
      await deleteComment(commentId)
      setComments((current) => current.filter((comment) => comment.id !== commentId))
    } catch (requestError) {
      setError(requestError.detail || requestError.message || 'Không xóa được bình luận.')
    }
  }

  return (
    <div className="comment-overlay" onClick={onClose}>
      <div className="comment-drawer" onClick={(event) => event.stopPropagation()}>
        <header className="comment-header"><div className="comment-header-title"><strong>{comments.length} bình luận</strong></div><button type="button" className="comment-close" onClick={onClose} aria-label="Đóng"><Icon name="x" size={18}/></button></header>
        {error && <div className="comment-error"><ErrorNote>{error}</ErrorNote><button type="button" onClick={loadComments}>Thử lại</button></div>}
        <div className="comment-list">
          {loading ? <div className="comment-empty"><p>Đang tải bình luận…</p></div> : comments.length === 0 ? <div className="comment-empty"><p>Chưa có bình luận nào</p><span>Hãy là người đầu tiên bình luận</span></div> : comments.map((comment) => {
            const canDelete = isAuthenticated && (user?.id === comment.author?.id || ['admin', 'moderator'].includes(user?.role))
            return <div key={comment.id} className="comment-item"><div className="comment-avatar">{comment.user.slice(0, 2).toUpperCase()}</div><div className="comment-body"><div className="comment-meta"><span className="comment-user">@{comment.user}</span><span className="comment-time">{comment.time}</span>{canDelete&&<button type="button" className="comment-delete" onClick={()=>handleDelete(comment.id)}>Xóa</button>}</div><p className="comment-text">{comment.content}</p></div></div>
          })}
        </div>
        <form className="comment-form" onSubmit={handleSubmit}><input value={text} onChange={(event)=>setText(event.target.value)} placeholder={isAuthenticated?'Thêm bình luận…':'Đăng nhập để bình luận…'} className="comment-input" disabled={!isAuthenticated||sending}/><button type="submit" className="comment-send" disabled={!isAuthenticated||!text.trim()||sending}>{sending?'Đang gửi…':'Gửi'}</button></form>
      </div>
    </div>
  )
}
