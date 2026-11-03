"""Quản lý ghi nhận lượt xem video (view count) với cơ chế cooldown."""

import time
from threading import Lock
from uuid import UUID

from sqlalchemy import func, select, update
from sqlalchemy.orm import Session

from app.exceptions import NotFoundError
from app.models import Video

# Tham số nghiệp vụ
MIN_WATCH_DURATION_SECONDS: int = 5  # Thời gian xem tối thiểu (5 giây liên tục)
VIEW_COOLDOWN_SECONDS: int = 300  # Thời gian hồi chiêu (5 phút / 300 giây)

# Bộ đệm cooldown in-memory: key -> monotonic timestamp
_view_cooldown_cache: dict[str, float] = {}
_cache_lock = Lock()

# Cấu hình dọn dẹp cache chống rò rỉ RAM (Memory Leak Prevention)
_CLEANUP_INTERVAL_SECONDS: float = 60.0
_MAX_CACHE_SIZE: int = 10000
_last_cleanup_timestamp: float = 0.0


def _purge_expired_cooldowns(now: float) -> None:
    """Tự động dọn dẹp các khóa cooldown đã hết hạn (> 300s) khỏi bộ nhớ."""
    global _last_cleanup_timestamp
    if (now - _last_cleanup_timestamp < _CLEANUP_INTERVAL_SECONDS) and (
        len(_view_cooldown_cache) < _MAX_CACHE_SIZE
    ):
        return
    _last_cleanup_timestamp = now
    expired = [
        k
        for k, last_time in _view_cooldown_cache.items()
        if (now - last_time) >= VIEW_COOLDOWN_SECONDS
    ]
    for k in expired:
        _view_cooldown_cache.pop(k, None)


def build_view_cache_key(
    video_id: UUID | str,
    user_id: UUID | str | None,
    client_ip: str | None,
) -> str:
    """Tạo khóa nhận diện theo định dạng: view:{video_id}:{user_id if user_id else client_ip}."""
    actor = str(user_id) if user_id else (client_ip or "unknown")
    return f"view:{video_id}:{actor}"


def record_video_view(
    db: Session,
    *,
    video_id: UUID,
    user_id: UUID | str | None = None,
    client_ip: str | None = None,
) -> dict[str, bool | int | UUID]:
    """
    Ghi nhận lượt xem cho video với cooldown 5 phút (300 giây) cho mỗi User/IP.
    Nếu chưa hết cooldown: counted = False, view_count giữ nguyên.
    Nếu hết cooldown: counted = True, tăng view_count nguyên tử (atomic):
        UPDATE videos SET view_count = view_count + 1 WHERE id = :video_id
    Trả về dict: {"video_id": video_id, "view_count": count, "counted": counted}
    """
    video = db.get(Video, video_id)
    if video is None or video.is_deleted:
        raise NotFoundError("Không tìm thấy video")

    cache_key = build_view_cache_key(video_id, user_id, client_ip)
    now = time.monotonic()

    with _cache_lock:
        _purge_expired_cooldowns(now)
        last_recorded = _view_cooldown_cache.get(cache_key)
        if last_recorded is not None and (now - last_recorded) < VIEW_COOLDOWN_SECONDS:
            counted = False
        else:
            counted = True
            _view_cooldown_cache[cache_key] = now

    if counted:
        db.execute(
            update(Video)
            .where(Video.id == video_id)
            .values(view_count=func.coalesce(Video.view_count, 0) + 1)
        )
        db.commit()
        updated_count = (
            db.scalar(
                select(func.coalesce(Video.view_count, 0)).where(Video.id == video_id)
            )
            or 0
        )
    else:
        db.expire_all()
        latest = db.scalar(
            select(func.coalesce(Video.view_count, 0)).where(Video.id == video_id)
        )
        updated_count = latest if latest is not None else (video.view_count or 0)

    return {
        "video_id": video_id,
        "view_count": updated_count,
        "counted": counted,
    }


def clear_cooldown_cache() -> None:
    """Xóa sạch cache cooldown (dùng cho môi trường test)."""
    global _last_cleanup_timestamp
    with _cache_lock:
        _view_cooldown_cache.clear()
        _last_cleanup_timestamp = 0.0
