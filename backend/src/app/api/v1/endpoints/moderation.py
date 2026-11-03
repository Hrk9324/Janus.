from uuid import UUID

from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.dependencies import require_roles
<<<<<<< HEAD
from app.models import Report, User, UserRole, Video
from app.schemas import ModerationDecisionRequest, ReportResponse, VideoResponse
=======
from app.models import Appeal, Report, User, UserRole
from app.schemas import (
    AppealDecisionRequest,
    AppealResponse,
    ModerationDecisionRequest,
    ModerationQueueItemResponse,
    ReportResponse,
)
>>>>>>> 0dcf2c46a0f557080b0fcca8ac5384151d871ffd
from app.services import moderation_service

router = APIRouter(prefix="/moderation", tags=["moderation"])


<<<<<<< HEAD
@router.get("/queue", response_model=list[VideoResponse])
def moderation_queue(
    user: User = Depends(require_roles(UserRole.moderator, UserRole.admin)),
    db: Session = Depends(get_db),
) -> list[Video]:
=======
@router.get("/queue", response_model=list[ModerationQueueItemResponse])
def moderation_queue(
    user: User = Depends(require_roles(UserRole.moderator, UserRole.admin)),
    db: Session = Depends(get_db),
) -> list[ModerationQueueItemResponse]:
>>>>>>> 0dcf2c46a0f557080b0fcca8ac5384151d871ffd
    return moderation_service.moderation_queue(db)


@router.post("/videos/{video_id}/decision", status_code=status.HTTP_204_NO_CONTENT)
def moderation_decision(
    video_id: UUID,
    payload: ModerationDecisionRequest,
    user: User = Depends(require_roles(UserRole.moderator, UserRole.admin)),
    db: Session = Depends(get_db),
) -> None:
    moderation_service.decide_video(db, video_id, user, payload.action, payload.reason)


@router.get("/reports", response_model=list[ReportResponse])
def moderation_reports(
    user: User = Depends(require_roles(UserRole.moderator, UserRole.admin)),
    db: Session = Depends(get_db),
) -> list[Report]:
    return moderation_service.list_open_reports(db)


@router.post("/reports/{report_id}/decision", status_code=status.HTTP_204_NO_CONTENT)
def report_decision(
    report_id: UUID,
    payload: ModerationDecisionRequest,
    user: User = Depends(require_roles(UserRole.moderator, UserRole.admin)),
    db: Session = Depends(get_db),
) -> None:
    moderation_service.decide_report(db, report_id, user, payload.action, payload.reason)
<<<<<<< HEAD
=======


@router.get("/appeals", response_model=list[AppealResponse])
def moderation_appeals(
    user: User = Depends(require_roles(UserRole.moderator, UserRole.admin)),
    db: Session = Depends(get_db),
) -> list[Appeal]:
    return moderation_service.list_appeals(db)


@router.post("/appeals/{appeal_id}/decision", status_code=status.HTTP_204_NO_CONTENT)
def appeal_decision(
    appeal_id: UUID,
    payload: AppealDecisionRequest,
    user: User = Depends(require_roles(UserRole.moderator, UserRole.admin)),
    db: Session = Depends(get_db),
) -> None:
    moderation_service.decide_appeal(db, appeal_id, user, payload.action, payload.reason)
>>>>>>> 0dcf2c46a0f557080b0fcca8ac5384151d871ffd
