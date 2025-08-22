"""merge product collection and thread rename

Revision ID: a1115c7b7af3
Revises: 5bdc258544f5, c4714617ddef
Create Date: 2025-08-22 04:45:19.312807

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'a1115c7b7af3'
down_revision: Union[str, Sequence[str], None] = ('5bdc258544f5', 'c4714617ddef')
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    pass


def downgrade() -> None:
    """Downgrade schema."""
    pass
