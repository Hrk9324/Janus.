<<<<<<< HEAD
from datetime import datetime, timezone
=======
from datetime import UTC, datetime
>>>>>>> 0dcf2c46a0f557080b0fcca8ac5384151d871ffd

from app.db.session import Base


def utcnow() -> datetime:
<<<<<<< HEAD
    return datetime.now(timezone.utc)
=======
    return datetime.now(UTC)
>>>>>>> 0dcf2c46a0f557080b0fcca8ac5384151d871ffd


__all__ = ["Base", "utcnow"]
