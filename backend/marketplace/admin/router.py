from typing import List, Dict, Any
from uuid import UUID
import os
import base64
from datetime import datetime, timedelta
from sqlalchemy import func, and_, desc, asc

from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, status, Response, Request
from sqlalchemy.orm import Session
from sqlalchemy import select

from database import get_db
from auth.deps import get_admin_user
from ..service import MarketplaceService
from ..schemas import TagCreate, TagOut, ProductCreate, ProductOut, CollectionCreate, CollectionOut
from ..models import Product, ProductTag, ProductTagLink, Collection, ProductCollectionLink, Order, OrderItem, ProductVariant
from storage.minio_service import MinioService
from community.models.user import User
from community.models.thread import Thread
from community.models.social import Like, Repost, Bookmark, Follow


router = APIRouter(tags=["MarketplaceAdmin"])
service = MarketplaceService()
minio = MinioService()

# Login endpoint 
@router.post('/login', response_model=bool)
async def login(username: str, password: str, response: Response):
    admin_username = os.getenv("ADMIN_USERNAME")
    admin_password = os.getenv("ADMIN_PASSWORD")
    
    if not admin_username or not admin_password:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Admin credentials not configured")
    
    if username == admin_username and password == admin_password:
        # Create admin token and set as HttpOnly cookie
        admin_token = base64.b64encode(f"{username}:{password}".encode()).decode()
        response.set_cookie(
            key="admin_token",
            value=admin_token,
            httponly=True,
            secure=False,  # Set to True in production with HTTPS
            samesite="lax",
            max_age=24 * 3600  # 24 hours for better persistence
        )
        return True
    else:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials")


# Refresh endpoint to extend cookie expiration
@router.post('/refresh', response_model=bool)
async def refresh_session(request: Request, response: Response):
    try:
        # Validate current admin token
        admin = get_admin_user(request)
        
        # Extend the cookie expiration
        admin_username = os.getenv("ADMIN_USERNAME")
        admin_password = os.getenv("ADMIN_PASSWORD")
        admin_token = base64.b64encode(f"{admin_username}:{admin_password}".encode()).decode()
        
        response.set_cookie(
            key="admin_token",
            value=admin_token,
            httponly=True,
            secure=False,  # Set to True in production with HTTPS
            samesite="lax",
            max_age=24 * 3600  # 24 hours
        )
        return True
    except HTTPException:
        return False


# Logout endpoint
@router.post('/logout', response_model=bool)
async def logout(response: Response):
    # Clear the admin cookie
    response.delete_cookie(
        key="admin_token",
        httponly=True,
        secure=False,  # Set to True in production with HTTPS
        samesite="lax"
    )
    return True


# Tags CRUD
@router.post("/tags", response_model=TagOut)
def create_tag(payload: TagCreate, request: Request, db: Session = Depends(get_db)):
    admin = get_admin_user(request)
    return service.create_tag(db, name=payload.name, description=payload.description)


@router.get("/tags", response_model=List[TagOut])
def list_tags(request: Request, db: Session = Depends(get_db)):
    admin = get_admin_user(request)
    return service.list_tags(db)


@router.delete("/tags/{tag_id}")
def delete_tag(tag_id: UUID, request: Request, db: Session = Depends(get_db)):
    admin = get_admin_user(request)
    from sqlalchemy import delete
    tag = db.get(ProductTag, tag_id)
    if not tag:
        raise HTTPException(status_code=404, detail="Tag not found")
    db.execute(delete(ProductTag).where(ProductTag.id == tag_id))
    db.commit()
    return {"success": True}


@router.put("/tags/{tag_id}", response_model=TagOut)
def update_tag(tag_id: UUID, payload: TagCreate, request: Request, db: Session = Depends(get_db)):
    admin = get_admin_user(request)
    tag = db.get(ProductTag, tag_id)
    if not tag:
        raise HTTPException(status_code=404, detail="Tag not found")
    # ensure unique name
    if payload.name and payload.name != tag.name:
        from sqlalchemy import select
        exists = db.execute(select(ProductTag).where(ProductTag.name == payload.name)).scalar_one_or_none()
        if exists:
            raise HTTPException(status_code=400, detail="Tag name already exists")
    tag.name = payload.name or tag.name
    tag.description = payload.description
    db.commit()
    db.refresh(tag)
    return tag


