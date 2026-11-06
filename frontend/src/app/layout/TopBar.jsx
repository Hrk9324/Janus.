import { Link, useLocation } from 'react-router-dom'

import Icon from '@/shared/components/Icon'
import { useAuth } from '@/features/auth/AuthContext'

const TITLES = {
  '/': 'Dành cho bạn',
  '/upload': 'Tải video',
  '/profile': 'Hồ sơ của bạn',
  '/bookmarks': 'Video đã lưu',
  '/admin': 'Quản trị hệ thống',
  '/moderation': 'Hàng đợi kiểm duyệt',
  '/edit-video': 'Chỉnh sửa video',
}

export default function TopBar() {
  const { pathname } = useLocation()
  const { user, isAuthenticated } = useAuth()
  const roleLabel = user?.role === 'moderator' ? 'Kiểm duyệt viên' : user?.role === 'admin' ? 'Quản trị viên' : null

  return (
    <header className="topbar">
      <div className="topbar-title">
        <span className="crumb">Janus</span>
        <span className="crumb-sep">/</span>
        <strong>{TITLES[pathname] || 'Trang'}</strong>
      </div>

      <div className="topbar-actions">
        {isAuthenticated && roleLabel && (
          <span className="role-pill" title="Vai trò hiện tại">
            <i />
            {roleLabel}
          </span>
        )}
        {isAuthenticated ? (
          <Link to="/profile" className="avatar" aria-label="Hồ sơ">
            {user.avatar_url ? <img src={user.avatar_url} alt="" /> : user.display_name.slice(0, 2).toUpperCase()}
          </Link>
        ) : (
          <Link to="/login" className="button ghost">
            Đăng nhập
          </Link>
        )}
      </div>
    </header>
  )
}
