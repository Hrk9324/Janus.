from datetime import datetime
from uuid import UUID

from pydantic import (
    BaseModel,
    ConfigDict,
    EmailStr,
    Field,
    field_validator,
    model_validator,
)

from app.models.enums import UserRole, VideoStatus


class AdminUserSummary(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    display_name: str
    role: UserRole
    is_active: bool
    created_at: datetime


class AdminUserDetail(AdminUserSummary):
    email: EmailStr


class AdminUserStatusUpdate(BaseModel):
    is_active: bool


class AdminRoleUpdate(BaseModel):
    role: UserRole


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


class AdminStatsResponse(BaseModel):
    days: int
    videos_by_status: dict[str, int]
    reports_by_status: dict[str, int]
    appeals_by_status: dict[str, int]
    jobs_by_status: dict[str, int]
    moderator_workload: list[ModeratorWorkloadItem] = Field(default_factory=list)


class ModeratorStatsResponse(BaseModel):
    moderator_id: UUID
    role: str
    videos_reviewed: int
    appeals_handled: int