# Products CRUD
@router.post("/products", response_model=ProductOut)
def create_product(
    sku: str = Form(...), # Stock Keeping Unit
    name: str = Form(...), # product name
    gender: str = Form(...),  # men|women
    price_cents: int = Form(...), # price in cents
    currency: str = Form("INR"), # currency (INR, USD, etc.)
    description: str | None = Form(None), # description
    sizes: str | None = Form(None),  # comma-separated
    colors: str | None = Form(None), # comma-separated
    tags: str | None = Form(None),   # comma-separated tag names (tag ids)
    images: List[UploadFile] = File(default_factory=list), # list of images
    request: Request = None, # request for admin auth
    db: Session = Depends(get_db), # database session
):
    admin = get_admin_user(request)
    # Upload images to MinIO and collect URLs
    image_urls = minio.upload_product_uploadfiles(sku, images)

    size_list = [s.strip() for s in (sizes or "").split(",") if s.strip()]
    color_list = [c.strip() for c in (colors or "").split(",") if c.strip()]
    tag_list = [t.strip() for t in (tags or "").split(",") if t.strip()]

    p = service.create_product(
        db,
        sku=sku,
        name=name,
        description=description,
        gender=gender,
        price_cents=price_cents,
        currency=currency,
        image_urls=image_urls,
        sizes=size_list,
        colors=color_list,
        tags=tag_list,
    )
    return {
        "id": p.id,
        "sku": p.sku,
        "name": p.name,
        "description": p.description,
        "gender": p.gender,
        "price_cents": p.price_cents,
        "currency": p.currency,
        "is_active": p.is_active,
        "created_at": p.created_at,
        "updated_at": p.updated_at,
        "images": p.images,
        "variants": p.variants,
        "tag_names": [link.tag.name for link in p.tags],
    }


@router.delete("/products/{product_id}")
def delete_product(product_id: UUID, request: Request, db: Session = Depends(get_db)):
    admin = get_admin_user(request)
    # delete product from minio
    product = db.get(Product, product_id)
    if not product:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Product not found")
    for image in product.images:
        minio.delete_object(image)
    service.delete_product(db, product_id=product_id)
    return {"success": True}


@router.post("/products/{product_id}/tags/{tag_id}")
def assign_tag_to_product(product_id: UUID, tag_id: UUID, request: Request, db: Session = Depends(get_db)):
    admin = get_admin_user(request)
    # manual link creation (service might also expose a helper)
    from sqlalchemy import select
    product = db.get(Product, product_id)
    tag = db.get(ProductTag, tag_id)
    if not product or not tag:
        raise HTTPException(status_code=404, detail="Not found")
    exists = db.execute(select(ProductTagLink).where(ProductTagLink.product_id == product_id, ProductTagLink.tag_id == tag_id)).scalar_one_or_none()
    if exists:
        return {"success": True}
    db.add(ProductTagLink(product_id=product_id, tag_id=tag_id))
    db.commit()
    return {"success": True}


# Collections
@router.post("/collections", response_model=CollectionOut)
def create_collection(payload: CollectionCreate, request: Request, db: Session = Depends(get_db)):
    admin = get_admin_user(request)
    existing = db.execute(select(Collection).where(Collection.name == payload.name)).scalar_one_or_none()
    if existing:
        return existing
    col = Collection(name=payload.name, description=payload.description)
    db.add(col)
    db.commit()
    db.refresh(col)
    return col


@router.get("/collections", response_model=List[CollectionOut])
def list_collections(request: Request, db: Session = Depends(get_db)):
    admin = get_admin_user(request)
    return db.execute(select(Collection).order_by(Collection.name.asc())).scalars().all()


