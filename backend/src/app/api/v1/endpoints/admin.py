from uuid import UUID

<<<<<<< HEAD
from fastapi import APIRouter, Depends
=======
from fastapi import APIRouter, Depends, Query, status
>>>>>>> 0dcf2c46a0f557080b0fcca8ac5384151d871ffd
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.dependencies import require_roles
<<<<<<< HEAD
from app.models import User, UserRole
from app.schemas import AdminRoleUpdate, AdminUserDetail, AdminUserStatusUpdate, AdminUserSummary
=======
from app.models import User, UserRole, Video
from app.schemas import (
    AdminAuditLogItem,
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
>>>>>>> 0dcf2c46a0f557080b0fcca8ac5384151d871ffd
from app.services import admin_service

router = APIRouter(prefix="/admin", tags=["admin"])


@router.get("/users", response_model=list[AdminUserSummary])
def admin_list_users(
    search: str | None = None,
<<<<<<< HEAD
    user: User = Depends(require_roles(UserRole.admin)),
    db: Session = Depends(get_db),
) -> list[User]:
    return admin_service.list_users(db, search)
=======
    role: UserRole | None = None,
    status: str | None = None,
    is_active: bool | None = None,
    skip: int = Query(default=0, ge=0),
    limit: int = Query(default=50, ge=1, le=100),
    user: User = Depends(require_roles(UserRole.admin)),
    db: Session = Depends(get_db),
) -> list[User]:
    if status is not None and is_active is None:
        s = status.strip().lower()
        if s in {"active", "unbanned"}:
            is_active = True
        elif s in {"banned", "inactive", "blocked"}:
            is_active = False
    return admin_service.list_users(
        db=db,
        search=search,
        role=role,
        is_active=is_active,
        skip=skip,
        limit=limit,
    )


@router.get("/audit-logs", response_model=list[AdminAuditLogItem])
def admin_list_audit_logs(
    action: str | None = None,
    moderator_id: UUID | None = None,
    video_id: UUID | None = None,
    skip: int = Query(default=0, ge=0),
    limit: int = Query(default=50, ge=1, le=100),
    user: User = Depends(require_roles(UserRole.admin)),
    db: Session = Depends(get_db),
) -> list[dict]:
    return admin_service.list_audit_logs(
        db=db,
        action=action,
        moderator_id=moderator_id,
        video_id=video_id,
        skip=skip,
        limit=limit,
    )
>>>>>>> 0dcf2c46a0f557080b0fcca8ac5384151d871ffd


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
<<<<<<< HEAD
=======


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


@router.get("/overview", response_model=AdminStatsResponse)
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
>>>>>>> 0dcf2c46a0f557080b0fcca8ac5384151d871ffd
