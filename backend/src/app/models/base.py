from datetime import UTC, datetime

from app.db.session import Base


def utcnow() -> datetime:
    return datetime.now(UTC)


__all__ = ["Base", "utcnow"]
