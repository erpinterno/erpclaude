from sqlalchemy.orm import Session
from app.core.config import settings
from app.crud import crud_user
from app.schemas.user import UserCreate
from app.db.session import SessionLocal

def init_db() -> None:
    db = SessionLocal()

    # Create first superuser
    user = crud_user.get_by_email(db, email=settings.FIRST_SUPERUSER)
    if not user:
        user_in = UserCreate(
            email=settings.FIRST_SUPERUSER,
            password=settings.FIRST_SUPERUSER_PASSWORD,
            is_superuser=True,
            full_name="Admin User"
        )
        user = crud_user.create(db, obj_in=user_in)

    db.close()