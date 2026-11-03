<<<<<<< HEAD
from pydantic import BaseModel, EmailStr
=======
from pydantic import BaseModel, EmailStr, Field
>>>>>>> 0dcf2c46a0f557080b0fcca8ac5384151d871ffd


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class TokenResponse(BaseModel):
    access_token: str
<<<<<<< HEAD
    token_type: str = "bearer"
=======
    refresh_token: str | None = None
    token_type: str = "bearer"


class RefreshTokenRequest(BaseModel):
    refresh_token: str = Field(..., min_length=1)


class LogoutRequest(BaseModel):
    refresh_token: str | None = None


class PasswordForgotRequest(BaseModel):
    email: EmailStr


class PasswordForgotResponse(BaseModel):
    message: str
    reset_token: str | None = None


class PasswordResetRequest(BaseModel):
    token: str = Field(..., min_length=1)
    new_password: str = Field(..., min_length=8, max_length=128)
>>>>>>> 0dcf2c46a0f557080b0fcca8ac5384151d871ffd
