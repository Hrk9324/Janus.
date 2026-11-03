from datetime import datetime
from typing import TYPE_CHECKING
from uuid import UUID, uuid4

from sqlalchemy import DateTime, ForeignKey, Index, Text, UniqueConstraint, text
from sqlalchemy import Enum as SqlEnum
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base, utcnow
from app.models.enums import AppealStatus, ModerationAction, ReportStatus
from app.models.video import Video

if TYPE_CHECKING:
    from app.models.user import User


class ModerationReview(Base):
    __tablename__ = "moderation_reviews"

    id: Mapped[UUID] = mapped_column(primary_key=True, default=uuid4)
    video_id: Mapped[UUID] = mapped_column(ForeignKey("videos.id"), index=True)
    moderator_id: Mapped[UUID | None] = mapped_column(ForeignKey("users.id"), nullable=True)
    action: Mapped[ModerationAction | None] = mapped_column(SqlEnum(ModerationAction), nullable=True)
    reason: Mapped[str | None] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow, nullable=False)

    video: Mapped[Video] = relationship(back_populates="moderation_reviews")
    moderator: Mapped["User | None"] = relationship(foreign_keys=[moderator_id])


class Report(Base):
    __tablename__ = "reports"
    __table_args__ = (UniqueConstraint("video_id", "reporter_id", name="uq_video_reporter"),)

    id: Mapped[UUID] = mapped_column(primary_key=True, default=uuid4)
    video_id: Mapped[UUID] = mapped_column(ForeignKey("videos.id"), index=True)
    reporter_id: Mapped[UUID] = mapped_column(ForeignKey("users.id"), index=True)
    reason: Mapped[str] = mapped_column(Text)
    status: Mapped[ReportStatus] = mapped_column(SqlEnum(ReportStatus), default=ReportStatus.open)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow, nullable=False)

    video: Mapped[Video] = relationship(back_populates="reports")

    @property
    def video_caption(self) -> str | None:
        """Mô tả (hoặc tên tệp) của video bị báo cáo, để moderator nhận ra video trong hàng đợi."""
        if self.video is None:
            return None
        return self.video.caption or self.video.original_filename


class Appeal(Base):
    __tablename__ = "appeals"
    __table_args__ = (
        Index(
            "uq_appeal_open",
            "video_id",
            "user_id",
            unique=True,
            postgresql_where=text("status = 'open'"),
            sqlite_where=text("status = 'open'"),
        ),
    )

    id: Mapped[UUID] = mapped_column(primary_key=True, default=uuid4)
    video_id: Mapped[UUID] = mapped_column(ForeignKey("videos.id"), index=True, nullable=False)
    user_id: Mapped[UUID] = mapped_column(ForeignKey("users.id"), index=True, nullable=False)
    reason: Mapped[str] = mapped_column(Text, nullable=False)
    status: Mapped[AppealStatus] = mapped_column(
        SqlEnum(AppealStatus), default=AppealStatus.open, index=True, nullable=False
    )
    moderator_id: Mapped[UUID | None] = mapped_column(ForeignKey("users.id"), nullable=True)
    decision_reason: Mapped[str | None] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow, nullable=False)
    decided_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)

    video: Mapped[Video] = relationship(back_populates="appeals")
    user: Mapped["User"] = relationship(foreign_keys=[user_id], back_populates="appeals")
    moderator: Mapped["User | None"] = relationship(foreign_keys=[moderator_id])

    @property
    def user_display_name(self) -> str | None:
        return self.user.display_name if self.user else None
