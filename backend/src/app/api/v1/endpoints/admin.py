from uuid import UUID

from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.dependencies import require_roles
from app.models import User, UserRole, Video
from app.schemas import (
    AdminRoleUpdate,
    AdminStatsResponse,
    AdminUserDetail,
    AdminUserStatusUpdate,
    AdminUserSummary,
    AdminVideoStatusUpdate,
    LabelAdminCreate,
    LabelAdminResponse,
    LabelAdminUpdate,
    ModeratorStatsResponse,
    VideoResponse,
)
from app.services import admin_service

router = APIRouter(prefix="/admin", tags=["admin"])


@router.get("/users", response_model=list[AdminUserSummary])
def admin_list_users(
    search: str | None = None,
    user: User = Depends(require_roles(UserRole.admin)),
    db: Session = Depends(get_db),
) -> list[User]:
    return admin_service.list_users(db, search)


@router.get("/users/{user_id}", response_model=AdminUserDetail)
def admin_get_user(
    user_id: UUID,
    user: User = Depends(require_roles(UserRole.admin)),
    db: Session = Depends(get_db),
) -> User:
    return admin_service.get_user(db, user_id)


@router.patch("/users/{user_id}/status", response_model=AdminUserDetail)
def admin_update_user_status(
    user_id: UUID,
    payload: AdminUserStatusUpdate,
    user: User = Depends(require_roles(UserRole.admin)),
    db: Session = Depends(get_db),
) -> User:
    return admin_service.update_user_status(db, user_id, user, payload.is_active)


@router.get("/moderators", response_model=list[AdminUserSummary])
def admin_list_moderators(
    user: User = Depends(require_roles(UserRole.admin)),
    db: Session = Depends(get_db),
) -> list[User]:
    return admin_service.list_moderators(db)


@router.patch("/users/{user_id}/role", response_model=AdminUserDetail)
def admin_update_user_role(
    user_id: UUID,
    payload: AdminRoleUpdate,
    user: User = Depends(require_roles(UserRole.admin)),
    db: Session = Depends(get_db),
) -> User:
    return admin_service.update_user_role(db, user_id, user, payload.role)


@router.post(
    "/labels",
    response_model=LabelAdminResponse,
    status_code=status.HTTP_201_CREATED,
)
def admin_create_label(
    payload: LabelAdminCreate,
    user: User = Depends(require_roles(UserRole.admin)),
    db: Session = Depends(get_db),
) -> dict:
    return admin_service.create_label(db, payload.name)


@router.get("/labels", response_model=list[LabelAdminResponse])
def admin_list_labels(
    user: User = Depends(require_roles(UserRole.admin)),
    db: Session = Depends(get_db),
) -> list[dict]:
    return admin_service.list_labels(db)


@router.patch("/labels/{label_id}", response_model=LabelAdminResponse)
def admin_update_label(
    label_id: UUID,
    payload: LabelAdminUpdate,
    user: User = Depends(require_roles(UserRole.admin)),
    db: Session = Depends(get_db),
) -> dict:
    return admin_service.update_label(
        db, label_id, name=payload.name, is_active=payload.is_active
    )


@router.patch("/videos/{video_id}/status", response_model=VideoResponse)
def admin_update_video_status(
    video_id: UUID,
    payload: AdminVideoStatusUpdate,
    user: User = Depends(require_roles(UserRole.admin)),
    db: Session = Depends(get_db),
) -> Video:
    return admin_service.update_video_status(
        db, video_id, actor=user, status=payload.status, reason=payload.reason
    )


@router.get("/stats", response_model=AdminStatsResponse)
def admin_get_stats(
    days: int = Query(default=30, ge=1),
    user: User = Depends(require_roles(UserRole.admin)),
    db: Session = Depends(get_db),
) -> dict:
    return admin_service.get_system_stats(db, days)


@router.get("/moderators/{moderator_id}/stats", response_model=ModeratorStatsResponse)
def admin_get_moderator_stats(
    moderator_id: UUID,
    user: User = Depends(require_roles(UserRole.admin)),
    db: Session = Depends(get_db),
) -> dict:
    return admin_service.get_moderator_stats(db, moderator_id)
