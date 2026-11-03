"""add view_count to videos

Revision ID: 0006_video_view_count
Revises: 0005_video_edit_labels
"""

import sqlalchemy as sa
from alembic import op

revision = "0006_video_view_count"
down_revision = "0005_video_edit_labels"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column(
        "videos",
        sa.Column("view_count", sa.Integer(), nullable=False, server_default="0"),
    )
    op.alter_column("videos", "view_count", server_default=None)


def downgrade() -> None:
    op.drop_column("videos", "view_count")
