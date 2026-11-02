"""Nghiệp vụ quản trị người dùng, nhãn nội dung, video và thống kê."""

from datetime import UTC, datetime, timedelta
from uuid import UUID

from sqlalchemy import distinct, func, select
from sqlalchemy.orm import Session

from app.exceptions import (
    ConflictError,
    ForbiddenError,
    InvalidInputError,
    NotFoundError,
)
from app.models import (
    AIJob,
    Appeal,
    AppealStatus,
    JobStatus,
    Label,
    ModerationAction,
    ModerationReview,
    Report,
    ReportStatus,
    User,
    UserRole,
    Video,
    VideoLabel,
    VideoStatus,
)


def list_users(db: Session, search: str | None = None) -> list[User]:
    query = select(User).order_by(User.created_at.desc())
    if search:
        pattern = f"%{search.strip()}%"
        query = query.where(User.display_name.ilike(pattern) | User.email.ilike(pattern))
    return list(db.scalars(query))


def get_user(db: Session, user_id: UUID) -> User:
    user = db.get(User, user_id)
    if user is None:
        raise NotFoundError("Không tìm thấy người dùng")
    return user


def list_moderators(db: Session) -> list[User]:
    return list(
        db.scalars(
            select(User)
            .where(User.role.in_((UserRole.moderator, UserRole.admin)))
            .order_by(User.created_at.desc())
        )
    )


def update_user_status(db: Session, user_id: UUID, actor: User, is_active: bool) -> User:
    target = get_user(db, user_id)
    if target.id == actor.id and not is_active:
        raise ForbiddenError("Không thể tự khóa tài khoản admin hiện tại")
    target.is_active = is_active
    db.commit()
    db.refresh(target)
    return target


def update_user_role(db: Session, user_id: UUID, actor: User, role: UserRole) -> User:
    target = get_user(db, user_id)
    if target.id == actor.id and role != UserRole.admin:
        raise ForbiddenError("Không thể tự thu hồi quyền admin hiện tại")
    target.role = role
    db.commit()
    db.refresh(target)
    return target


def create_label(db: Session, name: str) -> dict:
    clean_name = name.strip()
    existing = db.scalar(select(Label).where(Label.name.ilike(clean_name)))
    if existing is not None:
        raise ConflictError("Nhãn đã tồn tại")
    label = Label(name=clean_name, is_active=True)
    db.add(label)
    db.commit()
    db.refresh(label)
    return {
        "id": label.id,
        "name": label.name,
        "is_active": label.is_active,
        "video_count": 0,
    }


def list_labels(db: Session) -> list[dict]:
    rows = db.execute(
        select(Label, func.count(distinct(VideoLabel.video_id)))
        .outerjoin(VideoLabel, VideoLabel.label_id == Label.id)
        .group_by(Label.id)
        .order_by(Label.name)
    ).all()
    return [
        {
            "id": label.id,
            "name": label.name,
            "is_active": label.is_active,
            "video_count": count,
        }
        for label, count in rows
    ]


def update_label(
    db: Session, label_id: UUID, name: str | None, is_active: bool | None
) -> dict:
    label = db.get(Label, label_id)
    if label is None:
        raise NotFoundError("Không tìm thấy nhãn")
    if name is not None:
        clean_name = name.strip()
        dup = db.scalar(
            select(Label).where(Label.name.ilike(clean_name), Label.id != label_id)
        )
        if dup is not None:
            raise ConflictError("Tên nhãn đã tồn tại")
        label.name = clean_name
    if is_active is not None:
        label.is_active = is_active
    db.commit()
    db.refresh(label)
    count = (
        db.scalar(
            select(func.count(distinct(VideoLabel.video_id))).where(
                VideoLabel.label_id == label.id
            )
        )
        or 0
    )
    return {
        "id": label.id,
        "name": label.name,
        "is_active": label.is_active,
        "video_count": count,
    }


