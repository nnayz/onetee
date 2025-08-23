from typing import List
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, status
from sqlalchemy.orm import Session
from sqlalchemy import select

from database import get_db
from auth.deps import get_admin_user
from ..service import MarketplaceService
from ..schemas import TagCreate, TagOut, ProductCreate, ProductOut, CollectionCreate, CollectionOut
from ..models import Product, ProductTag, ProductTagLink, Collection, ProductCollectionLink
from storage.minio_service import MinioService


router = APIRouter(prefix="/admin", tags=["Admin"])
service = MarketplaceService()
minio = MinioService()

# Login endpoint 
@router.post('/login', response_model=bool)
async def login(username: str, password: str):
    try:
        admin = get_admin_user(username, password)
        if not admin:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials")
        return True
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail=str(e))



# Tags CRUD
@router.post("/tags", response_model=TagOut)
def create_tag(payload: TagCreate, db: Session = Depends(get_db), admin=Depends(get_admin_user)):
    return service.create_tag(db, name=payload.name, description=payload.description)


@router.get("/tags", response_model=List[TagOut])
def list_tags(db: Session = Depends(get_db), admin=Depends(get_admin_user)):
    return service.list_tags(db)


@router.delete("/tags/{tag_id}")
def delete_tag(tag_id: UUID, db: Session = Depends(get_db), admin=Depends(get_admin_user)):
    from sqlalchemy import delete
    tag = db.get(ProductTag, tag_id)
    if not tag:
        raise HTTPException(status_code=404, detail="Tag not found")
    db.execute(delete(ProductTag).where(ProductTag.id == tag_id))
    db.commit()
    return {"success": True}


@router.put("/tags/{tag_id}", response_model=TagOut)
def update_tag(tag_id: UUID, payload: TagCreate, db: Session = Depends(get_db), admin=Depends(get_admin_user)):
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
    db: Session = Depends(get_db), # database session
    admin=Depends(get_admin_user), # admin user
):
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
def delete_product(product_id: UUID, db: Session = Depends(get_db), admin=Depends(get_admin_user)):
    # delete product from minio
    product = db.get(Product, product_id)
    if not product:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Product not found")
    for image in product.images:
        minio.delete_object(image)
    service.delete_product(db, product_id=product_id)
    return {"success": True}


@router.post("/products/{product_id}/tags/{tag_id}")
def assign_tag_to_product(product_id: UUID, tag_id: UUID, db: Session = Depends(get_db), admin=Depends(get_admin_user)):
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
def create_collection(payload: CollectionCreate, db: Session = Depends(get_db), admin=Depends(get_admin_user)):
    existing = db.execute(select(Collection).where(Collection.name == payload.name)).scalar_one_or_none()
    if existing:
        return existing
    col = Collection(name=payload.name, description=payload.description)
    db.add(col)
    db.commit()
    db.refresh(col)
    return col


@router.get("/collections", response_model=List[CollectionOut])
def list_collections(db: Session = Depends(get_db), admin=Depends(get_admin_user)):
    return db.execute(select(Collection).order_by(Collection.name.asc())).scalars().all()


@router.put("/collections/{collection_id}", response_model=CollectionOut)
def update_collection(collection_id: UUID, payload: CollectionCreate, db: Session = Depends(get_db), admin=Depends(get_admin_user)):
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
def delete_collection(collection_id: UUID, db: Session = Depends(get_db), admin=Depends(get_admin_user)):
    from sqlalchemy import delete
    db.execute(delete(Collection).where(Collection.id == collection_id))
    db.commit()
    return {"success": True}


@router.post("/products/{product_id}/collections/{collection_id}")
def assign_collection_to_product(product_id: UUID, collection_id: UUID, db: Session = Depends(get_db), admin=Depends(get_admin_user)):
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
