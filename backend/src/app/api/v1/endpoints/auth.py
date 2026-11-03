<<<<<<< HEAD
from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.core.security import create_access_token
from app.db.session import get_db
from app.models import User
from app.schemas import LoginRequest, TokenResponse, UserCreate, UserResponse
=======
from typing import Annotated

from fastapi import APIRouter, Body, Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.dependencies import bearer, current_user
from app.models import User
from app.schemas import (
    LoginRequest,
    LogoutRequest,
    PasswordForgotRequest,
    PasswordForgotResponse,
    PasswordResetRequest,
    RefreshTokenRequest,
    TokenResponse,
    UserCreate,
    UserResponse,
)
>>>>>>> 0dcf2c46a0f557080b0fcca8ac5384151d871ffd
from app.services import auth_service

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
def register(payload: UserCreate, db: Session = Depends(get_db)) -> User:
    return auth_service.create_user(db, payload)


@router.post("/login", response_model=TokenResponse)
def login(payload: LoginRequest, db: Session = Depends(get_db)) -> TokenResponse:
    user = auth_service.authenticate(db, payload)
<<<<<<< HEAD
    return TokenResponse(access_token=create_access_token(user))
=======
    access_token, refresh_token = auth_service.create_session(db, user)
    return TokenResponse(access_token=access_token, refresh_token=refresh_token)


@router.post("/refresh", response_model=TokenResponse)
def refresh(payload: RefreshTokenRequest, db: Session = Depends(get_db)) -> TokenResponse:
    access_token, refresh_token = auth_service.refresh_session(db, payload.refresh_token)
    return TokenResponse(access_token=access_token, refresh_token=refresh_token)


@router.post("/logout", status_code=status.HTTP_204_NO_CONTENT)
def logout(
    credentials: Annotated[HTTPAuthorizationCredentials | None, Depends(bearer)],
    user: User = Depends(current_user),
    payload: LogoutRequest | None = Body(default=None),
    db: Session = Depends(get_db),
) -> None:
    if credentials is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, detail="Vui lòng đăng nhập"
        )
    auth_service.logout(
        db,
        user=user,
        raw_access_token=credentials.credentials,
        raw_refresh_token=payload.refresh_token if payload else None,
    )


@router.post(
    "/password/forgot",
    response_model=PasswordForgotResponse,
    status_code=status.HTTP_202_ACCEPTED,
)
@router.post(
    "/forgot-password",
    response_model=PasswordForgotResponse,
    status_code=status.HTTP_202_ACCEPTED,
    include_in_schema=False,
)
def forgot_password(
    payload: PasswordForgotRequest,
    db: Session = Depends(get_db),
) -> PasswordForgotResponse:
    reset_token = auth_service.request_password_reset(db, payload.email)
    message = (
        "Yêu cầu đặt lại mật khẩu đã được tiếp nhận."
        if reset_token
        else "Nếu email tồn tại, hướng dẫn đặt lại mật khẩu đã được gửi."
    )
    return PasswordForgotResponse(message=message, reset_token=reset_token)


@router.post("/password/reset", status_code=status.HTTP_204_NO_CONTENT)
@router.post("/reset-password", status_code=status.HTTP_204_NO_CONTENT, include_in_schema=False)
def reset_password(
    payload: PasswordResetRequest,
    db: Session = Depends(get_db),
) -> None:
    auth_service.reset_password(db, payload.token, payload.new_password)
>>>>>>> 0dcf2c46a0f557080b0fcca8ac5384151d871ffd
