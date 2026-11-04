import { useCallback, useEffect, useState } from 'react'

import { ErrorNote, Spinner } from '@/shared/components/Feedback'
import {
  createAdminLabel,
  fetchAdminLabels,
  fetchAdminStats,
  fetchAdminUsers,
  setUserActive,
  setUserRole,
  updateAdminLabel,
} from '@/features/admin/adminApi'
import '@/styles/admin.css'

const TABS = [
  { id: 'overview', label: 'Thống kê' },
  { id: 'users', label: 'Quản trị tài khoản' },
  { id: 'labels', label: 'Quản trị nhãn' },
]

const METRICS = [
  ['total_users', 'Người dùng'],
  ['total_videos', 'Video trên hệ thống'],
  ['pending_videos', 'Video chờ duyệt'],
  ['pending_reports', 'Báo cáo đang chờ'],
]

function Breakdown({ title, values = {} }) {
  const entries = Object.entries(values)
  const max = Math.max(1, ...entries.map(([, count]) => Number(count) || 0))
  return <section className="admin-breakdown"><h3>{title}</h3>{entries.length ? entries.map(([name, count]) => <div className="breakdown-row" key={name}><div><span>{name.replaceAll('_', ' ')}</span><strong>{count}</strong></div><i><b style={{ width: `${(Number(count || 0) / max) * 100}%` }}/></i></div>) : <p className="admin-empty">Chưa có số liệu.</p>}</section>
}

