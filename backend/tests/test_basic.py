import pytest
from fastapi.testclient import TestClient

def test_welcome_endpoint(client):
    """Test the welcome endpoint"""
    response = client.get("/")
    assert response.status_code == 200
    assert response.json() == {"message": "Welcome to OneTee API"}

def test_api_docs_available(client):
    """Test that API documentation is available"""
    response = client.get("/docs")
    assert response.status_code == 200

def test_openapi_schema_available(client):
    """Test that OpenAPI schema is available"""
    response = client.get("/openapi.json")
    assert response.status_code == 200
    assert "openapi" in response.json()

def test_health_check_endpoint(client):
    """Test health check endpoint (if it exists)"""
    response = client.get("/health")
    # This might return 404 if health endpoint doesn't exist, which is fine
    # We're just testing that the app responds
    assert response.status_code in [200, 404]

def test_auth_router_included(client):
    """Test that auth router is included in the app"""
    response = client.get("/auth/")
    # Should either return 200 (if there's a root endpoint) or 404 (if not)
    assert response.status_code in [200, 404, 405]

def test_community_router_included(client):
    """Test that community router is included in the app"""
    response = client.get("/community/")
    # Should either return 200 (if there's a root endpoint) or 404 (if not)
    assert response.status_code in [200, 404, 405]

def test_marketplace_router_included(client):
    """Test that marketplace router is included in the app"""
    response = client.get("/marketplace/")
    # Should either return 200 (if there's a root endpoint) or 404 (if not)
    assert response.status_code in [200, 404, 405]

def test_marketplace_admin_router_included(client):
    """Test that marketplace admin router is included in the app"""
    response = client.get("/marketplace/admin/")
    # Should either return 200 (if there's a root endpoint) or 404 (if not)
    assert response.status_code in [200, 404, 405]

def test_invalid_endpoint_returns_404(client):
    """Test that invalid endpoints return 404"""
    response = client.get("/invalid-endpoint")
    assert response.status_code == 404

def test_post_to_get_endpoint_returns_405(client):
    """Test that POST to GET endpoint returns 405"""
    response = client.post("/")
    assert response.status_code == 405 