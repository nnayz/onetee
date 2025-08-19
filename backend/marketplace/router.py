from typing import List
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.orm import Session

from database import get_db
from auth.deps import get_current_user, get_admin_user
from .service import MarketplaceService
from .schemas import ProductCreate, ProductOut, TagCreate, TagOut, OrderOut, CreateOrderRequest, CheckoutSession
from .models import Product, ProductTag, Order


router = APIRouter(prefix="/shop", tags=["Shop"])
service = MarketplaceService()


@router.get("/products", response_model=List[ProductOut])
def list_products(gender: str | None = None, tag: str | None = None, limit: int = 50, offset: int = 0, db: Session = Depends(get_db)):
    products = service.list_products(db, gender=gender, tag=tag, limit=limit, offset=offset)
    # adapt tag names
    result: list[dict] = []
    for p in products:
        tag_names = [link.tag.name for link in p.tags]
        result.append({
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
            "tag_names": tag_names,
        })
    return result


@router.get("/products/search", response_model=List[ProductOut])
def search_products(q: str, limit: int = 50, offset: int = 0, db: Session = Depends(get_db)):
    products = service.search_products(db, query=q, limit=limit, offset=offset)
    result: list[dict] = []
    for p in products:
        tag_names = [link.tag.name for link in p.tags]
        result.append({
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
            "tag_names": tag_names,
        })
    return result


@router.get("/products/{product_id}", response_model=ProductOut)
def get_product(product_id: UUID, db: Session = Depends(get_db)):
    p = service.get_product(db, product_id=product_id)
    if not p:
        raise HTTPException(status_code=404, detail="Not found")
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


# Admin endpoints moved to a dedicated admin router


@router.get("/tags", response_model=List[TagOut])
def list_tags(db: Session = Depends(get_db)):
    return service.list_tags(db)


# Admin endpoints moved to a dedicated admin router


# Admin endpoints moved to a dedicated admin router


@router.post("/orders", response_model=OrderOut)
def create_order(payload: CreateOrderRequest, db: Session = Depends(get_db), user=Depends(get_current_user)):
    items = [(i.product_id, i.variant_id, i.quantity) for i in payload.items]
    order = service.create_order(db, user_id=user.id, items=items)
    return order


# Stripe integration - create checkout session
@router.post("/orders/{order_id}/checkout", response_model=CheckoutSession)
def start_checkout(order_id: UUID, db: Session = Depends(get_db), user=Depends(get_current_user)):
    order = db.get(Order, order_id)
    if not order or order.user_id != user.id:
        raise HTTPException(status_code=404, detail="Order not found")
    import os
    import stripe
    secret = os.getenv("STRIPE_SECRET_KEY")
    public_url = os.getenv("PUBLIC_URL") or "http://localhost:5173"
    if not secret:
        raise HTTPException(status_code=500, detail="Payment not configured")
    stripe.api_key = secret

    line_items = []
    for item in order.items:
        product = db.get(Product, item.product_id) if item.product_id else None
        name = product.name if product else "Item"
        line_items.append({
            "quantity": item.quantity,
            "price_data": {
                "currency": order.currency.lower(),
                "product_data": {"name": name},
                "unit_amount": item.unit_price_cents,
            },
        })

    session = stripe.checkout.Session.create(
        mode="payment",
        line_items=line_items,
        success_url=f"{public_url}/community?checkout=success",
        cancel_url=f"{public_url}/community?checkout=cancel",
        metadata={"order_id": str(order.id)},
    )

    order.payment_provider = "stripe"
    order.payment_id = session.get("payment_intent") or session.get("id")
    db.commit()

    return {"checkout_url": session.url}


# Admin endpoints moved to a dedicated admin router


@router.post("/webhook/stripe")
async def stripe_webhook(request: Request, db: Session = Depends(get_db)):
    import os
    import stripe
    payload = await request.body()
    sig_header = request.headers.get("stripe-signature") or request.headers.get("Stripe-Signature")
    secret = os.getenv("STRIPE_WEBHOOK_SECRET")
    event = None
    stripe.api_key = os.getenv("STRIPE_SECRET_KEY")
    try:
        if secret and sig_header:
            event = stripe.Webhook.construct_event(payload, sig_header, secret)
        else:
            event = stripe.Event.construct_from(await request.json(), stripe.api_key)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid webhook")

    type_ = event.get("type")
    data = event.get("data", {}).get("object", {})
    order_id = None
    if type_ == "checkout.session.completed":
        order_id = (data.get("metadata") or {}).get("order_id")
        payment_intent = data.get("payment_intent")
        status = "paid"
    elif type_ == "payment_intent.succeeded":
        order_id = (data.get("metadata") or {}).get("order_id")
        payment_intent = data.get("id")
        status = "paid"
    else:
        return {"received": True}

    if not order_id:
        return {"received": True}

    order = db.get(Order, order_id)
    if order:
        order.status = status
        order.payment_provider = "stripe"
        if payment_intent:
            order.payment_id = payment_intent
        db.commit()

    return {"received": True}

