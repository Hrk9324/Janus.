import { useCallback, useEffect, useState } from 'react'

import { ErrorNote, Spinner } from '@/shared/components/Feedback'
import { fetchAdminStats, fetchAdminUsers, fetchAuditLogs, setUserActive, setUserRole } from '@/features/admin/adminApi'
import '@/styles/admin.css'

const METRICS = [
  ['total_users', 'Người dùng'],
  ['total_videos', 'Video'],
  ['pending_videos', 'Video chờ duyệt'],
  ['pending_reports', 'Báo cáo chờ xử lý'],
]

export default function AdminPage() {
  const [stats, setStats] = useState(null)
  const [users, setUsers] = useState([])
  const [logs, setLogs] = useState([])
  const [query, setQuery] = useState('')
  const [tab, setTab] = useState('users')
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState('')
  const [error, setError] = useState('')

  const refresh = useCallback(async (search = '') => {
    setLoading(true)
    setError('')
    try {
      const [summary, userRows, auditRows] = await Promise.all([
        fetchAdminStats(), fetchAdminUsers(search), fetchAuditLogs(),
      ])
      setStats(summary.summary || {})
      setUsers(userRows || [])
      setLogs(auditRows || [])
    } catch (requestError) {
      setError(requestError.detail || requestError.message || 'Không tải được dữ liệu quản trị.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { refresh('') }, [refresh])

  async function updateUser(user, patch) {
    setBusy(user.id)
    setError('')
    try {
      if ('is_active' in patch) await setUserActive(user.id, patch.is_active)
      if ('role' in patch) await setUserRole(user.id, patch.role)
      await refresh()
    } catch (requestError) {
      setError(requestError.detail || requestError.message || 'Không cập nhật được tài khoản.')
    } finally {
      setBusy('')
    }
  }

  function submitSearch(event) {
    event.preventDefault()
    refresh(query)
  }

  return <div className="page admin-page">
    <div className="page-head"><div><span className="overline">QUẢN TRỊ JANUS</span><h1>Tổng quan hệ thống</h1><p className="page-sub">Theo dõi hoạt động và quản lý tài khoản.</p></div><button type="button" className="button ghost" onClick={()=>refresh()} disabled={loading}>Làm mới</button></div>
    <ErrorNote>{error}</ErrorNote>
    {loading&&!stats ? <Spinner label="Đang tải dữ liệu quản trị"/> : <>
      <div className="admin-metrics">{METRICS.map(([key,label])=><article className="admin-metric" key={key}><span>{label}</span><strong>{Number(stats?.[key]||0).toLocaleString('vi-VN')}</strong></article>)}</div>
      <div className="admin-tabs" role="tablist"><button className={tab==='users'?'active':''} onClick={()=>setTab('users')}>Người dùng <span>{users.length}</span></button><button className={tab==='logs'?'active':''} onClick={()=>setTab('logs')}>Nhật ký kiểm duyệt <span>{logs.length}</span></button></div>
      {tab==='users'?<section className="admin-panel"><div className="admin-panel-head"><div><h2>Danh sách tài khoản</h2><p>Tìm, đổi vai trò hoặc khóa tài khoản.</p></div><form className="admin-search" onSubmit={submitSearch}><input value={query} onChange={event=>setQuery(event.target.value)} placeholder="Tìm theo tên hoặc email"/><button className="button primary" type="submit">Tìm</button></form></div>
        {loading?<Spinner label="Đang tải tài khoản"/>:<div className="admin-table-wrap"><table className="admin-table"><thead><tr><th>Tài khoản</th><th>Vai trò</th><th>Trạng thái</th><th>Thao tác</th></tr></thead><tbody>{users.map(user=><tr key={user.id}><td><strong>{user.display_name}</strong><small>{user.email}</small></td><td><select value={user.role} disabled={busy===user.id} onChange={event=>updateUser(user,{role:event.target.value})}><option value="user">User</option><option value="moderator">Moderator</option><option value="admin">Admin</option></select></td><td><span className={`admin-status ${user.is_active?'active':'inactive'}`}>{user.is_active?'Đang hoạt động':'Đã khóa'}</span></td><td><button className="admin-action" disabled={busy===user.id} onClick={()=>updateUser(user,{is_active:!user.is_active})}>{user.is_active?'Khóa':'Mở khóa'}</button></td></tr>)}</tbody></table>{users.length===0&&<p className="admin-empty">Không tìm thấy tài khoản phù hợp.</p>}</div>}
      </section>:<section className="admin-panel"><div className="admin-panel-head"><div><h2>Hoạt động kiểm duyệt gần đây</h2><p>Nhật ký quyết định do Moderator thực hiện.</p></div></div><div className="admin-audit-list">{logs.map(log=><article key={log.id}><div><strong>{log.action||'Quyết định kiểm duyệt'}</strong><span>{log.video_caption||`Video ${log.video_id}`}</span></div><div><strong>{log.moderator_name||'Moderator'}</strong><span>{log.reason||'Không có ghi chú'}</span></div><time>{new Date(log.created_at).toLocaleString('vi-VN')}</time></article>)}{logs.length===0&&<p className="admin-empty">Chưa có nhật ký kiểm duyệt.</p>}</div></section>}
    </>}
  </div>
}
