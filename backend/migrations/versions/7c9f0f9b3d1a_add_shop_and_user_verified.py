"""add shop and user verified

Revision ID: 7c9f0f9b3d1a
Revises: 317deb2ec883
Create Date: 2025-08-18 00:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '7c9f0f9b3d1a'
down_revision: Union[str, Sequence[str], None] = '317deb2ec883'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column('community_users', sa.Column('is_verified', sa.Boolean(), nullable=False, server_default=sa.false()))
    op.alter_column('community_users', 'is_verified', server_default=None)

    # shop tables
    op.create_table('shop_tags',
        sa.Column('id', sa.UUID(), nullable=False),
        sa.Column('name', sa.String(length=64), nullable=False),
        sa.Column('description', sa.Text(), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_shop_tags_name'), 'shop_tags', ['name'], unique=True)

    op.create_table('shop_products',
        sa.Column('id', sa.UUID(), nullable=False),
        sa.Column('sku', sa.String(length=64), nullable=False),
        sa.Column('name', sa.String(length=200), nullable=False),
        sa.Column('description', sa.Text(), nullable=True),
        sa.Column('gender', sa.String(length=16), nullable=False),
        sa.Column('price_cents', sa.Integer(), nullable=False),
        sa.Column('currency', sa.String(length=8), nullable=False),
        sa.Column('is_active', sa.Boolean(), nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=False),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('sku')
    )
    op.create_index(op.f('ix_shop_products_sku'), 'shop_products', ['sku'], unique=False)

    op.create_table('shop_product_images',
        sa.Column('id', sa.UUID(), nullable=False),
        sa.Column('product_id', sa.UUID(), nullable=False),
        sa.Column('url', sa.String(length=512), nullable=False),
        sa.Column('alt_text', sa.String(length=300), nullable=True),
        sa.Column('position', sa.Integer(), nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False),
        sa.ForeignKeyConstraint(['product_id'], ['shop_products.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_shop_product_images_product_id'), 'shop_product_images', ['product_id'], unique=False)

    op.create_table('shop_product_variants',
        sa.Column('id', sa.UUID(), nullable=False),
        sa.Column('product_id', sa.UUID(), nullable=False),
        sa.Column('size', sa.String(length=16), nullable=False),
        sa.Column('color', sa.String(length=32), nullable=True),
        sa.Column('stock_quantity', sa.Integer(), nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False),
        sa.ForeignKeyConstraint(['product_id'], ['shop_products.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('product_id', 'size', 'color', name='uq_variant_unique')
    )
    op.create_index(op.f('ix_shop_product_variants_product_id'), 'shop_product_variants', ['product_id'], unique=False)

    op.create_table('shop_product_tags',
        sa.Column('id', sa.UUID(), nullable=False),
        sa.Column('product_id', sa.UUID(), nullable=False),
        sa.Column('tag_id', sa.UUID(), nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False),
        sa.ForeignKeyConstraint(['product_id'], ['shop_products.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['tag_id'], ['shop_tags.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('product_id', 'tag_id', name='uq_product_tag')
    )
    op.create_index(op.f('ix_shop_product_tags_product_id'), 'shop_product_tags', ['product_id'], unique=False)
    op.create_index(op.f('ix_shop_product_tags_tag_id'), 'shop_product_tags', ['tag_id'], unique=False)

    op.create_table('shop_orders',
        sa.Column('id', sa.UUID(), nullable=False),
        sa.Column('user_id', sa.UUID(), nullable=True),
        sa.Column('status', sa.String(length=24), nullable=False),
        sa.Column('payment_provider', sa.String(length=24), nullable=True),
        sa.Column('payment_id', sa.String(length=64), nullable=True),
        sa.Column('total_cents', sa.Integer(), nullable=False),
        sa.Column('currency', sa.String(length=8), nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=False),
        sa.ForeignKeyConstraint(['user_id'], ['community_users.id'], ondelete='SET NULL'),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_shop_orders_user_id'), 'shop_orders', ['user_id'], unique=False)

    op.create_table('shop_order_items',
        sa.Column('id', sa.UUID(), nullable=False),
        sa.Column('order_id', sa.UUID(), nullable=False),
        sa.Column('product_id', sa.UUID(), nullable=True),
        sa.Column('variant_id', sa.UUID(), nullable=True),
        sa.Column('quantity', sa.Integer(), nullable=False),
        sa.Column('unit_price_cents', sa.Integer(), nullable=False),
        sa.Column('total_cents', sa.Integer(), nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False),
        sa.ForeignKeyConstraint(['order_id'], ['shop_orders.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['product_id'], ['shop_products.id'], ondelete='SET NULL'),
        sa.ForeignKeyConstraint(['variant_id'], ['shop_product_variants.id'], ondelete='SET NULL'),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_shop_order_items_order_id'), 'shop_order_items', ['order_id'], unique=False)


def downgrade() -> None:
    op.drop_index(op.f('ix_shop_order_items_order_id'), table_name='shop_order_items')
    op.drop_table('shop_order_items')
    op.drop_index(op.f('ix_shop_orders_user_id'), table_name='shop_orders')
    op.drop_table('shop_orders')
    op.drop_index(op.f('ix_shop_product_tags_tag_id'), table_name='shop_product_tags')
    op.drop_index(op.f('ix_shop_product_tags_product_id'), table_name='shop_product_tags')
    op.drop_table('shop_product_tags')
    op.drop_index(op.f('ix_shop_product_variants_product_id'), table_name='shop_product_variants')
    op.drop_table('shop_product_variants')
    op.drop_index(op.f('ix_shop_product_images_product_id'), table_name='shop_product_images')
    op.drop_table('shop_product_images')
    op.drop_index(op.f('ix_shop_products_sku'), table_name='shop_products')
    op.drop_table('shop_products')
    op.drop_index(op.f('ix_shop_tags_name'), table_name='shop_tags')
    op.drop_table('shop_tags')
    op.drop_column('community_users', 'is_verified')

