import os
from datetime import datetime, timedelta

from fastapi import APIRouter, Depends, HTTPException
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from jose import JWTError, jwt
from passlib.context import CryptContext
from pydantic import BaseModel

router = APIRouter()
bearer = HTTPBearer()
pwd_ctx = CryptContext(schemes=["bcrypt"], deprecated="auto")

SECRET = os.getenv("APP_SECRET_KEY", "prathomix_dev")
ALG = os.getenv("JWT_ALGORITHM", "HS256")
EXPIRE = int(os.getenv("JWT_EXPIRE_MINUTES", "1440"))
ADMIN_PW = os.getenv("ADMIN_PASSWORD")
ADMIN_PW_HASH = os.getenv("ADMIN_PASSWORD_HASH")


class LoginReq(BaseModel):
    email: str = ""
    password: str


class RegReq(BaseModel):
    email: str
    password: str
    name: str
    phone: str = ""


def make_token(data: dict, mins: int = EXPIRE) -> str:
    payload = data.copy()
    payload["exp"] = datetime.utcnow() + timedelta(minutes=mins)
    return jwt.encode(payload, SECRET, algorithm=ALG)


def decode_token(token: str) -> dict:
    try:
        return jwt.decode(token, SECRET, algorithms=[ALG])
    except JWTError as exc:
        raise HTTPException(status_code=401, detail="Invalid or expired token") from exc


def get_current_user(creds: HTTPAuthorizationCredentials = Depends(bearer)) -> dict:
    return decode_token(creds.credentials)


def require_admin(user: dict = Depends(get_current_user)) -> dict:
    if user.get("role") != "admin":
        raise HTTPException(403, "Admin access required")
    return user


def _admin_password_valid(password: str) -> bool:
    if ADMIN_PW_HASH:
        return pwd_ctx.verify(password, ADMIN_PW_HASH)
    if ADMIN_PW:
        return password == ADMIN_PW
    return False


@router.post("/login")
async def login(req: LoginReq):
    user = {"sub": "mock-user", "email": req.email, "name": "Test Patient", "role": "patient"}
    return {"access_token": make_token(user), "token_type": "bearer", "user": user}


@router.post("/register")
async def register(req: RegReq):
    user = {"sub": f"user-{req.email[:6]}", "email": req.email, "name": req.name, "role": "patient"}
    return {"access_token": make_token(user), "token_type": "bearer", "user": user}


@router.post("/admin/login")
async def admin_login(req: LoginReq):
    if not _admin_password_valid(req.password):
        raise HTTPException(status_code=401, detail="Invalid admin credentials")

    user = {"sub": "admin", "email": "admin@prathomix.in", "name": "Dr. Dheerendra Pratap Singh", "role": "admin"}
    return {"access_token": make_token(user, 480), "token_type": "bearer", "user": user}


@router.get("/me")
async def me(user: dict = Depends(get_current_user)):
    return {"user": user}


@router.post("/refresh")
async def refresh(user: dict = Depends(get_current_user)):
    return {"access_token": make_token({k: user[k] for k in ["sub", "email", "name", "role"] if k in user}), "token_type": "bearer"}


@router.post("/logout")
async def logout():
    return {"message": "Logged out"}
