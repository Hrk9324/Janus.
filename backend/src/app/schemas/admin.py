from datetime import datetime
from uuid import UUID

<<<<<<< HEAD
from pydantic import BaseModel, ConfigDict, EmailStr

from app.models.enums import UserRole
=======
from pydantic import (
    BaseModel,
    ConfigDict,
    EmailStr,
    Field,
    field_validator,
    model_validator,
)

from app.models.enums import UserRole, VideoStatus
>>>>>>> 0dcf2c46a0f557080b0fcca8ac5384151d871ffd


class AdminUserSummary(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    display_name: str
<<<<<<< HEAD
=======
    email: EmailStr | None = None
>>>>>>> 0dcf2c46a0f557080b0fcca8ac5384151d871ffd
    role: UserRole
    is_active: bool
    created_at: datetime


class AdminUserDetail(AdminUserSummary):
    email: EmailStr
<<<<<<< HEAD


class AdminUserStatusUpdate(BaseModel):
    is_active: bool
=======
    discriminator: str | None = None
    bio: str | None = None
    avatar_url: str | None = None


class AdminUserStatusUpdate(BaseModel):
    is_active: bool | None = None
    status: str | None = None

    @model_validator(mode="after")
    def validate_status_input(self) -> "AdminUserStatusUpdate":
        if self.is_active is None and self.status is None:
            raise ValueError("Cần cung cấp ít nhất một trường 'is_active' hoặc 'status'")
        if self.status is not None and self.is_active is None:
            s = self.status.strip().lower()
            if s in {"active", "unbanned"}:
                self.is_active = True
            elif s in {"banned", "inactive", "blocked"}:
                self.is_active = False
            else:
                raise ValueError("Trạng thái status không hợp lệ (chấp nhận 'active' hoặc 'banned')")
        return self
>>>>>>> 0dcf2c46a0f557080b0fcca8ac5384151d871ffd


class AdminRoleUpdate(BaseModel):
    role: UserRole
<<<<<<< HEAD
=======


class LabelAdminCreate(BaseModel):
    name: str = Field(..., min_length=1, max_length=80)


class LabelAdminUpdate(BaseModel):
    name: str | None = Field(default=None, min_length=1, max_length=80)
    is_active: bool | None = None

    @model_validator(mode="after")
    def check_at_least_one(self) -> "LabelAdminUpdate":
        if self.name is None and self.is_active is None:
            raise ValueError("Cần cung cấp ít nhất một trường để cập nhật")
        return self


class LabelAdminResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    name: str
    is_active: bool
    video_count: int = 0


class AdminVideoStatusUpdate(BaseModel):
    status: str
    reason: str | None = Field(default=None, max_length=1000)

    @field_validator("status")
    @classmethod
    def validate_status(cls, val: str) -> str:
        allowed = {
            VideoStatus.published.value,
            VideoStatus.rejected.value,
            VideoStatus.deleted.value,
        }
        if val not in allowed:
            raise ValueError(f"Trạng thái không hợp lệ. Chỉ chấp nhận {', '.join(allowed)}")
        return val


class ModeratorWorkloadItem(BaseModel):
    moderator_id: UUID
    moderator_name: str
    reviews_count: int
    appeals_count: int


class AdminStatsSummary(BaseModel):
    total_users: int = 0
    total_videos: int = 0
    published_videos: int = 0
    rejected_videos: int = 0
    pending_videos: int = 0
    pending_reports: int = 0
    open_appeals: int = 0
    ai_accuracy_rate: float = 0.0


class AdminStatsResponse(BaseModel):
    days: int
    videos_by_status: dict[str, int]
    reports_by_status: dict[str, int]
    appeals_by_status: dict[str, int]
    jobs_by_status: dict[str, int]
    moderator_workload: list[ModeratorWorkloadItem] = Field(default_factory=list)
    summary: AdminStatsSummary | None = None


class AdminAuditLogItem(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    video_id: UUID
    video_caption: str | None = None
    video_owner_id: UUID | None = None
    video_owner_name: str | None = None
    moderator_id: UUID | None = None
    moderator_name: str | None = None
    moderator_email: str | None = None
    action: str | None = None
    reason: str | None = None
    created_at: datetime


class ModeratorStatsResponse(BaseModel):
    moderator_id: UUID
    role: str
    videos_reviewed: int
    appeals_handled: int
>>>>>>> 0dcf2c46a0f557080b0fcca8ac5384151d871ffd
