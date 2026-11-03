import { useState } from 'react'
import { Link } from 'react-router-dom'

import Icon from '@/shared/components/Icon'
<<<<<<< HEAD
import { ErrorNote } from '@/shared/components/Feedback'
import AiResultPanel from '@/features/videos/components/AiResultPanel'
import UploadDropzone from '@/features/videos/components/UploadDropzone'
import { useVideoUpload } from '@/features/videos/hooks/useVideoUpload'
=======
import { ErrorNote, Spinner } from '@/shared/components/Feedback'
import AiResultPanel from '@/features/videos/components/AiResultPanel'
import UploadDropzone from '@/features/videos/components/UploadDropzone'
import { useVideoUpload } from '@/features/videos/hooks/useVideoUpload'
import { useAiAnalysis } from '@/features/videos/hooks/useAiAnalysis'
>>>>>>> 0dcf2c46a0f557080b0fcca8ac5384151d871ffd

export default function UploadPage() {
  const [file, setFile] = useState(null)
  const [caption, setCaption] = useState('')
<<<<<<< HEAD
  const { status, progress, error, uploadedVideo, upload, reset } = useVideoUpload()
=======
  const { status, progress, error, uploadedVideo, upload, reset: resetUpload } = useVideoUpload()
  const { result: aiResult, loading: aiLoading } = useAiAnalysis(uploadedVideo?.id)
>>>>>>> 0dcf2c46a0f557080b0fcca8ac5384151d871ffd

  const uploading = status === 'uploading'
  const done = status === 'done'

<<<<<<< HEAD
=======
  const isAiDone = aiResult?.job_status === 'succeeded' || aiResult?.job_status === 'failed'
  const isAiAnalyzing = done && !isAiDone
  const currentVideoStatus = aiResult?.video_status || uploadedVideo?.status

>>>>>>> 0dcf2c46a0f557080b0fcca8ac5384151d871ffd
  function selectFile(nextFile) {
    reset()
    setFile(nextFile)
  }

<<<<<<< HEAD
=======
  function reset() {
    resetUpload()
    setFile(null)
    setCaption('')
  }

>>>>>>> 0dcf2c46a0f557080b0fcca8ac5384151d871ffd
  async function submit(event) {
    event.preventDefault()
    if (!file) return
    const captionValue = caption.trim()
    await upload(file, captionValue || null)
  }

  return (
    <div>
<<<<<<< HEAD
    <div className="page">
      <div className="page-head" style={{ alignItems: 'center' }}>
        <h1>Tải video lên</h1>
        <p className="page-sub" style={{ marginTop: 0 }}>
          Chọn file MP4, thêm caption và chờ hệ thống xử lý trước khi xuất bản.
        </p>
      </div>
=======
      <div className="page">
        <div className="page-head" style={{ alignItems: 'center' }}>
          <h1>Tải video lên</h1>
          <p className="page-sub" style={{ marginTop: 0 }}>
            Chọn file MP4, thêm caption và chờ hệ thống xử lý trước khi xuất bản.
          </p>
        </div>
>>>>>>> 0dcf2c46a0f557080b0fcca8ac5384151d871ffd
        <span className="hint-chip">MP4 · tối đa 50 MB</span>
      </div>

      <div className="upload-grid">
        <form className="panel upload-panel" onSubmit={submit}>
          <UploadDropzone file={file} onSelect={selectFile} disabled={uploading} />

          <label className="field" htmlFor="caption">
            <span>
              Mô tả video <em>không bắt buộc</em>
            </span>
            <input
              id="caption"
              className="text-input"
              value={caption}
              maxLength={500}
              onChange={(event) => setCaption(event.target.value)}
              placeholder="Video này nói về điều gì?"
              disabled={uploading}
            />
          </label>

          <ErrorNote>{error}</ErrorNote>

          {uploading && (
            <div className="upload-progress" aria-live="polite">
              <div className="progress-track">
                <i style={{ width: `${progress}%` }} />
              </div>
              <span>Đang tải lên {progress}%</span>
            </div>
          )}

          <div className="panel-actions">
            {done ? (
<<<<<<< HEAD
              <>
                <button type="button" className="button ghost" onClick={reset}>
                  Tải video khác
                </button>
                <Link className="button primary" to="/">
                  Xem ở feed <Icon name="arrow" size={15} />
                </Link>
              </>
=======
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', width: '100%' }}>
                {isAiAnalyzing && (
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '10px 14px',
                      borderRadius: '8px',
                      background: 'rgba(255, 176, 32, 0.12)',
                      color: 'var(--warn)',
                      fontSize: '13px',
                    }}
                  >
                    <Spinner label="Đang phân tích AI" />
                    <span>Hệ thống AI đang phân tích và kiểm duyệt video…</span>
                  </div>
                )}

                {isAiDone && currentVideoStatus === 'rejected' && (
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '12px 14px',
                      borderRadius: '8px',
                      background: 'rgba(255, 92, 92, 0.12)',
                      border: '1px solid rgba(255, 92, 92, 0.3)',
                      color: 'var(--danger)',
                      fontSize: '13.5px',
                      fontWeight: 500,
                    }}
                  >
                    <Icon name="shield" size={17} />
                    <span>Video đã bị từ chối do vi phạm tiêu chuẩn cộng đồng</span>
                  </div>
                )}

                {isAiDone && (currentVideoStatus === 'pending_review' || currentVideoStatus === 'pending') && (
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '12px 14px',
                      borderRadius: '8px',
                      background: 'rgba(255, 176, 32, 0.12)',
                      border: '1px solid rgba(255, 176, 32, 0.3)',
                      color: 'var(--warn)',
                      fontSize: '13.5px',
                      fontWeight: 500,
                    }}
                  >
                    <Icon name="clock" size={17} />
                    <span>Video đang được lưu trữ và chờ kiểm duyệt viên xem xét thủ công</span>
                  </div>
                )}

                <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '4px' }}>
                  <button type="button" className="button ghost" onClick={reset}>
                    Tải video khác
                  </button>

                  {/* Khi đang upload hoặc AI đang phân tích: ẨN hoặc DISABLE nút 'Xem ở feed' */}
                  {isAiAnalyzing && (
                    <button type="button" className="button primary" disabled title="Đang phân tích kiểm duyệt...">
                      <span>Xem ở feed</span>
                      <Icon name="arrow" size={15} />
                    </button>
                  )}

                  {/* KHI ĐÃ CÓ KẾT QUẢ: Chỉ hiển thị nút 'Xem ở feed' khi status === 'published' */}
                  {isAiDone && currentVideoStatus === 'published' && (
                    <Link className="button primary" to="/">
                      Xem ở feed <Icon name="arrow" size={15} />
                    </Link>
                  )}
                </div>
              </div>