@router.put("/collections/{collection_id}", response_model=CollectionOut)
def update_collection(collection_id: UUID, payload: CollectionCreate, request: Request, db: Session = Depends(get_db)):
    admin = get_admin_user(request)
    col = db.get(Collection, collection_id)
    if not col:
        raise HTTPException(status_code=404, detail="Not found")
    if payload.name and payload.name != col.name:
        exists = db.execute(select(Collection).where(Collection.name == payload.name)).scalar_one_or_none()
        if exists:
            raise HTTPException(status_code=400, detail="Collection name exists")
    col.name = payload.name or col.name
    col.description = payload.description
    db.commit()
    db.refresh(col)
    return col


@router.delete("/collections/{collection_id}")
def delete_collection(collection_id: UUID, request: Request, db: Session = Depends(get_db)):
    admin = get_admin_user(request)
    from sqlalchemy import delete
    db.execute(delete(Collection).where(Collection.id == collection_id))
    db.commit()
    return {"success": True}


@router.post("/products/{product_id}/collections/{collection_id}")
def assign_collection_to_product(product_id: UUID, collection_id: UUID, request: Request, db: Session = Depends(get_db)):
    admin = get_admin_user(request)
    product = db.get(Product, product_id)
    col = db.get(Collection, collection_id)
    if not product or not col:
        raise HTTPException(status_code=404, detail="Not found")
    exists = db.execute(select(ProductCollectionLink).where(ProductCollectionLink.product_id == product_id, ProductCollectionLink.collection_id == collection_id)).scalar_one_or_none()
    if exists:
        return {"success": True}
    db.add(ProductCollectionLink(product_id=product_id, collection_id=collection_id))
    db.commit()
    return {"success": True}


# Image upload: reuse /shop/media if introduced later. For now, images handled via ProductCreate.image_urls

# Analytics endpoints
@router.get("/analytics/overview")
def get_analytics_overview(request: Request, db: Session = Depends(get_db)):
    """Get overview analytics for the admin dashboard"""
    admin = get_admin_user(request)
    
    # Total users
    total_users = db.query(func.count(User.id)).scalar()
    new_users_today = db.query(func.count(User.id)).filter(
        User.created_at >= datetime.utcnow().date()
    ).scalar()
    
    # Total products
    total_products = db.query(func.count(Product.id)).scalar()
    active_products = db.query(func.count(Product.id)).filter(Product.is_active == True).scalar()
    
    # Total orders and revenue
    total_orders = db.query(func.count(Order.id)).scalar()
    total_revenue = db.query(func.sum(Order.total_cents)).filter(Order.status == "paid").scalar() or 0
    
    # Today's orders and revenue
    today_orders = db.query(func.count(Order.id)).filter(
        Order.created_at >= datetime.utcnow().date()
    ).scalar()
    today_revenue = db.query(func.sum(Order.total_cents)).filter(
        and_(Order.status == "paid", Order.created_at >= datetime.utcnow().date())
    ).scalar() or 0
    
    # Community stats
    total_threads = db.query(func.count(Thread.id)).scalar()
    total_likes = db.query(func.count(Like.id)).scalar()
    total_follows = db.query(func.count(Follow.id)).scalar()
    
    return {
        "users": {
            "total": total_users,
            "new_today": new_users_today
        },
        "products": {
            "total": total_products,
            "active": active_products
        },
        "orders": {
            "total": total_orders,
            "today": today_orders
        },
        "revenue": {
            "total_cents": total_revenue,
            "today_cents": today_revenue
        },
        "community": {
            "threads": total_threads,
            "likes": total_likes,
            "follows": total_follows
        }
    }


@router.get("/analytics/revenue")
def get_revenue_analytics(
    period: str = "7d",  # 7d, 30d, 90d, 1y
    request: Request = None,
    db: Session = Depends(get_db)
):
    """Get revenue analytics for a specific period"""
    admin = get_admin_user(request)
    
    # Calculate date range
    end_date = datetime.utcnow()
    if period == "7d":
        start_date = end_date - timedelta(days=7)
    elif period == "30d":
        start_date = end_date - timedelta(days=30)
    elif period == "90d":
        start_date = end_date - timedelta(days=90)
    elif period == "1y":
        start_date = end_date - timedelta(days=365)
    else:
        start_date = end_date - timedelta(days=7)
    
    # Get daily revenue data
    daily_revenue = db.query(
        func.date(Order.created_at).label('date'),
        func.sum(Order.total_cents).label('revenue'),
        func.count(Order.id).label('orders')
    ).filter(
        and_(
            Order.status == "paid",
            Order.created_at >= start_date,
            Order.created_at <= end_date
        )
    ).group_by(func.date(Order.created_at)).order_by(asc(func.date(Order.created_at))).all()
    
    return {
        "period": period,
        "start_date": start_date.isoformat(),
        "end_date": end_date.isoformat(),
        "daily_data": [
            {
                "date": str(row.date),
                "revenue_cents": row.revenue or 0,
                "orders": row.orders or 0
            }
            for row in daily_revenue
        ]
    }


