"""added product collection table

Revision ID: 5bdc258544f5
Revises: 7c9f0f9b3d1a
Create Date: 2025-08-20 21:06:28.751514

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision: str = '5bdc258544f5'
down_revision: Union[str, Sequence[str], None] = '7c9f0f9b3d1a'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema by adding product collections tables."""
    # shop_collections
    op.create_table(
        'shop_collections',
        sa.Column('id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('name', sa.String(length=120), nullable=False),
        sa.Column('description', sa.Text(), nullable=True),
        sa.Column('created_at', postgresql.TIMESTAMP(timezone=True), nullable=False, server_default=sa.text('now()')),
        sa.PrimaryKeyConstraint('id', name='shop_collections_pkey'),
        sa.UniqueConstraint('name', name='uq_collection_name')
    )
    # shop_product_collections
    op.create_table(
        'shop_product_collections',
        sa.Column('id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('product_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('collection_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('created_at', postgresql.TIMESTAMP(timezone=True), nullable=False, server_default=sa.text('now()')),
        sa.ForeignKeyConstraint(['product_id'], ['shop_products.id'], name='shop_product_collections_product_id_fkey', ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['collection_id'], ['shop_collections.id'], name='shop_product_collections_collection_id_fkey', ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id', name='shop_product_collections_pkey'),
        sa.UniqueConstraint('product_id', 'collection_id', name='uq_product_collection')
    )
    op.create_index(op.f('ix_shop_product_collections_product_id'), 'shop_product_collections', ['product_id'], unique=False)
    op.create_index(op.f('ix_shop_product_collections_collection_id'), 'shop_product_collections', ['collection_id'], unique=False)


def downgrade() -> None:
    """Downgrade by dropping product collections tables."""
    op.drop_index(op.f('ix_shop_product_collections_collection_id'), table_name='shop_product_collections')
    op.drop_index(op.f('ix_shop_product_collections_product_id'), table_name='shop_product_collections')
    op.drop_table('shop_product_collections')
    op.drop_table('shop_collections')