export default function AdminPage() {
  const [stats, setStats] = useState(null)
  const [users, setUsers] = useState([])
  const [labels, setLabels] = useState([])
  const [query, setQuery] = useState('')
  const [newLabel, setNewLabel] = useState('')
  const [tab, setTab] = useState('overview')
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState('')
  const [error, setError] = useState('')

  const refresh = useCallback(async (search = '') => {
    setLoading(true)
    setError('')
    try {
      const [summary, userRows, labelRows] = await Promise.all([
        fetchAdminStats(), fetchAdminUsers(search), fetchAdminLabels(),
      ])
      setStats(summary)
      setUsers(userRows || [])
      setLabels(labelRows || [])
    } catch (requestError) {
      setError(requestError.detail || requestError.message || 'Không tải được dữ liệu quản trị.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { refresh() }, [refresh])

  async function updateUser(user, patch) {
    setBusy(user.id)
    setError('')
    try {
      if ('is_active' in patch) await setUserActive(user.id, patch.is_active)
      if ('role' in patch) await setUserRole(user.id, patch.role)
      await refresh(query)
    } catch (requestError) {
      setError(requestError.detail || requestError.message || 'Không cập nhật được tài khoản.')
    } finally {
      setBusy('')
    }
  }

  async function addLabel(event) {
    event.preventDefault()
    if (!newLabel.trim()) return
    setBusy('label')
    setError('')
    try {
      await createAdminLabel(newLabel.trim())
      setNewLabel('')
      await refresh(query)
    } catch (requestError) {
      setError(requestError.detail || requestError.message || 'Không thêm được nhãn.')
    } finally {
      setBusy('')
    }
  }

  async function toggleLabel(label) {
    setBusy(label.id)
    setError('')
    try {
      await updateAdminLabel(label.id, { is_active: !label.is_active })
      await refresh(query)
    } catch (requestError) {
      setError(requestError.detail || requestError.message || 'Không cập nhật được nhãn.')
    } finally {
      setBusy('')
    }
  }

  function searchUsers(event) {
    event.preventDefault()
    refresh(query)
  }

  const summary = stats?.summary || {}

  return <div className="page admin-page">
    <div className="page-head"><div><span className="overline">KHU VỰC QUẢN TRỊ</span><h1>Quản trị Janus</h1><p className="page-sub">Thống kê hệ thống, tài khoản và nhãn nội dung.</p></div><button type="button" className="button ghost" onClick={()=>refresh(query)} disabled={loading}>Làm mới</button></div>
    <ErrorNote>{error}</ErrorNote>
    <div className="admin-tabs" role="tablist">{TABS.map((item)=><button key={item.id} type="button" role="tab" aria-selected={tab===item.id} className={tab===item.id?'active':''} onClick={()=>setTab(item.id)}>{item.label}</button>)}</div>
    {loading&&!stats?<Spinner label="Đang tải dữ liệu quản trị"/>:<>
      {tab==='overview'&&<>
        <div className="admin-metrics">{METRICS.map(([key,label])=><article className="admin-metric" key={key}><span>{label}</span><strong>{Number(summary[key]||0).toLocaleString('vi-VN')}</strong></article>)}</div>
        <div className="admin-breakdown-grid"><Breakdown title="Video theo trạng thái" values={stats?.videos_by_status}/><Breakdown title="Tác vụ AI" values={stats?.jobs_by_status}/><Breakdown title="Báo cáo" values={stats?.reports_by_status}/><Breakdown title="Khiếu nại" values={stats?.appeals_by_status}/></div>
        <section className="admin-panel moderator-workload"><div className="admin-panel-head"><div><h2>Khối lượng kiểm duyệt</h2><p>Số video và khiếu nại moderator đã xử lý.</p></div></div>{stats?.moderator_workload?.length?<div className="admin-table-wrap"><table className="admin-table"><thead><tr><th>Moderator</th><th>Video đã xử lý</th><th>Khiếu nại</th></tr></thead><tbody>{stats.moderator_workload.map((item)=><tr key={item.moderator_id}><td><strong>{item.moderator_name}</strong></td><td>{item.reviews_count}</td><td>{item.appeals_count}</td></tr>)}</tbody></table></div>:<p className="admin-empty">Chưa có hoạt động kiểm duyệt.</p>}</section>
      </>}
      {tab==='users'&&<section className="admin-panel"><div className="admin-panel-head"><div><h2>Tài khoản</h2><p>Tìm tài khoản, phân quyền hoặc thay đổi trạng thái.</p></div><form className="admin-search" onSubmit={searchUsers}><input value={query} onChange={event=>setQuery(event.target.value)} placeholder="Tìm theo tên hoặc email"/><button className="button primary" type="submit">Tìm</button></form></div><div className="admin-table-wrap"><table className="admin-table"><thead><tr><th>Tài khoản</th><th>Vai trò</th><th>Trạng thái</th><th>Thao tác</th></tr></thead><tbody>{users.map(user=><tr key={user.id}><td><strong>{user.display_name}</strong><small>{user.email}</small></td><td><select value={user.role} disabled={busy===user.id} onChange={event=>updateUser(user,{role:event.target.value})}><option value="user">User</option><option value="moderator">Moderator</option><option value="admin">Admin</option></select></td><td><span className={`admin-status ${user.is_active?'active':'inactive'}`}>{user.is_active?'Đang hoạt động':'Đã khóa'}</span></td><td><button className="admin-action" disabled={busy===user.id} onClick={()=>updateUser(user,{is_active:!user.is_active})}>{user.is_active?'Khóa':'Mở khóa'}</button></td></tr>)}</tbody></table>{users.length===0&&<p className="admin-empty">Không tìm thấy tài khoản phù hợp.</p>}</div></section>}
      {tab==='labels'&&<section className="admin-panel"><div className="admin-panel-head"><div><h2>Nhãn nội dung</h2><p>Quản lý nhãn được dùng để phân loại video.</p></div><form className="admin-search" onSubmit={addLabel}><input value={newLabel} onChange={event=>setNewLabel(event.target.value)} maxLength={80} placeholder="Tên nhãn mới"/><button className="button primary" disabled={busy==='label'} type="submit">Thêm nhãn</button></form></div><div className="admin-label-list">{labels.map(label=><article key={label.id}><div><strong>{label.name}</strong><span>{label.video_count} video</span></div><span className={`admin-status ${label.is_active?'active':'inactive'}`}>{label.is_active?'Đang dùng':'Đã tắt'}</span><button className="admin-action" disabled={busy===label.id} onClick={()=>toggleLabel(label)}>{label.is_active?'Tắt nhãn':'Bật nhãn'}</button></article>)}{labels.length===0&&<p className="admin-empty">Chưa có nhãn nào.</p>}</div></section>}
    </>}
  </div>
}