@router.get("/analytics/top-products")
def get_top_products(
    limit: int = 10,
    request: Request = None,
    db: Session = Depends(get_db)
):
    """Get top selling products"""
    admin = get_admin_user(request)
    
    top_products = db.query(
        Product.id,
        Product.name,
        Product.sku,
        func.sum(OrderItem.quantity).label('total_sold'),
        func.sum(OrderItem.total_cents).label('total_revenue')
    ).join(OrderItem, Product.id == OrderItem.product_id).join(
        Order, OrderItem.order_id == Order.id
    ).filter(Order.status == "paid").group_by(
        Product.id, Product.name, Product.sku
    ).order_by(desc(func.sum(OrderItem.quantity))).limit(limit).all()
    
    return [
        {
            "id": str(product.id),
            "name": product.name,
            "sku": product.sku,
            "total_sold": product.total_sold or 0,
            "total_revenue_cents": product.total_revenue or 0
        }
        for product in top_products
    ]


# User management endpoints
@router.get("/users")
def list_users(
    limit: int = 50,
    offset: int = 0,
    search: str = None,
    request: Request = None,
    db: Session = Depends(get_db)
):
    """List users with pagination and search"""
    admin = get_admin_user(request)
    
    query = db.query(User)
    
    if search:
        query = query.filter(
            User.username.ilike(f"%{search}%") |
            User.email.ilike(f"%{search}%") |
            User.display_name.ilike(f"%{search}%")
        )
    
    total = query.count()
    users = query.offset(offset).limit(limit).all()
    
    return {
        "users": [
            {
                "id": str(user.id),
                "username": user.username,
                "email": user.email,
                "display_name": user.display_name,
                "is_active": user.is_active,
                "is_admin": user.is_admin,
                "is_verified": user.is_verified,
                "created_at": user.created_at.isoformat(),
                "bio": user.bio,
                "avatar_url": user.avatar_url
            }
            for user in users
        ],
        "total": total,
        "limit": limit,
        "offset": offset
    }


