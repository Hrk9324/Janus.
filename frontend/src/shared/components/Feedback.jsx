import Icon from './Icon'

/** Modal dùng chung cho các hộp thoại nhỏ (báo cáo, xác nhận). */
export function Modal({ title, onClose, children }) {
  return (
    <div className="modal-backdrop" role="presentation" onClick={onClose}>
      <div
        className="modal"
        role="dialog"
        aria-modal="true"
        aria-label={title}
        onClick={(event) => event.stopPropagation()}
      >
        <div className="modal-head">
          <h2>{title}</h2>
          <button type="button" className="icon-button" onClick={onClose} aria-label="Đóng">
            <Icon name="x" size={16} />
          </button>
        </div>
        {children}
      </div>
    </div>
  )
}

export function Spinner({ label = 'Đang tải' }) {
  return (
    <span className="spinner" role="status" aria-label={label}>
      <i />
    </span>
  )
}

export function EmptyState({ icon = 'film', title, hint, action }) {
  return (
    <div className="empty-state">
      <span className="empty-icon">
        <Icon name={icon} size={22} />
      </span>
      <p className="empty-title">{title}</p>
      {hint && <p className="empty-hint">{hint}</p>}
      {action}
    </div>
  )
}

export function StatusBadge({ status, label }) {
  const tone =
    status === 'published'
      ? 'ok'
<<<<<<< HEAD
      : status === 'pending_review' || status === 'processing'
=======
      : status === 'pending_review' || status === 'processing' || status === 'pending'
>>>>>>> 0dcf2c46a0f557080b0fcca8ac5384151d871ffd
        ? 'warn'
        : status === 'rejected' || status === 'failed'
          ? 'danger'
          : 'neutral'
<<<<<<< HEAD
  return <span className={`badge badge-${tone}`}>{label || status}</span>
=======

  const displayLabel =
    label ||
    (status === 'published'
      ? 'Đã phát'
      : status === 'pending_review' || status === 'pending'
        ? 'Chờ duyệt'
        : status === 'processing'
          ? 'Đang xử lý'
          : status === 'rejected'
            ? 'Bị từ chối'
            : status === 'failed'
              ? 'Lỗi'
              : status)

  return <span className={`badge badge-${tone}`}>{displayLabel}</span>
>>>>>>> 0dcf2c46a0f557080b0fcca8ac5384151d871ffd
}

export function ErrorNote({ children }) {
  if (!children) return null
  return (
    <p className="error-note" role="alert">
      {children}
    </p>
  )
}