def update_video_status(
    db: Session, video_id: UUID, actor: User, status: str, reason: str | None
) -> Video:
    video = db.get(Video, video_id)
    if video is None or video.is_deleted or video.status == VideoStatus.deleted:
        raise NotFoundError("Không tìm thấy video")
    if status == VideoStatus.deleted.value:
        video.is_deleted = True
        video.status = VideoStatus.deleted
    else:
        video.status = VideoStatus(status)

    action = (
        ModerationAction.reject
        if status == VideoStatus.rejected.value
        else (ModerationAction.approve if status == VideoStatus.published.value else None)
    )
    db.add(
        ModerationReview(
            video_id=video.id,
            moderator_id=actor.id,
            action=action,
            reason=reason or f"Admin update to {status}",
        )
    )
    db.commit()
    db.refresh(video)
    return video


def get_system_stats(db: Session, days: int) -> dict:
    cutoff = datetime.now(UTC) - timedelta(days=days)

    videos_by_status = {s.value: 0 for s in VideoStatus}
    for st, count in db.execute(
        select(Video.status, func.count(Video.id))
        .where(Video.created_at >= cutoff)
        .group_by(Video.status)
    ).all():
        videos_by_status[st.value] = count

    reports_by_status = {r.value: 0 for r in ReportStatus}
    for st, count in db.execute(
        select(Report.status, func.count(Report.id))
        .where(Report.created_at >= cutoff)
        .group_by(Report.status)
    ).all():
        reports_by_status[st.value] = count

    appeals_by_status = {a.value: 0 for a in AppealStatus}
    for st, count in db.execute(
        select(Appeal.status, func.count(Appeal.id))
        .where(Appeal.created_at >= cutoff)
        .group_by(Appeal.status)
    ).all():
        appeals_by_status[st.value] = count

    jobs_by_status = {j.value: 0 for j in JobStatus}
    for st, count in db.execute(
        select(AIJob.status, func.count(AIJob.id))
        .where(AIJob.created_at >= cutoff)
        .group_by(AIJob.status)
    ).all():
        jobs_by_status[st.value] = count

    # Moderator workload trong khoảng thời gian
    moderators = list(
        db.scalars(
            select(User).where(User.role.in_((UserRole.moderator, UserRole.admin)))
        )
    )
    workload = []
    for mod in moderators:
        reviews_count = (
            db.scalar(
                select(func.count(ModerationReview.id)).where(
                    ModerationReview.moderator_id == mod.id,
                    ModerationReview.created_at >= cutoff,
                )
            )
            or 0
        )
        appeals_count = (
            db.scalar(
                select(func.count(Appeal.id)).where(
                    Appeal.moderator_id == mod.id,
                    Appeal.decided_at >= cutoff,
                )
            )
            or 0
        )
        if reviews_count > 0 or appeals_count > 0:
            workload.append(
                {
                    "moderator_id": mod.id,
                    "moderator_name": mod.display_name,
                    "reviews_count": reviews_count,
                    "appeals_count": appeals_count,
                }
            )

    return {
        "days": days,
        "videos_by_status": videos_by_status,
        "reports_by_status": reports_by_status,
        "appeals_by_status": appeals_by_status,
        "jobs_by_status": jobs_by_status,
        "moderator_workload": workload,
    }


def get_moderator_stats(db: Session, moderator_id: UUID) -> dict:
    user = db.get(User, moderator_id)
    if user is None:
        raise NotFoundError("Không tìm thấy người dùng")
    if user.role not in {UserRole.moderator, UserRole.admin}:
        raise InvalidInputError("Người dùng không phải là kiểm duyệt viên hoặc quản trị viên")

    reviews_count = (
        db.scalar(
            select(func.count(ModerationReview.id)).where(
                ModerationReview.moderator_id == moderator_id
            )
        )
        or 0
    )
    appeals_count = (
        db.scalar(
            select(func.count(Appeal.id)).where(
                Appeal.moderator_id == moderator_id,
                Appeal.status != AppealStatus.open,
            )
        )
        or 0
    )
    return {
        "moderator_id": user.id,
        "role": user.role.value,
        "videos_reviewed": reviews_count,
        "appeals_handled": appeals_count,
    }