@router.put("/users/{user_id}/status")
def update_user_status(
    user_id: UUID,
    is_active: bool,
    request: Request = None,
    db: Session = Depends(get_db)
):
    """Update user active status"""
    admin = get_admin_user(request)
    
    user = db.get(User, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    user.is_active = is_active
    db.commit()
    
    return {"success": True, "user_id": str(user_id), "is_active": is_active}


@router.put("/users/{user_id}/admin")
def update_user_admin_status(
    user_id: UUID,
    is_admin: bool,
    request: Request = None,
    db: Session = Depends(get_db)
):
    """Update user admin status"""
    admin = get_admin_user(request)
    
    user = db.get(User, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    user.is_admin = is_admin
    db.commit()
    
    return {"success": True, "user_id": str(user_id), "is_admin": is_admin}


# Enhanced product management
@router.get("/products")
def list_products_admin(
    limit: int = 50,
    offset: int = 0,
    search: str = None,
    is_active: bool = None,
    gender: str = None,
    request: Request = None,
    db: Session = Depends(get_db)
):
    """List products with enhanced filtering for admin"""
    admin = get_admin_user(request)
    
    query = db.query(Product)
    
    if search:
        query = query.filter(
            Product.name.ilike(f"%{search}%") |
            Product.sku.ilike(f"%{search}%") |
            Product.description.ilike(f"%{search}%")
        )
    
    if is_active is not None:
        query = query.filter(Product.is_active == is_active)
    
    if gender:
        query = query.filter(Product.gender == gender)
    
    total = query.count()
    products = query.offset(offset).limit(limit).all()
    
    result = []
    for p in products:
        tag_names = [link.tag.name for link in p.tags]
        collection_names = [link.collection.name for link in p.collections]
        
        # Calculate total stock
        total_stock = sum(variant.stock_quantity for variant in p.variants)
        
        result.append({
            "id": str(p.id),
            "sku": p.sku,
            "name": p.name,
            "description": p.description,
            "gender": p.gender,
            "price_cents": p.price_cents,
            "currency": p.currency,
            "is_active": p.is_active,
            "created_at": p.created_at.isoformat(),
            "updated_at": p.updated_at.isoformat(),
            "images": [{"url": img.url, "alt_text": img.alt_text} for img in p.images],
            "variants": [
                {
                    "id": str(v.id),
                    "size": v.size,
                    "color": v.color,
                    "stock_quantity": v.stock_quantity
                }
                for v in p.variants
            ],
            "tag_names": tag_names,
            "collection_names": collection_names,
            "total_stock": total_stock
        })
    
    return {
        "products": result,
        "total": total,
        "limit": limit,
        "offset": offset
    }


@router.put("/products/{product_id}")
def update_product(
    product_id: UUID,
    name: str = Form(None),
    description: str = Form(None),
    gender: str = Form(None),
    price_cents: int = Form(None),
    currency: str = Form(None),
    is_active: bool = Form(None),
    request: Request = None,
    db: Session = Depends(get_db)
):
    """Update product details"""
    admin = get_admin_user(request)
    
    product = db.get(Product, product_id)
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    
    if name is not None:
        product.name = name
    if description is not None:
        product.description = description
    if gender is not None:
        product.gender = gender
    if price_cents is not None:
        product.price_cents = price_cents
    if currency is not None:
        product.currency = currency
    if is_active is not None:
        product.is_active = is_active
    
    product.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(product)
    
    return {"success": True, "product_id": str(product_id)}


@router.put("/products/{product_id}/variants/{variant_id}/stock")
def update_variant_stock(
    product_id: UUID,
    variant_id: UUID,
    stock_quantity: int,
    request: Request = None,
    db: Session = Depends(get_db)
):
    """Update product variant stock quantity"""
    admin = get_admin_user(request)
    
    variant = db.get(ProductVariant, variant_id)
    if not variant or variant.product_id != product_id:
        raise HTTPException(status_code=404, detail="Variant not found")
    
    variant.stock_quantity = stock_quantity
    db.commit()
    
    return {"success": True, "variant_id": str(variant_id), "stock_quantity": stock_quantity}


@router.post("/products/{product_id}/variants")
def add_product_variant(
    product_id: UUID,
    size: str = Form(...),
    color: str = Form(None),
    stock_quantity: int = Form(0),
    request: Request = None,
    db: Session = Depends(get_db)
):
    """Add a new variant to a product"""
    admin = get_admin_user(request)
    
    product = db.get(Product, product_id)
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    
    # Check if variant already exists
    existing = db.query(ProductVariant).filter(
        and_(
            ProductVariant.product_id == product_id,
            ProductVariant.size == size,
            ProductVariant.color == color
        )
    ).first()
    
    if existing:
        raise HTTPException(status_code=400, detail="Variant already exists")
    
    variant = ProductVariant(
        product_id=product_id,
        size=size,
        color=color,
        stock_quantity=stock_quantity
    )
    db.add(variant)
    db.commit()
    db.refresh(variant)
    
    return {
        "id": str(variant.id),
        "size": variant.size,
        "color": variant.color,
        "stock_quantity": variant.stock_quantity
    }


# Order management
@router.get("/orders")
def list_orders(
    limit: int = 50,
    offset: int = 0,
    status: str = None,
    request: Request = None,
    db: Session = Depends(get_db)
):
    """List orders with filtering"""
    admin = get_admin_user(request)
    
    query = db.query(Order)
    
    if status:
        query = query.filter(Order.status == status)
    
    total = query.count()
    orders = query.order_by(desc(Order.created_at)).offset(offset).limit(limit).all()
    
    result = []
    for order in orders:
        result.append({
            "id": str(order.id),
            "user_id": str(order.user_id) if order.user_id else None,
            "status": order.status,
            "payment_provider": order.payment_provider,
            "payment_id": order.payment_id,
            "total_cents": order.total_cents,
            "currency": order.currency,
            "created_at": order.created_at.isoformat(),
            "updated_at": order.updated_at.isoformat(),
            "items": [
                {
                    "id": str(item.id),
                    "product_id": str(item.product_id) if item.product_id else None,
                    "variant_id": str(item.variant_id) if item.variant_id else None,
                    "quantity": item.quantity,
                    "unit_price_cents": item.unit_price_cents,
                    "total_cents": item.total_cents
                }
                for item in order.items
            ]
        })
    
    return {
        "orders": result,
        "total": total,
        "limit": limit,
        "offset": offset
    }


@router.put("/orders/{order_id}/status")
def update_order_status(
    order_id: UUID,
    status: str,
    request: Request = None,
    db: Session = Depends(get_db)
):
    """Update order status"""
    admin = get_admin_user(request)
    
    order = db.get(Order, order_id)
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    
    valid_statuses = ["pending", "paid", "shipped", "delivered", "cancelled", "refunded"]
    if status not in valid_statuses:
        raise HTTPException(status_code=400, detail=f"Invalid status. Must be one of: {valid_statuses}")
    
    order.status = status
    order.updated_at = datetime.utcnow()
    db.commit()
    
    return {"success": True, "order_id": str(order_id), "status": status}


# Community management
@router.get("/community/stats")
def get_community_stats(request: Request = None, db: Session = Depends(get_db)):
    """Get community statistics"""
    admin = get_admin_user(request)
    
    total_threads = db.query(func.count(Thread.id)).scalar()
    total_likes = db.query(func.count(Like.id)).scalar()
    total_reposts = db.query(func.count(Repost.id)).scalar()
    total_bookmarks = db.query(func.count(Bookmark.id)).scalar()
    total_follows = db.query(func.count(Follow.id)).scalar()
    
    # Recent activity
    recent_threads = db.query(func.count(Thread.id)).filter(
        Thread.created_at >= datetime.utcnow() - timedelta(days=7)
    ).scalar()
    
    recent_likes = db.query(func.count(Like.id)).filter(
        Like.created_at >= datetime.utcnow() - timedelta(days=7)
    ).scalar()
    
    return {
        "total_threads": total_threads,
        "total_likes": total_likes,
        "total_reposts": total_reposts,
        "total_bookmarks": total_bookmarks,
        "total_follows": total_follows,
        "recent_threads": recent_threads,
        "recent_likes": recent_likes
    }


@router.get("/community/threads")
def list_threads(
    limit: int = 50,
    offset: int = 0,
    request: Request = None,
    db: Session = Depends(get_db)
):
    """List community threads"""
    admin = get_admin_user(request)
    
    threads = db.query(Thread).order_by(desc(Thread.created_at)).offset(offset).limit(limit).all()
    total = db.query(func.count(Thread.id)).scalar()
    
    return {
        "threads": [
            {
                "id": str(thread.id),
                "content": thread.content,
                "author_id": str(thread.author_id),
                "author_username": thread.author.username if thread.author else None,
                "created_at": thread.created_at.isoformat(),
                "likes_count": len(thread.likes),
                "reposts_count": len(thread.reposts),
                "bookmarks_count": len(thread.bookmarks)
            }
            for thread in threads
        ],
        "total": total,
        "limit": limit,
        "offset": offset
    }


@router.delete("/community/threads/{thread_id}")
def delete_thread(
    thread_id: UUID,
    request: Request = None,
    db: Session = Depends(get_db)
):
    """Delete a community thread"""
    admin = get_admin_user(request)
    
    thread = db.get(Thread, thread_id)
    if not thread:
        raise HTTPException(status_code=404, detail="Thread not found")
    
    db.delete(thread)
    db.commit()
    
    return {"success": True, "thread_id": str(thread_id)}
