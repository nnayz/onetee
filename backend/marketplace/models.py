import uuid
from datetime import datetime

from sqlalchemy import Column, DateTime, String, Text, Boolean, ForeignKey, Integer, Numeric, UniqueConstraint
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship

from database import Base


class ProductTag(Base):
    __tablename__ = "shop_tags"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String(64), unique=True, nullable=False, index=True)
    description = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), default=datetime.utcnow, nullable=False)

    products = relationship("ProductTagLink", back_populates="tag", cascade="all, delete-orphan")


class Product(Base):
    __tablename__ = "shop_products"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    sku = Column(String(64), unique=True, nullable=False, index=True)
    name = Column(String(200), nullable=False)
    description = Column(Text, nullable=True)
    gender = Column(String(16), nullable=False)  # men, women
    price_cents = Column(Integer, nullable=False)
    currency = Column(String(8), nullable=False, default="INR")
    is_active = Column(Boolean, nullable=False, default=True)
    created_at = Column(DateTime(timezone=True), default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime(timezone=True), default=datetime.utcnow, nullable=False)

    images = relationship("ProductImage", back_populates="product", cascade="all, delete-orphan")
    variants = relationship("ProductVariant", back_populates="product", cascade="all, delete-orphan")
    tags = relationship("ProductTagLink", back_populates="product", cascade="all, delete-orphan")


class ProductImage(Base):
    __tablename__ = "shop_product_images"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    product_id = Column(UUID(as_uuid=True), ForeignKey("shop_products.id", ondelete="CASCADE"), nullable=False, index=True)
    url = Column(String(512), nullable=False)
    alt_text = Column(String(300), nullable=True)
    position = Column(Integer, nullable=False, default=0)
    created_at = Column(DateTime(timezone=True), default=datetime.utcnow, nullable=False)

    product = relationship("Product", back_populates="images")


class ProductVariant(Base):
    __tablename__ = "shop_product_variants"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    product_id = Column(UUID(as_uuid=True), ForeignKey("shop_products.id", ondelete="CASCADE"), nullable=False, index=True)
    size = Column(String(16), nullable=False)  # XS/S/M/L/XL/XXL
    color = Column(String(32), nullable=True)
    stock_quantity = Column(Integer, nullable=False, default=0)
    created_at = Column(DateTime(timezone=True), default=datetime.utcnow, nullable=False)

    product = relationship("Product", back_populates="variants")
    __table_args__ = (
        UniqueConstraint("product_id", "size", "color", name="uq_variant_unique"),
    )


class ProductTagLink(Base):
    __tablename__ = "shop_product_tags"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    product_id = Column(UUID(as_uuid=True), ForeignKey("shop_products.id", ondelete="CASCADE"), nullable=False, index=True)
    tag_id = Column(UUID(as_uuid=True), ForeignKey("shop_tags.id", ondelete="CASCADE"), nullable=False, index=True)
    created_at = Column(DateTime(timezone=True), default=datetime.utcnow, nullable=False)

    product = relationship("Product", back_populates="tags")
    tag = relationship("ProductTag", back_populates="products")
    __table_args__ = (
        UniqueConstraint("product_id", "tag_id", name="uq_product_tag"),
    )


class Order(Base):
    __tablename__ = "shop_orders"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("community_users.id", ondelete="SET NULL"), nullable=True, index=True)
    status = Column(String(24), nullable=False, default="pending")  # pending, paid, shipped, delivered, cancelled, refunded
    payment_provider = Column(String(24), nullable=True)  # stripe
    payment_id = Column(String(64), nullable=True)  # stripe payment intent id
    total_cents = Column(Integer, nullable=False, default=0)
    currency = Column(String(8), nullable=False, default="INR")
    created_at = Column(DateTime(timezone=True), default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime(timezone=True), default=datetime.utcnow, nullable=False)

    items = relationship("OrderItem", back_populates="order", cascade="all, delete-orphan")


class OrderItem(Base):
    __tablename__ = "shop_order_items"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    order_id = Column(UUID(as_uuid=True), ForeignKey("shop_orders.id", ondelete="CASCADE"), nullable=False, index=True)
    product_id = Column(UUID(as_uuid=True), ForeignKey("shop_products.id", ondelete="SET NULL"), nullable=True)
    variant_id = Column(UUID(as_uuid=True), ForeignKey("shop_product_variants.id", ondelete="SET NULL"), nullable=True)
    quantity = Column(Integer, nullable=False)
    unit_price_cents = Column(Integer, nullable=False)
    total_cents = Column(Integer, nullable=False)
    created_at = Column(DateTime(timezone=True), default=datetime.utcnow, nullable=False)

    order = relationship("Order", back_populates="items")
    product = relationship("Product")
    variant = relationship("ProductVariant")