>>>>>>> 0dcf2c46a0f557080b0fcca8ac5384151d871ffd
            ) : (
              <button type="submit" className="button primary" disabled={!file || uploading}>
                {uploading ? 'Đang tải lên…' : 'Tải lên và phân tích'}
              </button>
            )}
          </div>
        </form>

        <aside className="panel info-panel">
          <div className="info-title">
            <Icon name="shield" size={17} />
            <h2>Hướng dẫn</h2>
          </div>
          <ul className="info-list">
            <li>Chỉ chấp nhận tệp MP4, tối đa 50MB.</li>
<<<<<<< HEAD
            <li>Video chỉ xuất hiện ở feed sau khi được phê duyệt.</li>
=======
            <li>Video chỉ xuất hiện ở feed sau khi được phê duyệt an toàn.</li>
>>>>>>> 0dcf2c46a0f557080b0fcca8ac5384151d871ffd
          </ul>
        </aside>
      </div>

<<<<<<< HEAD
      {uploadedVideo && <AiResultPanel videoId={uploadedVideo.id} />}
=======
      {uploadedVideo && <AiResultPanel videoId={uploadedVideo.id} result={aiResult} loading={aiLoading} />}
>>>>>>> 0dcf2c46a0f557080b0fcca8ac5384151d871ffd
    </div>
  )
}
