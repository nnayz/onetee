from __future__ import annotations

from typing import List
from uuid import UUID

from sqlalchemy import select
from sqlalchemy.orm import Session

from .models import Product, ProductImage, ProductVariant, ProductTag, ProductTagLink, Order, OrderItem


class MarketplaceService:
    def list_products(self, db: Session, *, gender: str | None = None, tag: str | None = None, limit: int = 50, offset: int = 0) -> List[Product]:
        stmt = select(Product).where(Product.is_active == True).order_by(Product.created_at.desc()).offset(offset).limit(limit)
        if gender in {"men", "women"}:
            stmt = stmt.where(Product.gender == gender)
        if tag:
            from sqlalchemy import exists
            tag_subq = select(ProductTagLink.product_id).join(ProductTag, ProductTag.id == ProductTagLink.tag_id).where(ProductTag.name == tag)
            stmt = stmt.where(Product.id.in_(tag_subq))
        return db.execute(stmt).scalars().all()

    def create_tag(self, db: Session, *, name: str, description: str | None) -> ProductTag:
        existing = db.execute(select(ProductTag).where(ProductTag.name == name)).scalar_one_or_none()
        if existing:
            return existing
        tag = ProductTag(name=name, description=description)
        db.add(tag)
        db.commit()
        db.refresh(tag)
        return tag

    def list_tags(self, db: Session) -> list[ProductTag]:
        return db.execute(select(ProductTag).order_by(ProductTag.name.asc())).scalars().all()

    def create_product(self, db: Session, *, sku: str, name: str, description: str | None, gender: str, price_cents: int, currency: str, image_urls: List[str], sizes: List[str], colors: List[str], tags: List[str]) -> Product:
        product = Product(sku=sku, name=name, description=description, gender=gender, price_cents=price_cents, currency=currency)
        db.add(product)
        db.flush()
        for idx, url in enumerate(image_urls):
            db.add(ProductImage(product_id=product.id, url=url, position=idx))
        # generate variants (cartesian of sizes x colors; if no colors, just sizes)
        if sizes:
            if colors:
                for s in sizes:
                    for c in colors:
                        db.add(ProductVariant(product_id=product.id, size=s, color=c, stock_quantity=0))
            else:
                for s in sizes:
                    db.add(ProductVariant(product_id=product.id, size=s, color=None, stock_quantity=0))
        # tags
        for t in tags:
            tag = self.create_tag(db, name=t, description=None)
            db.add(ProductTagLink(product_id=product.id, tag_id=tag.id))
        db.commit()
        db.refresh(product)
        return product

    def get_product(self, db: Session, *, product_id: UUID) -> Product | None:
        return db.get(Product, product_id)

    def delete_product(self, db: Session, *, product_id: UUID) -> bool:
        from sqlalchemy import delete
        db.execute(delete(Product).where(Product.id == product_id))
        db.commit()
        return True

    def search_products(self, db: Session, *, query: str, limit: int = 50, offset: int = 0) -> List[Product]:
        from sqlalchemy import or_
        # Simple ILIKE-based search over name, description, and associated tag names
        stmt = (
            select(Product)
            .where(Product.is_active == True)
            .order_by(Product.created_at.desc())
            .offset(offset)
            .limit(limit)
        )
        if query:
            pattern = f"%{query}%"
            tag_subq = (
                select(ProductTagLink.product_id)
                .join(ProductTag, ProductTag.id == ProductTagLink.tag_id)
                .where(ProductTag.name.ilike(pattern))
            )
            stmt = stmt.where(
                or_(
                    Product.name.ilike(pattern),
                    Product.description.ilike(pattern),
                    Product.id.in_(tag_subq),
                )
            )
        return db.execute(stmt).scalars().all()

    def create_order(self, db: Session, *, user_id: UUID | None, items: list[tuple[UUID, UUID | None, int]]) -> Order:
        # items: list of (product_id, variant_id, quantity)
        order = Order(user_id=user_id, status="pending")
        db.add(order)
        db.flush()
        total_cents = 0
        for product_id, variant_id, quantity in items:
            product = db.get(Product, product_id)
            if not product:
                continue
            unit = product.price_cents
            line_total = unit * quantity
            total_cents += line_total
            db.add(OrderItem(order_id=order.id, product_id=product_id, variant_id=variant_id, quantity=quantity, unit_price_cents=unit, total_cents=line_total))
        order.total_cents = total_cents
        db.commit()
        db.refresh(order)
        return order

