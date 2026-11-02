"""Test streaming video (UC004) và tìm kiếm/lọc theo nhãn (UC009)."""

from uuid import UUID

from sqlalchemy import select

from app.db.session import SessionLocal
from app.models import Label, UserRole, VideoLabel, VideoStatus
from app.services.ai_service import confidence_level


def ensure_label(name: str) -> None:
    with SessionLocal() as db:
        if db.scalar(select(Label).where(Label.name == name)) is None:
            db.add(Label(name=name))
            db.commit()


def attach_label(video_id: str, name: str, confidence: float = 0.9) -> None:
    ensure_label(name)
    with SessionLocal() as db:
        label = db.scalar(select(Label).where(Label.name == name))
        db.add(
            VideoLabel(
                video_id=UUID(video_id),
                label_id=label.id,
                confidence=confidence,
                level=confidence_level(confidence),
            )
        )
        db.commit()


def test_stream_published_video_supports_range(client, login, seed_video):
    video = seed_video(status=VideoStatus.published)
    headers = login(video.email)
    url = f"/api/v1/videos/{video.video_id}/stream"

    response = client.get(url, headers=headers)
    assert response.status_code == 200
    assert response.headers["content-type"] == "video/mp4"
    assert response.headers.get("accept-ranges") == "bytes"

    ranged = client.get(url, headers={**headers, "Range": "bytes=0-3"})
    assert ranged.status_code == 206
    assert len(ranged.content) == 4


def test_stream_visibility_rules(client, register, login, seed_video):
    pending = seed_video(status=VideoStatus.pending_review)
    stranger = register("stranger-stream@example.com")
    owner = login(pending.email)
    moderator = register("mod-stream@example.com", role=UserRole.moderator)
    url = f"/api/v1/videos/{pending.video_id}/stream"

    # Video chưa đăng: người lạ 404, chủ video và moderator xem được.
    assert client.get(url, headers=stranger).status_code == 404
    assert client.get(url, headers=owner).status_code == 200
    assert client.get(url, headers=moderator).status_code == 200

    # Video không tồn tại và video chưa bị lưu file.
    assert (
        client.get(
            "/api/v1/videos/00000000-0000-0000-0000-000000000000/stream", headers=stranger
        ).status_code
        == 404
    )
    missing = seed_video(write_file=False)
    assert client.get(f"/api/v1/videos/{missing.video_id}/stream", headers=login(missing.email)).status_code == 404
    assert client.get(url).status_code == 404


def test_search_by_tag_returns_public_paginated_items(client, seed_video):
    adult = seed_video(caption="clip có yếu tố người lớn")
    attach_label(str(adult.video_id), "Adult")
    normal = seed_video(caption="clip bình thường")
    attach_label(str(normal.video_id), "Safe")
    pending = seed_video(caption="chờ kiểm duyệt", status=VideoStatus.pending_review)

    response = client.get("/api/v1/videos/search?tag=Adult&limit=1")
    assert response.status_code == 200
    body = response.json()
    assert set(body) == {"items", "has_more", "next_cursor"}
    assert len(body["items"]) == 1
    assert body["items"][0]["id"] == str(adult.video_id)
    assert body["items"][0]["matched_labels"] == ["Adult"]
    assert str(pending.video_id) not in {
        item["id"] for item in body["items"]
    }
    assert client.get("/api/v1/videos/search?tag=Adult&limit=0").status_code == 422
