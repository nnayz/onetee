from typing import Optional, List
from uuid import UUID
from datetime import datetime

from pydantic import BaseModel, Field


class ORMModel(BaseModel):
    model_config = {"from_attributes": True}


class TagCreate(BaseModel):
    name: str = Field(min_length=1, max_length=64)
    description: Optional[str] = None


class TagOut(ORMModel):
    id: UUID
    name: str
    description: Optional[str] = None
    created_at: datetime


class ProductImageOut(ORMModel):
    id: UUID
    url: str
    alt_text: Optional[str]
    position: int


class ProductVariantOut(ORMModel):
    id: UUID
    size: str
    color: Optional[str]
    stock_quantity: int


class ProductCreate(BaseModel):
    sku: str
    name: str
    description: Optional[str] = None
    gender: str = Field(pattern="^(men|women)$")
    price_cents: int = Field(ge=0)
    currency: str = Field(default="INR")
    image_urls: List[str] = Field(default_factory=list)
    sizes: List[str] = Field(default_factory=list)
    colors: List[str] = Field(default_factory=list)
    tags: List[str] = Field(default_factory=list)  # tag names


class ProductOut(ORMModel):
    id: UUID
    sku: str
    name: str
    description: Optional[str]
    gender: str
    price_cents: int
    currency: str
    is_active: bool
    created_at: datetime
    updated_at: datetime
    images: List[ProductImageOut] = []
    variants: List[ProductVariantOut] = []
    tag_names: List[str] = []


class CartItem(BaseModel):
    product_id: UUID
    variant_id: Optional[UUID] = None
    quantity: int = Field(ge=1)


class CreateOrderRequest(BaseModel):
    items: List[CartItem]


class OrderItemOut(ORMModel):
    id: UUID
    product_id: Optional[UUID]
    variant_id: Optional[UUID]
    quantity: int
    unit_price_cents: int
    total_cents: int


class OrderOut(ORMModel):
    id: UUID
    status: str
    total_cents: int
    currency: str
    created_at: datetime
    items: List[OrderItemOut]


class CheckoutSession(BaseModel):
    checkout_url: str

