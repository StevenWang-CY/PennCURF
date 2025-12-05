"""
Authentication Service for Penn CURF

Handles password hashing and JWT token generation/validation.
"""

import os
from datetime import datetime, timedelta
from typing import Optional, Dict, Any
from passlib.context import CryptContext
from jose import jwt, JWTError
from dotenv import load_dotenv

load_dotenv()

# Password hashing configuration
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# JWT configuration
SECRET_KEY = os.getenv("JWT_SECRET_KEY", "your-secret-key-change-in-production")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_DAYS = 7


class AuthService:
    """Service for authentication operations"""

    @staticmethod
    def hash_password(password: str) -> str:
        """Hash a password using bcrypt"""
        return pwd_context.hash(password)

    @staticmethod
    def verify_password(plain_password: str, hashed_password: str) -> bool:
        """Verify a password against its hash"""
        return pwd_context.verify(plain_password, hashed_password)

    @staticmethod
    def create_access_token(user_id: str, username: str) -> str:
        """Create a JWT access token"""
        expire = datetime.utcnow() + timedelta(days=ACCESS_TOKEN_EXPIRE_DAYS)
        to_encode = {
            "sub": user_id,
            "username": username,
            "exp": expire,
            "iat": datetime.utcnow(),
        }
        encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
        return encoded_jwt

    @staticmethod
    def verify_token(token: str) -> Optional[Dict[str, Any]]:
        """Verify and decode a JWT token"""
        try:
            payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
            user_id: str = payload.get("sub")
            username: str = payload.get("username")

            if user_id is None:
                return None

            return {
                "user_id": user_id,
                "username": username,
            }
        except JWTError:
            return None

    @staticmethod
    def validate_password_strength(password: str) -> tuple[bool, str]:
        """Validate password meets minimum requirements"""
        if len(password) < 8:
            return False, "Password must be at least 8 characters long"
        return True, ""

    @staticmethod
    def validate_username(username: str) -> tuple[bool, str]:
        """Validate username meets requirements"""
        if len(username) < 3:
            return False, "Username must be at least 3 characters long"
        if len(username) > 50:
            return False, "Username must be less than 50 characters"
        if not username.replace("_", "").replace("-", "").isalnum():
            return False, "Username can only contain letters, numbers, underscores, and hyphens"
        return True, ""


# Singleton instance
_auth_service: Optional[AuthService] = None


def get_auth_service() -> AuthService:
    global _auth_service
    if _auth_service is None:
        _auth_service = AuthService()
    return _auth_service
