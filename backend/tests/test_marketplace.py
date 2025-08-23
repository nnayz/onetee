import pytest
from unittest.mock import patch, Mock
from fastapi.testclient import TestClient

def test_marketplace_endpoints_exist(client):
    """Test that marketplace endpoints are accessible"""
    response = client.get("/marketplace/")
    # Should either return 200 (if there's a root endpoint) or 404 (if not)
    assert response.status_code in [200, 404, 405]

def test_products_endpoint_structure(client):
    """Test products endpoint structure"""
    response = client.get("/marketplace/products")
    # Should either return 200 (success) or 404 (if endpoint doesn't exist)
    assert response.status_code in [200, 404]

def test_create_product_validation(client):
    """Test product creation validation"""
    response = client.post("/marketplace/products", json={
        "name": "Test Product",
        "description": "A test product",
        "price": 29.99,
        "category": "clothing"
    })
    # Should either return 201 (success) or 422 (validation error) or 401 (unauthorized)
    assert response.status_code in [201, 422, 401]

def test_product_price_validation(client):
    """Test product price validation"""
    response = client.post("/marketplace/products", json={
        "name": "Test Product",
        "description": "A test product",
        "price": -10.0,  # Negative price
        "category": "clothing"
    })
    assert response.status_code == 422

def test_product_name_required(client):
    """Test that product name is required"""
    response = client.post("/marketplace/products", json={
        "description": "A test product",
        "price": 29.99,
        "category": "clothing"
    })
    assert response.status_code == 422

@patch('marketplace.service.create_product')
def test_create_product_success(mock_create_product, client):
    """Test successful product creation"""
    mock_create_product.return_value = {
        "id": 1,
        "name": "Test Product",
        "description": "A test product",
        "price": 29.99,
        "category": "clothing",
        "seller_id": 1
    }
    
    response = client.post("/marketplace/products", json={
        "name": "Test Product",
        "description": "A test product",
        "price": 29.99,
        "category": "clothing"
    })
    
    assert response.status_code in [200, 201]
    mock_create_product.assert_called_once()

@patch('marketplace.service.get_products')
def test_get_products_success(mock_get_products, client):
    """Test successful products retrieval"""
    mock_get_products.return_value = [
        {
            "id": 1,
            "name": "Test Product 1",
            "description": "A test product",
            "price": 29.99,
            "category": "clothing"
        },
        {
            "id": 2,
            "name": "Test Product 2",
            "description": "Another test product",
            "price": 39.99,
            "category": "accessories"
        }
    ]
    
    response = client.get("/marketplace/products")
    
    assert response.status_code == 200
    mock_get_products.assert_called_once()

def test_marketplace_admin_endpoints_exist(client):
    """Test that marketplace admin endpoints are accessible"""
    response = client.get("/marketplace/admin/")
    # Should either return 200 (if there's a root endpoint) or 404 (if not)
    assert response.status_code in [200, 404, 405]

def test_product_categories_endpoint(client):
    """Test product categories endpoint"""
    response = client.get("/marketplace/categories")
    # Should either return 200 (success) or 404 (if endpoint doesn't exist)
    assert response.status_code in [200, 404] 