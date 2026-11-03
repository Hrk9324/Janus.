<<<<<<< HEAD
=======
import secrets
>>>>>>> 0dcf2c46a0f557080b0fcca8ac5384151d871ffd
from datetime import datetime
from typing import TYPE_CHECKING
from uuid import UUID, uuid4

from sqlalchemy import Boolean, DateTime, String, UniqueConstraint
from sqlalchemy import Enum as SqlEnum
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base, utcnow
from app.models.enums import UserRole

<<<<<<< HEAD
if TYPE_CHECKING:
=======

def generate_discriminator() -> str:
    return f"{secrets.randbelow(9999) + 1:04d}"


if TYPE_CHECKING:
    from app.models.auth import PasswordResetToken, RefreshToken, RevokedToken
    from app.models.moderation import Appeal
>>>>>>> 0dcf2c46a0f557080b0fcca8ac5384151d871ffd
    from app.models.video import Video


class User(Base):
    __tablename__ = "users"
    __table_args__ = (
        UniqueConstraint(
            "display_name",
            "discriminator",
            name="uq_users_display_name_discriminator",
        ),
    )

    id: Mapped[UUID] = mapped_column(primary_key=True, default=uuid4)
    email: Mapped[str] = mapped_column(String(320), unique=True, index=True)
    display_name: Mapped[str] = mapped_column(String(120))
<<<<<<< HEAD
    discriminator: Mapped[str] = mapped_column(String(4), nullable=False, index=True)
=======
    discriminator: Mapped[str] = mapped_column(
        String(4), default=generate_discriminator, nullable=False, index=True
    )
>>>>>>> 0dcf2c46a0f557080b0fcca8ac5384151d871ffd
    bio: Mapped[str | None] = mapped_column(String(500), nullable=True)
    avatar_url: Mapped[str | None] = mapped_column(String(2048), nullable=True)
    password_hash: Mapped[str] = mapped_column(String(255))
    role: Mapped[UserRole] = mapped_column(SqlEnum(UserRole), default=UserRole.user, nullable=False)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow, nullable=False)

    videos: Mapped[list["Video"]] = relationship(back_populates="owner")
<<<<<<< HEAD
=======
    appeals: Mapped[list["Appeal"]] = relationship(foreign_keys="[Appeal.user_id]", back_populates="user")
    refresh_tokens: Mapped[list["RefreshToken"]] = relationship(
        back_populates="user", cascade="all, delete-orphan"
    )
    revoked_tokens: Mapped[list["RevokedToken"]] = relationship(
        back_populates="user", cascade="all, delete-orphan"
    )
    password_reset_tokens: Mapped[list["PasswordResetToken"]] = relationship(
        back_populates="user", cascade="all, delete-orphan"
    )
>>>>>>> 0dcf2c46a0f557080b0fcca8ac5384151d871ffd
