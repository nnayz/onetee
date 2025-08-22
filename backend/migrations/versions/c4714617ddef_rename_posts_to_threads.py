"""rename_posts_to_threads

Revision ID: c4714617ddef
Revises: 5bdc258544f5
Create Date: 2025-08-22 04:40:46.325138

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'c4714617ddef'
down_revision: Union[str, Sequence[str], None] = '5bdc258544f5'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    pass


def downgrade() -> None:
    """Downgrade schema."""
    pass
