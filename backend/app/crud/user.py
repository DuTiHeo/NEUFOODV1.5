from typing import Optional, List
from sqlalchemy.orm import Session
from app.db.models import User
from app.core.security import hash_password

def get_user_by_id(db: Session, user_id: int) -> Optional[User]:
    return db.query(User).filter(User.id == user_id).first()

def get_user_by_email(db: Session, email: str) -> Optional[User]:
    return db.query(User).filter(User.email == email.strip().lower()).first()

def create_user(
    db: Session,
    email: str,
    password: str,
    full_name: str,
    phone_number: Optional[str] = None,
    student_id: Optional[str] = None,
    role: str = "user"
) -> User:
    hashed = hash_password(password)
    user = User(
        email=email.strip().lower(),
        password_hash=hashed,
        full_name=full_name,
        phone_number=phone_number,
        student_id=student_id,
        role=role,
        is_active=True
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user

def update_user(db: Session, user: User, update_data: dict) -> User:
    for field, value in update_data.items():
        if hasattr(user, field) and value is not None:
            setattr(user, field, value)
    db.commit()
    db.refresh(user)
    return user
