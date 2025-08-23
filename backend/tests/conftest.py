import pytest
from fastapi.testclient import TestClient
from api.main import app
from unittest.mock import Mock, patch
import os

@pytest.fixture
def client():
    """Create a test client for the FastAPI app"""
    return TestClient(app)

@pytest.fixture
def mock_env_vars():
    """Mock environment variables for testing"""
    with patch.dict(os.environ, {
        'DATABASE_URL': 'sqlite:///./test.db',
        'SECRET_KEY': 'test-secret-key',
        'ALGORITHM': 'HS256',
        'ACCESS_TOKEN_EXPIRE_MINUTES': '30',
        'CORS_ORIGINS': 'http://localhost:3000,http://localhost:5173'
    }):
        yield

@pytest.fixture
def mock_db_session():
    """Mock database session"""
    mock_session = Mock()
    return mock_session

@pytest.fixture
def sample_user_data():
    """Sample user data for testing"""
    return {
        "email": "test@example.com",
        "password": "testpassword123",
        "username": "testuser",
        "full_name": "Test User"
    }

@pytest.fixture
def sample_product_data():
    """Sample product data for testing"""
    return {
        "name": "Test Product",
        "description": "A test product",
        "price": 29.99,
        "category": "clothing",
        "images": ["image1.jpg", "image2.jpg"]
    } 