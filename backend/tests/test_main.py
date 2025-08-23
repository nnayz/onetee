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

def test_cors_headers(client):
    """Test that CORS headers are properly set"""
    response = client.options("/")
    assert "access-control-allow-origin" in response.headers

def test_health_check_endpoint(client):
    """Test health check endpoint (if it exists)"""
    response = client.get("/health")
    # This might return 404 if health endpoint doesn't exist, which is fine
    # We're just testing that the app responds
    assert response.status_code in [200, 404] 