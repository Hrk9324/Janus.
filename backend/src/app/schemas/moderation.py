from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field

from app.models.enums import AppealStatus, ModerationAction


class ModerationDecisionRequest(BaseModel):
    action: ModerationAction
    reason: str | None = Field(default=None, max_length=1000)


class AppealCreate(BaseModel):
    reason: str = Field(..., min_length=1, max_length=1000)


class AppealDecisionRequest(BaseModel):
    action: ModerationAction
    reason: str | None = Field(default=None, max_length=1000)


class AppealResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    video_id: UUID
    user_id: UUID
    reason: str
    status: AppealStatus
    moderator_id: UUID | None = None
    decision_reason: str | None = None
    created_at: datetime
    decided_at: datetime | None = None
    user_display_name: str | None = None


class VideoLabelItem(BaseModel):
    name: str = Field(..., min_length=1, max_length=80)
    confidence: float = Field(..., ge=0.0, le=1.0)


class ReplaceVideoLabelsRequest(BaseModel):
    labels: list[VideoLabelItem] = Field(default_factory=list)
